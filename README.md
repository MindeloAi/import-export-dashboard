# TradeBridge — Import/Export Brokerage Dashboard

A back-office dashboard for an import/export **middleman**: the broker who sources
goods from suppliers, sells them to buyers, and earns the margin. Built with
**Next.js 16 (App Router) + TypeScript + Tailwind CSS**, reading from **Airtable**.

> Demo project. Data is read-only and served from a seeded Airtable base.

## Pages

| Page          | What it shows                                                        |
| ------------- | -------------------------------------------------------------------- |
| **Overview**  | KPI cards (open pipeline value, realized margin, partners, shipments in transit) plus a margin-over-time area chart and a deal-value-by-stage funnel. |
| **Deals**     | Every brokered transaction with buy/sell totals, computed margin & %, status, searchable and filterable by stage. |
| **Contacts**  | Supplier/buyer directory, filterable by type and country.            |
| **Products**  | Catalog of goods with buy/sell prices and computed unit margin/markup. |
| **Shipments** | Freight tracker per deal — route, carrier, container, Incoterm, ETD/ETA, filterable by status. |

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Airtable token
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable           | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `AIRTABLE_API_KEY` | Airtable Personal Access Token with `data.records:read` scope on the base. Create one at https://airtable.com/create/tokens. |
| `AIRTABLE_BASE_ID` | The demo base ID (defaults to `appmNmeqxOSiWTPud`).                       |

Until `AIRTABLE_API_KEY` is set, every page renders a setup notice instead of data,
so the UI shell is always viewable.

## Airtable schema

Base: **Import/Export Brokerage (Demo)** — four tables.

- **Contacts** — Name, Type (Supplier/Buyer/Both), Contact Person, Email, Phone, Country, Goods Category, Status, Notes
- **Products** — Product, Category, Unit, Supplier, Buy Price, Sell Price, Notes
- **Deals** — Deal, Supplier, Buyer, Product, Quantity, Buy Total, Sell Total, Status (Lead → Cancelled), Date Opened, Expected Close, Notes
- **Shipments** — Reference, Deal, Status (Pending → Delivered), Origin/Destination Port, Carrier, Container No, Incoterm, ETD, ETA, Notes

Margins are computed in the app (`src/lib/types.ts`) rather than stored, so prices
stay the single source of truth.

## Project structure

```
src/
  app/            # routes: / (overview), /deals, /contacts, /products, /shipments
  components/     # Sidebar, KpiCard, StatusBadge, Charts, *View filters
  lib/
    airtable.ts   # typed read-only data access (one fn per table)
    types.ts      # domain types + margin helpers
    format.ts     # currency/date formatting
```

The data layer is read-only by design; create/edit can be layered on later via
Route Handlers or Server Actions without changing the page structure.
