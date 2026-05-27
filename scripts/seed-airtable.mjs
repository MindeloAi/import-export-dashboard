// Creates the 4 brokerage tables in the target Airtable base and seeds demo data.
// Usage: AIRTABLE_API_KEY=... AIRTABLE_BASE_ID=... node scripts/seed-airtable.mjs
// Requires a token with scopes: schema.bases:read/write, data.records:read/write.

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!API_KEY || !BASE_ID) {
  console.error("Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID env vars.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const iso = { dateFormat: { name: "iso" } };
const usd = { precision: 2, symbol: "$" };
const select = (...names) => ({ choices: names.map((name) => ({ name })) });

const TABLES = [
  {
    name: "Contacts",
    fields: [
      { name: "Name", type: "singleLineText" },
      { name: "Type", type: "singleSelect", options: select("Supplier", "Buyer", "Both") },
      { name: "Contact Person", type: "singleLineText" },
      { name: "Email", type: "email" },
      { name: "Phone", type: "phoneNumber" },
      { name: "Country", type: "singleLineText" },
      { name: "Goods Category", type: "singleLineText" },
      { name: "Status", type: "singleSelect", options: select("Active", "Inactive") },
      { name: "Notes", type: "multilineText" },
    ],
  },
  {
    name: "Products",
    fields: [
      { name: "Product", type: "singleLineText" },
      { name: "Category", type: "singleLineText" },
      { name: "Unit", type: "singleSelect", options: select("Unit", "Kg", "Pallet", "Container") },
      { name: "Supplier", type: "singleLineText" },
      { name: "Buy Price", type: "currency", options: usd },
      { name: "Sell Price", type: "currency", options: usd },
      { name: "Notes", type: "multilineText" },
    ],
  },
  {
    name: "Deals",
    fields: [
      { name: "Deal", type: "singleLineText" },
      { name: "Supplier", type: "singleLineText" },
      { name: "Buyer", type: "singleLineText" },
      { name: "Product", type: "singleLineText" },
      { name: "Quantity", type: "number", options: { precision: 0 } },
      { name: "Buy Total", type: "currency", options: usd },
      { name: "Sell Total", type: "currency", options: usd },
      {
        name: "Status",
        type: "singleSelect",
        options: select("Lead", "Negotiating", "Confirmed", "Shipped", "Delivered", "Closed", "Cancelled"),
      },
      { name: "Date Opened", type: "date", options: iso },
      { name: "Expected Close", type: "date", options: iso },
      { name: "Notes", type: "multilineText" },
    ],
  },
  {
    name: "Shipments",
    fields: [
      { name: "Reference", type: "singleLineText" },
      { name: "Deal", type: "singleLineText" },
      {
        name: "Status",
        type: "singleSelect",
        options: select("Pending", "Booked", "In Transit", "Customs", "Delivered"),
      },
      { name: "Origin Port", type: "singleLineText" },
      { name: "Destination Port", type: "singleLineText" },
      { name: "Carrier", type: "singleLineText" },
      { name: "Container No", type: "singleLineText" },
      { name: "Incoterm", type: "singleSelect", options: select("EXW", "FOB", "CIF", "DDP") },
      { name: "ETD", type: "date", options: iso },
      { name: "ETA", type: "date", options: iso },
      { name: "Notes", type: "multilineText" },
    ],
  },
];

const DATA = {
  Contacts: [
    { Name: "Andes Cacao Cooperative", Type: "Supplier", "Contact Person": "Mateo Vargas", Email: "mateo@andescacao.ec", Phone: "+593 2 555 0142", Country: "Ecuador", "Goods Category": "Cocoa & Coffee", Status: "Active", Notes: "Fair-trade certified. Harvest peaks Apr-Jun." },
    { Name: "Mekong Rice Mills", Type: "Supplier", "Contact Person": "Linh Tran", Email: "linh@mekongrice.vn", Phone: "+84 28 3825 0099", Country: "Vietnam", "Goods Category": "Grains", Status: "Active", Notes: "Jasmine & long-grain. FOB Ho Chi Minh." },
    { Name: "Veneto Textiles SpA", Type: "Supplier", "Contact Person": "Giulia Bianchi", Email: "g.bianchi@venetotex.it", Phone: "+39 041 555 8821", Country: "Italy", "Goods Category": "Textiles", Status: "Active", Notes: "Premium cotton & linen rolls." },
    { Name: "Shenzhen ElectroParts", Type: "Supplier", "Contact Person": "Wei Chen", Email: "wei.chen@szelectro.cn", Phone: "+86 755 8366 1200", Country: "China", "Goods Category": "Electronics", Status: "Active", Notes: "Components & accessories. MOQ applies." },
    { Name: "Kerala Spice Exporters", Type: "Supplier", "Contact Person": "Anita Nair", Email: "anita@keralaspice.in", Phone: "+91 484 555 7733", Country: "India", "Goods Category": "Spices", Status: "Active", Notes: "Pepper, cardamom, turmeric." },
    { Name: "Nordic Foods AB", Type: "Buyer", "Contact Person": "Erik Lind", Email: "erik.lind@nordicfoods.se", Phone: "+46 8 555 0190", Country: "Sweden", "Goods Category": "Food Distribution", Status: "Active", Notes: "Regional grocery chain supplier." },
    { Name: "Atlantic Wholesale Inc", Type: "Buyer", "Contact Person": "Dana Brooks", Email: "dana@atlanticws.com", Phone: "+1 305 555 0177", Country: "USA", "Goods Category": "General Goods", Status: "Active", Notes: "East-coast distribution, net-30 terms." },
    { Name: "Caribbean Trading Co", Type: "Both", "Contact Person": "Marlon Joseph", Email: "marlon@caribtrading.tt", Phone: "+1 868 555 0123", Country: "Trinidad & Tobago", "Goods Category": "General Goods", Status: "Active", Notes: "Buys & re-exports across the Caribbean." },
    { Name: "Berlin Organics GmbH", Type: "Buyer", "Contact Person": "Lena Vogel", Email: "lena@berlinorganics.de", Phone: "+49 30 555 4410", Country: "Germany", "Goods Category": "Organic Foods", Status: "Active", Notes: "Requires organic certification docs." },
    { Name: "Gulf Imports LLC", Type: "Buyer", "Contact Person": "Omar Haddad", Email: "omar@gulfimports.ae", Phone: "+971 4 555 6612", Country: "UAE", "Goods Category": "General Goods", Status: "Inactive", Notes: "Dormant since last season; revisit Q3." },
  ],
  Products: [
    { Product: "Raw Cocoa Beans", Category: "Cocoa & Coffee", Unit: "Kg", Supplier: "Andes Cacao Cooperative", "Buy Price": 2.8, "Sell Price": 3.6, Notes: "Premium fermented beans." },
    { Product: "Arabica Green Coffee", Category: "Cocoa & Coffee", Unit: "Kg", Supplier: "Andes Cacao Cooperative", "Buy Price": 4.2, "Sell Price": 5.5, Notes: "Washed process, single origin." },
    { Product: "Jasmine Rice", Category: "Grains", Unit: "Kg", Supplier: "Mekong Rice Mills", "Buy Price": 0.65, "Sell Price": 0.92, Notes: "Fragrant, 5% broken." },
    { Product: "Long-Grain White Rice", Category: "Grains", Unit: "Kg", Supplier: "Mekong Rice Mills", "Buy Price": 0.55, "Sell Price": 0.78, Notes: "25kg bags, container loads." },
    { Product: "Cotton Fabric Roll", Category: "Textiles", Unit: "Unit", Supplier: "Veneto Textiles SpA", "Buy Price": 48, "Sell Price": 67, Notes: "Per 50m roll." },
    { Product: "USB-C Cable (bulk)", Category: "Electronics", Unit: "Unit", Supplier: "Shenzhen ElectroParts", "Buy Price": 0.85, "Sell Price": 1.45, Notes: "1m braided, MOQ 5,000." },
    { Product: "Black Pepper", Category: "Spices", Unit: "Kg", Supplier: "Kerala Spice Exporters", "Buy Price": 5.1, "Sell Price": 7.2, Notes: "Tellicherry grade." },
    { Product: "Cardamom", Category: "Spices", Unit: "Kg", Supplier: "Kerala Spice Exporters", "Buy Price": 22, "Sell Price": 29.5, Notes: "Green pods, premium." },
  ],
  Deals: [
    { Deal: "D-1018 Cocoa → Germany", Supplier: "Andes Cacao Cooperative", Buyer: "Berlin Organics GmbH", Product: "Raw Cocoa Beans", Quantity: 18000, "Buy Total": 50400, "Sell Total": 64800, Status: "Delivered", "Date Opened": "2026-01-12", "Expected Close": "2026-02-20", Notes: "Organic cert provided. CIF Hamburg." },
    { Deal: "D-1021 Coffee → Sweden", Supplier: "Andes Cacao Cooperative", Buyer: "Nordic Foods AB", Product: "Arabica Green Coffee", Quantity: 12000, "Buy Total": 50400, "Sell Total": 66000, Status: "Delivered", "Date Opened": "2026-01-28", "Expected Close": "2026-03-05", Notes: "Repeat buyer." },
    { Deal: "D-1025 Jasmine Rice → USA", Supplier: "Mekong Rice Mills", Buyer: "Atlantic Wholesale Inc", Product: "Jasmine Rice", Quantity: 50000, "Buy Total": 32500, "Sell Total": 46000, Status: "Closed", "Date Opened": "2026-02-10", "Expected Close": "2026-03-22", Notes: "Full container. Paid, net-30 cleared." },
    { Deal: "D-1031 White Rice → Caribbean", Supplier: "Mekong Rice Mills", Buyer: "Caribbean Trading Co", Product: "Long-Grain White Rice", Quantity: 80000, "Buy Total": 44000, "Sell Total": 62400, Status: "Shipped", "Date Opened": "2026-03-02", "Expected Close": "2026-04-15", Notes: "Two 40ft containers." },
    { Deal: "D-1034 Cotton → USA", Supplier: "Veneto Textiles SpA", Buyer: "Atlantic Wholesale Inc", Product: "Cotton Fabric Roll", Quantity: 600, "Buy Total": 28800, "Sell Total": 40200, Status: "Delivered", "Date Opened": "2026-03-09", "Expected Close": "2026-04-10", Notes: "Mixed colour rolls." },
    { Deal: "D-1040 USB-C → UAE", Supplier: "Shenzhen ElectroParts", Buyer: "Gulf Imports LLC", Product: "USB-C Cable (bulk)", Quantity: 40000, "Buy Total": 34000, "Sell Total": 58000, Status: "Confirmed", "Date Opened": "2026-04-01", "Expected Close": "2026-05-20", Notes: "Awaiting deposit before booking." },
    { Deal: "D-1045 Pepper → Germany", Supplier: "Kerala Spice Exporters", Buyer: "Berlin Organics GmbH", Product: "Black Pepper", Quantity: 9000, "Buy Total": 45900, "Sell Total": 64800, Status: "Shipped", "Date Opened": "2026-04-18", "Expected Close": "2026-06-01", Notes: "In transit via Suez." },
    { Deal: "D-1050 Cardamom → Sweden", Supplier: "Kerala Spice Exporters", Buyer: "Nordic Foods AB", Product: "Cardamom", Quantity: 2500, "Buy Total": 55000, "Sell Total": 73750, Status: "Negotiating", "Date Opened": "2026-05-05", "Expected Close": "2026-06-20", Notes: "Price under negotiation." },
    { Deal: "D-1053 Cocoa → Caribbean", Supplier: "Andes Cacao Cooperative", Buyer: "Caribbean Trading Co", Product: "Raw Cocoa Beans", Quantity: 10000, "Buy Total": 28000, "Sell Total": 36000, Status: "Lead", "Date Opened": "2026-05-15", "Expected Close": "2026-07-01", Notes: "Inbound enquiry, sample requested." },
    { Deal: "D-1055 Coffee → USA", Supplier: "Andes Cacao Cooperative", Buyer: "Atlantic Wholesale Inc", Product: "Arabica Green Coffee", Quantity: 8000, "Buy Total": 33600, "Sell Total": 44000, Status: "Cancelled", "Date Opened": "2026-05-20", Notes: "Buyer postponed to next quarter." },
  ],
  Shipments: [
    { Reference: "SH-2201", Deal: "D-1018 Cocoa → Germany", Status: "Delivered", "Origin Port": "Guayaquil", "Destination Port": "Hamburg", Carrier: "Maersk", "Container No": "MSKU7741203", Incoterm: "CIF", ETD: "2026-01-20", ETA: "2026-02-18", Notes: "Cleared customs, delivered to warehouse." },
    { Reference: "SH-2208", Deal: "D-1021 Coffee → Sweden", Status: "Delivered", "Origin Port": "Guayaquil", "Destination Port": "Gothenburg", Carrier: "Hapag-Lloyd", "Container No": "HLBU3382910", Incoterm: "CIF", ETD: "2026-02-05", ETA: "2026-03-03", Notes: "On time." },
    { Reference: "SH-2215", Deal: "D-1025 Jasmine Rice → USA", Status: "Delivered", "Origin Port": "Ho Chi Minh", "Destination Port": "Miami", Carrier: "CMA CGM", "Container No": "CMAU6610022", Incoterm: "FOB", ETD: "2026-02-18", ETA: "2026-03-20", Notes: "FDA inspection passed." },
    { Reference: "SH-2223", Deal: "D-1031 White Rice → Caribbean", Status: "In Transit", "Origin Port": "Ho Chi Minh", "Destination Port": "Port of Spain", Carrier: "Evergreen", "Container No": "EGHU5520177", Incoterm: "FOB", ETD: "2026-03-12", ETA: "2026-04-12", Notes: "Two 40ft containers en route." },
    { Reference: "SH-2230", Deal: "D-1034 Cotton → USA", Status: "Delivered", "Origin Port": "Venice", "Destination Port": "New York", Carrier: "MSC", "Container No": "MEDU8830441", Incoterm: "CIF", ETD: "2026-03-18", ETA: "2026-04-08", Notes: "Delivered to NJ distribution center." },
    { Reference: "SH-2238", Deal: "D-1045 Pepper → Germany", Status: "In Transit", "Origin Port": "Cochin", "Destination Port": "Hamburg", Carrier: "Maersk", "Container No": "MSKU9012774", Incoterm: "CIF", ETD: "2026-04-28", ETA: "2026-05-30", Notes: "Transiting Suez." },
    { Reference: "SH-2244", Deal: "D-1040 USB-C → UAE", Status: "Booked", "Origin Port": "Shenzhen", "Destination Port": "Jebel Ali", Carrier: "COSCO", "Container No": "CSNU7745120", Incoterm: "FOB", ETD: "2026-05-28", ETA: "2026-06-10", Notes: "Booking confirmed, awaiting cargo." },
  ],
};

async function api(path, method, body) {
  const res = await fetch(`https://api.airtable.com/v0${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n),
  );

async function main() {
  // Skip tables that already exist (idempotent re-runs).
  const existing = await api(`/meta/bases/${BASE_ID}/tables`, "GET");
  const byName = new Map(existing.tables.map((t) => [t.name, t.id]));

  for (const table of TABLES) {
    let tableId = byName.get(table.name);
    if (tableId) {
      console.log(`• ${table.name} exists (${tableId}) — skipping create`);
    } else {
      const created = await api(`/meta/bases/${BASE_ID}/tables`, "POST", table);
      tableId = created.id;
      console.log(`✓ Created ${table.name} (${tableId})`);
    }

    const rows = DATA[table.name].map((fields) => ({ fields }));
    for (const batch of chunk(rows, 10)) {
      await api(`/${BASE_ID}/${tableId}`, "POST", {
        records: batch,
        typecast: true,
      });
    }
    console.log(`  seeded ${rows.length} records into ${table.name}`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
