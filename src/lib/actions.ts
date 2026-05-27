"use server";

// Write layer for the /editable grid. Each action maps a camelCase record to
// Airtable's field names (via editable-schema), calls the Airtable REST API,
// then invalidates the shared "airtable" cache tag so every page shows the
// change immediately (read-your-own-writes), and refreshes the current route.

import { refresh, updateTag } from "next/cache";
import { BASE_ID, TABLES, isAirtableConfigured } from "./airtable";
import { ENTITY_SCHEMAS, toAirtableFields, type EntityKey } from "./editable-schema";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function tableId(entity: EntityKey): string {
  return TABLES[ENTITY_SCHEMAS[entity].tableKey];
}

function airtableUrl(entity: EntityKey, recordId?: string): string {
  const base = `https://api.airtable.com/v0/${BASE_ID}/${tableId(entity)}`;
  return recordId ? `${base}/${recordId}` : base;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/** Turn a non-OK Airtable response into a short, user-facing message. */
async function describeError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string; type?: string } };
    detail = body?.error?.message || body?.error?.type || "";
  } catch {
    // non-JSON body — fall through to status-only message
  }
  if (res.status === 403) {
    return "Airtable rejected the write (403). The API token needs the data.records:write scope on this base.";
  }
  if (res.status === 404) {
    return "Record not found (404) — it may have been deleted already.";
  }
  return `Airtable responded ${res.status}${detail ? `: ${detail}` : ""}`;
}

/** Invalidate the shared tag and refresh the current route after a write. */
function propagate(): void {
  updateTag("airtable");
  refresh();
}

export async function updateRecord(
  entity: EntityKey,
  id: string,
  patch: Record<string, unknown>,
): Promise<ActionResult> {
  if (!isAirtableConfigured()) {
    return { ok: false, error: "AIRTABLE_API_KEY is not set." };
  }

  const { fields, errors } = toAirtableFields(entity, patch);
  if (errors.length > 0) return { ok: false, error: errors.join("; ") };

  try {
    const res = await fetch(airtableUrl(entity, id), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!res.ok) return { ok: false, error: await describeError(res) };
    propagate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function createRecord(
  entity: EntityKey,
  values: Record<string, unknown>,
): Promise<ActionResult<{ id: string }>> {
  if (!isAirtableConfigured()) {
    return { ok: false, error: "AIRTABLE_API_KEY is not set." };
  }

  const { fields, errors } = toAirtableFields(entity, values);
  if (errors.length > 0) return { ok: false, error: errors.join("; ") };

  try {
    const res = await fetch(airtableUrl(entity), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!res.ok) return { ok: false, error: await describeError(res) };
    const created = (await res.json()) as { id: string };
    propagate();
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function deleteRecord(
  entity: EntityKey,
  id: string,
): Promise<ActionResult> {
  if (!isAirtableConfigured()) {
    return { ok: false, error: "AIRTABLE_API_KEY is not set." };
  }

  try {
    const res = await fetch(airtableUrl(entity, id), {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) return { ok: false, error: await describeError(res) };
    propagate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
