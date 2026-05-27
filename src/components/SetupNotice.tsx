/**
 * Shown on every page until an Airtable Personal Access Token is supplied.
 * Keeps the demo usable (full UI shell renders) while data is not yet wired.
 */
export function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-lg font-semibold text-amber-900">
        Connect your Airtable token to load data
      </h2>
      <p className="mt-2 text-sm text-amber-800">
        The demo base is already created and seeded. Add a read-only Airtable
        Personal Access Token to start showing live records.
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-amber-800">
        <li>
          Create a token at{" "}
          <a
            className="font-medium underline"
            href="https://airtable.com/create/tokens"
            target="_blank"
            rel="noreferrer"
          >
            airtable.com/create/tokens
          </a>{" "}
          with the <code className="rounded bg-amber-100 px-1">data.records:read</code>{" "}
          scope on this base.
        </li>
        <li>
          Paste it into <code className="rounded bg-amber-100 px-1">.env.local</code> as{" "}
          <code className="rounded bg-amber-100 px-1">AIRTABLE_API_KEY=…</code>
        </li>
        <li>Restart the dev server — the dashboard fills in automatically.</li>
      </ol>
    </div>
  );
}
