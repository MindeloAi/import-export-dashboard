"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ENTITY_SCHEMAS,
  type EntityKey,
  type FieldDescriptor,
} from "@/lib/editable-schema";
import { createRecord, deleteRecord, updateRecord } from "@/lib/actions";

type RecordLike = { id: string } & Record<string, unknown>;

interface Row {
  id: string;
  values: Record<string, string>;
  baseline: Record<string, string>;
  isNew?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

/** Convert one domain record to the string cell values the grid edits. */
function recordToValues(
  fields: FieldDescriptor[],
  record: Record<string, unknown>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = record[f.key];
    if (raw == null) {
      values[f.key] = "";
    } else if (f.type === "date") {
      // <input type="date"> wants YYYY-MM-DD — drop any time portion.
      values[f.key] = String(raw).split("T")[0];
    } else {
      values[f.key] = String(raw);
    }
  }
  return values;
}

function makeRow(fields: FieldDescriptor[], record: RecordLike): Row {
  const values = recordToValues(fields, record);
  return { id: record.id, values, baseline: { ...values } };
}

function isDirty(row: Row): boolean {
  return Object.keys(row.values).some(
    (k) => row.values[k] !== row.baseline[k],
  );
}

export function EditableGrid({
  entity,
  initialRecords,
}: {
  entity: EntityKey;
  initialRecords: RecordLike[];
}) {
  const { fields, singular } = ENTITY_SCHEMAS[entity];
  const requiredKey = fields.find((f) => f.required)?.key;

  const [rows, setRows] = useState<Row[]>(() =>
    initialRecords.map((r) => makeRow(fields, r)),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Reseed from the server after a mutation's refresh(). Keep unsaved new rows
  // and preserve in-progress edits on existing rows (matched by id).
  useEffect(() => {
    setRows((prev) => {
      const prevById = new Map(prev.map((r) => [r.id, r]));
      const pendingNew = prev.filter((r) => r.isNew);
      const serverRows = initialRecords.map((rec) => {
        const serverValues = recordToValues(fields, rec);
        const existing = prevById.get(rec.id);
        if (existing && !existing.isNew && isDirty(existing)) {
          // Keep the user's unsaved edits; refresh the baseline to server state.
          return { id: rec.id, values: existing.values, baseline: serverValues };
        }
        return { id: rec.id, values: serverValues, baseline: { ...serverValues } };
      });
      return [...pendingNew, ...serverRows];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecords]);

  function setCell(rowId: string, key: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, values: { ...r.values, [key]: value } } : r,
      ),
    );
  }

  function clearError(rowId: string) {
    setErrors((prev) => {
      if (!(rowId in prev)) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }

  function setError(rowId: string, message: string) {
    setErrors((prev) => ({ ...prev, [rowId]: message }));
  }

  function addRow() {
    const id = `new-${crypto.randomUUID()}`;
    const empty: Record<string, string> = {};
    for (const f of fields) empty[f.key] = "";
    setRows((prev) => [
      { id, values: empty, baseline: { ...empty }, isNew: true },
      ...prev,
    ]);
  }

  function saveRow(row: Row) {
    clearError(row.id);
    setBusyId(row.id);
    startTransition(async () => {
      try {
        if (row.isNew) {
          if (requiredKey && row.values[requiredKey].trim() === "") {
            setError(row.id, `${fields.find((f) => f.key === requiredKey)?.label} is required`);
            return;
          }
          const res = await createRecord(entity, row.values);
          if (!res.ok) {
            setError(row.id, res.error);
            return;
          }
          const newId = res.data!.id;
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id
                ? { ...r, id: newId, isNew: false, baseline: { ...r.values } }
                : r,
            ),
          );
        } else {
          // Send only changed fields.
          const patch: Record<string, string> = {};
          for (const k of Object.keys(row.values)) {
            if (row.values[k] !== row.baseline[k]) patch[k] = row.values[k];
          }
          if (Object.keys(patch).length === 0) return;
          const res = await updateRecord(entity, row.id, patch);
          if (!res.ok) {
            setError(row.id, res.error);
            return;
          }
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id ? { ...r, baseline: { ...r.values } } : r,
            ),
          );
        }
      } finally {
        setBusyId(null);
      }
    });
  }

  function removeRow(row: Row) {
    if (row.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      clearError(row.id);
      return;
    }
    if (!window.confirm(`Delete this ${singular}? This can't be undone.`)) return;
    clearError(row.id);
    setBusyId(row.id);
    startTransition(async () => {
      try {
        const res = await deleteRecord(entity, row.id);
        if (!res.ok) {
          setError(row.id, res.error);
          return;
        }
        setRows((prev) => prev.filter((r) => r.id !== row.id));
      } finally {
        setBusyId(null);
      }
    });
  }

  const newCount = rows.filter((r) => r.isNew).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          + Add {singular}
        </button>
        <span className="ml-auto text-sm text-slate-400">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
          {newCount > 0 ? ` · ${newCount} unsaved` : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.key}>
                  {f.label}
                  {f.required ? <span className="text-rose-500"> *</span> : ""}
                </th>
              ))}
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const dirty = row.isNew || isDirty(row);
              const busy = busyId === row.id && isPending;
              return (
                <FragmentRow key={row.id}>
                  <tr className={row.isNew ? "bg-indigo-50/40" : undefined}>
                    {fields.map((f) => (
                      <td key={f.key} className={f.type === "number" ? "num" : undefined}>
                        <CellInput
                          field={f}
                          value={row.values[f.key]}
                          disabled={busy}
                          onChange={(v) => setCell(row.id, f.key, v)}
                        />
                      </td>
                    ))}
                    <td>
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => saveRow(row)}
                          disabled={!dirty || busy}
                          className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {busy ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(row)}
                          disabled={busy}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {errors[row.id] && (
                    <tr>
                      <td colSpan={fields.length + 1} className="!py-2">
                        <p className="text-xs text-rose-600">{errors[row.id]}</p>
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={fields.length + 1}
                  className="py-10 text-center text-slate-400"
                >
                  No {singular} records yet. Use “Add {singular}” to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Renders the right input for a field type. All values are strings. */
function CellInput({
  field,
  value,
  disabled,
  onChange,
}: {
  field: FieldDescriptor;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  if (field.type === "select") {
    return (
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} min-w-[8rem]`}
      >
        <option value="">—</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "multiline") {
    return (
      <textarea
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} min-w-[12rem] resize-y`}
      />
    );
  }

  const typeAttr =
    field.type === "number"
      ? "number"
      : field.type === "date"
        ? "date"
        : field.type === "email"
          ? "email"
          : field.type === "url"
            ? "url"
            : field.type === "phone"
              ? "tel"
              : "text";

  const widthClass =
    field.type === "number"
      ? "min-w-[6rem] text-right"
      : field.type === "date"
        ? "min-w-[9rem]"
        : "min-w-[8rem]";

  return (
    <input
      type={typeAttr}
      inputMode={field.type === "number" ? "decimal" : undefined}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${widthClass}`}
    />
  );
}

/** Group the data row with its optional error row without extra DOM. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
