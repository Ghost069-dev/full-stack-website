<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (Sehat Saathi)

- Zone classification (green/yellow/red) is deterministic code in `src/lib/health/zones.ts`, never AI output — medical safety needs predictable, tested rules (`zones.test.ts`).
- Patient-facing explanations and doctor questions come from fixed bilingual sentences in `src/lib/health/catalog.ts` / `report.ts`; AI is used only to extract numbers from uploaded reports (`src/lib/server/report-ai.server.ts`). Never let AI generate medicine or treatment advice.
- All UI strings live in the `dict` in `src/lib/i18n.tsx` with both `hi` and `en`; components read them via `useLang().t`.
- Server-only modules (`*.server.ts`) are imported dynamically inside `createServerFn` handlers so they never enter the client bundle.
- Consultation bookings are inserted server-side via `submitConsultation` with the publishable key; the table allows anonymous INSERT only (no read access from the site).
