// Rebuilds the 4 brokerage tables in the target Airtable base with fresh demo data.
// For existing tables it adds any missing schema fields, wipes all records, then reseeds.
// (Airtable has no delete-field API, so obsolete fields are left in place.)
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
      { name: "City", type: "singleLineText" },
      { name: "Address", type: "singleLineText" },
      { name: "Website", type: "url" },
      { name: "Tax ID", type: "singleLineText" },
      { name: "Currency", type: "singleSelect", options: select("USD", "EUR", "GBP") },
      { name: "Payment Terms", type: "singleSelect", options: select("Net 15", "Net 30", "Net 60", "CIA", "LC") },
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
      { name: "HS Code", type: "singleLineText" },
      { name: "Country of Origin", type: "singleLineText" },
      { name: "Weight (kg)", type: "number", options: { precision: 2 } },
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
      { name: "Origin Country", type: "singleLineText" },
      { name: "Destination Country", type: "singleLineText" },
      { name: "Commission Rate", type: "number", options: { precision: 1 } },
      { name: "Incoterm", type: "singleSelect", options: select("EXW", "FOB", "CIF", "DDP") },
      { name: "Payment Status", type: "singleSelect", options: select("Unpaid", "Deposit Paid", "Paid") },
      { name: "Currency", type: "singleSelect", options: select("USD", "EUR", "GBP") },
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
      { name: "Origin Country", type: "singleLineText" },
      { name: "Destination Country", type: "singleLineText" },
      { name: "Carrier", type: "singleLineText" },
      { name: "Vessel", type: "singleLineText" },
      { name: "Container No", type: "singleLineText" },
      { name: "Bill of Lading", type: "singleLineText" },
      { name: "Gross Weight (kg)", type: "number", options: { precision: 0 } },
      { name: "Container Count", type: "number", options: { precision: 0 } },
      { name: "Container Type", type: "singleSelect", options: select("20ft", "40ft", "40HC", "Reefer") },
      { name: "Freight Cost", type: "currency", options: usd },
      { name: "Incoterm", type: "singleSelect", options: select("EXW", "FOB", "CIF", "DDP") },
      { name: "ETD", type: "date", options: iso },
      { name: "ETA", type: "date", options: iso },
      { name: "Notes", type: "multilineText" },
    ],
  },
];

const DATA = {
  Contacts: [
    { Name: "Andes Cacao Cooperative", Type: "Supplier", "Contact Person": "Mateo Vargas", Email: "mateo@andescacao.ec", Phone: "+593 2 555 0142", Country: "Ecuador", City: "Guayaquil", Address: "Av. de las Américas 320", Website: "https://andescacao.ec", "Tax ID": "EC-0992345671", Currency: "USD", "Payment Terms": "CIA", "Goods Category": "Cocoa & Coffee", Status: "Active", Notes: "Fair-trade certified. Harvest peaks Apr-Jun." },
    { Name: "Mekong Rice Mills", Type: "Supplier", "Contact Person": "Linh Tran", Email: "linh@mekongrice.vn", Phone: "+84 28 3825 0099", Country: "Vietnam", City: "Ho Chi Minh City", Address: "12 Nguyen Hue Blvd", Website: "https://mekongrice.vn", "Tax ID": "VN-0312889004", Currency: "USD", "Payment Terms": "LC", "Goods Category": "Grains", Status: "Active", Notes: "Jasmine & long-grain. FOB Ho Chi Minh." },
    { Name: "Veneto Textiles SpA", Type: "Supplier", "Contact Person": "Giulia Bianchi", Email: "g.bianchi@venetotex.it", Phone: "+39 041 555 8821", Country: "Italy", City: "Venice", Address: "Via Torino 145, Mestre", Website: "https://venetotex.it", "Tax ID": "IT-04412330271", Currency: "EUR", "Payment Terms": "Net 30", "Goods Category": "Textiles", Status: "Active", Notes: "Premium cotton & linen rolls." },
    { Name: "Shenzhen ElectroParts", Type: "Supplier", "Contact Person": "Wei Chen", Email: "wei.chen@szelectro.cn", Phone: "+86 755 8366 1200", Country: "China", City: "Shenzhen", Address: "Huaqiang North Rd 88", Website: "https://szelectro.cn", "Tax ID": "CN-9144030089", Currency: "USD", "Payment Terms": "CIA", "Goods Category": "Electronics", Status: "Active", Notes: "Components & accessories. MOQ applies." },
    { Name: "Kerala Spice Exporters", Type: "Supplier", "Contact Person": "Anita Nair", Email: "anita@keralaspice.in", Phone: "+91 484 555 7733", Country: "India", City: "Kochi", Address: "Spice Market Rd, Mattancherry", Website: "https://keralaspice.in", "Tax ID": "IN-32AABCK1234L", Currency: "USD", "Payment Terms": "Net 30", "Goods Category": "Spices", Status: "Active", Notes: "Pepper, cardamom, turmeric." },
    { Name: "Nordic Foods AB", Type: "Buyer", "Contact Person": "Erik Lind", Email: "erik.lind@nordicfoods.se", Phone: "+46 8 555 0190", Country: "Sweden", City: "Stockholm", Address: "Kungsgatan 44", Website: "https://nordicfoods.se", "Tax ID": "SE-556677889901", Currency: "EUR", "Payment Terms": "Net 30", "Goods Category": "Food Distribution", Status: "Active", Notes: "Regional grocery chain supplier." },
    { Name: "Atlantic Wholesale Inc", Type: "Buyer", "Contact Person": "Dana Brooks", Email: "dana@atlanticws.com", Phone: "+1 305 555 0177", Country: "USA", City: "Miami", Address: "1450 NW 87th Ave", Website: "https://atlanticws.com", "Tax ID": "US-59-1234567", Currency: "USD", "Payment Terms": "Net 30", "Goods Category": "General Goods", Status: "Active", Notes: "East-coast distribution, net-30 terms." },
    { Name: "Caribbean Trading Co", Type: "Both", "Contact Person": "Marlon Joseph", Email: "marlon@caribtrading.tt", Phone: "+1 868 555 0123", Country: "Trinidad & Tobago", City: "Port of Spain", Address: "23 Wrightson Rd", Website: "https://caribtrading.tt", "Tax ID": "TT-1023456789", Currency: "USD", "Payment Terms": "Net 15", "Goods Category": "General Goods", Status: "Active", Notes: "Buys & re-exports across the Caribbean." },
    { Name: "Berlin Organics GmbH", Type: "Buyer", "Contact Person": "Lena Vogel", Email: "lena@berlinorganics.de", Phone: "+49 30 555 4410", Country: "Germany", City: "Berlin", Address: "Friedrichstraße 210", Website: "https://berlinorganics.de", "Tax ID": "DE-812345678", Currency: "EUR", "Payment Terms": "Net 60", "Goods Category": "Organic Foods", Status: "Active", Notes: "Requires organic certification docs." },
    { Name: "Gulf Imports LLC", Type: "Buyer", "Contact Person": "Omar Haddad", Email: "omar@gulfimports.ae", Phone: "+971 4 555 6612", Country: "UAE", City: "Dubai", Address: "Sheikh Zayed Rd, Trade Centre", Website: "https://gulfimports.ae", "Tax ID": "AE-100234567800003", Currency: "USD", "Payment Terms": "Net 30", "Goods Category": "General Goods", Status: "Inactive", Notes: "Dormant since last season; revisit Q3." },
  ],
  Products: [
    { Product: "Raw Cocoa Beans", Category: "Cocoa & Coffee", Unit: "Kg", Supplier: "Andes Cacao Cooperative", "Buy Price": 2.8, "Sell Price": 3.6, "HS Code": "1801.00", "Country of Origin": "Ecuador", "Weight (kg)": 1, Notes: "Premium fermented beans." },
    { Product: "Arabica Green Coffee", Category: "Cocoa & Coffee", Unit: "Kg", Supplier: "Andes Cacao Cooperative", "Buy Price": 4.2, "Sell Price": 5.5, "HS Code": "0901.11", "Country of Origin": "Ecuador", "Weight (kg)": 1, Notes: "Washed process, single origin." },
    { Product: "Jasmine Rice", Category: "Grains", Unit: "Kg", Supplier: "Mekong Rice Mills", "Buy Price": 0.65, "Sell Price": 0.92, "HS Code": "1006.30", "Country of Origin": "Vietnam", "Weight (kg)": 1, Notes: "Fragrant, 5% broken." },
    { Product: "Long-Grain White Rice", Category: "Grains", Unit: "Kg", Supplier: "Mekong Rice Mills", "Buy Price": 0.55, "Sell Price": 0.78, "HS Code": "1006.30", "Country of Origin": "Vietnam", "Weight (kg)": 1, Notes: "25kg bags, container loads." },
    { Product: "Cotton Fabric Roll", Category: "Textiles", Unit: "Unit", Supplier: "Veneto Textiles SpA", "Buy Price": 48, "Sell Price": 67, "HS Code": "5208.52", "Country of Origin": "Italy", "Weight (kg)": 12, Notes: "Per 50m roll." },
    { Product: "USB-C Cable (bulk)", Category: "Electronics", Unit: "Unit", Supplier: "Shenzhen ElectroParts", "Buy Price": 0.85, "Sell Price": 1.45, "HS Code": "8544.42", "Country of Origin": "China", "Weight (kg)": 0.05, Notes: "1m braided, MOQ 5,000." },
    { Product: "Black Pepper", Category: "Spices", Unit: "Kg", Supplier: "Kerala Spice Exporters", "Buy Price": 5.1, "Sell Price": 7.2, "HS Code": "0904.11", "Country of Origin": "India", "Weight (kg)": 1, Notes: "Tellicherry grade." },
    { Product: "Cardamom", Category: "Spices", Unit: "Kg", Supplier: "Kerala Spice Exporters", "Buy Price": 22, "Sell Price": 29.5, "HS Code": "0908.31", "Country of Origin": "India", "Weight (kg)": 1, Notes: "Green pods, premium." },
  ],
  Deals: [
    { Deal: "D-1018 Cocoa → Germany", Supplier: "Andes Cacao Cooperative", Buyer: "Berlin Organics GmbH", Product: "Raw Cocoa Beans", Quantity: 18000, "Buy Total": 50400, "Sell Total": 64800, Status: "Delivered", "Origin Country": "Ecuador", "Destination Country": "Germany", "Commission Rate": 22.2, Incoterm: "CIF", "Payment Status": "Paid", Currency: "EUR", "Date Opened": "2026-01-12", "Expected Close": "2026-02-20", Notes: "Organic cert provided. CIF Hamburg." },
    { Deal: "D-1021 Coffee → Sweden", Supplier: "Andes Cacao Cooperative", Buyer: "Nordic Foods AB", Product: "Arabica Green Coffee", Quantity: 12000, "Buy Total": 50400, "Sell Total": 66000, Status: "Delivered", "Origin Country": "Ecuador", "Destination Country": "Sweden", "Commission Rate": 23.6, Incoterm: "CIF", "Payment Status": "Paid", Currency: "EUR", "Date Opened": "2026-01-28", "Expected Close": "2026-03-05", Notes: "Repeat buyer." },
    { Deal: "D-1025 Jasmine Rice → USA", Supplier: "Mekong Rice Mills", Buyer: "Atlantic Wholesale Inc", Product: "Jasmine Rice", Quantity: 50000, "Buy Total": 32500, "Sell Total": 46000, Status: "Closed", "Origin Country": "Vietnam", "Destination Country": "USA", "Commission Rate": 29.3, Incoterm: "FOB", "Payment Status": "Paid", Currency: "USD", "Date Opened": "2026-02-10", "Expected Close": "2026-03-22", Notes: "Full container. Paid, net-30 cleared." },
    { Deal: "D-1031 White Rice → Caribbean", Supplier: "Mekong Rice Mills", Buyer: "Caribbean Trading Co", Product: "Long-Grain White Rice", Quantity: 80000, "Buy Total": 44000, "Sell Total": 62400, Status: "Shipped", "Origin Country": "Vietnam", "Destination Country": "Trinidad & Tobago", "Commission Rate": 29.5, Incoterm: "FOB", "Payment Status": "Deposit Paid", Currency: "USD", "Date Opened": "2026-03-02", "Expected Close": "2026-04-15", Notes: "Two 40ft containers." },
    { Deal: "D-1034 Cotton → USA", Supplier: "Veneto Textiles SpA", Buyer: "Atlantic Wholesale Inc", Product: "Cotton Fabric Roll", Quantity: 600, "Buy Total": 28800, "Sell Total": 40200, Status: "Delivered", "Origin Country": "Italy", "Destination Country": "USA", "Commission Rate": 28.4, Incoterm: "CIF", "Payment Status": "Paid", Currency: "USD", "Date Opened": "2026-03-09", "Expected Close": "2026-04-10", Notes: "Mixed colour rolls." },
    { Deal: "D-1040 USB-C → UAE", Supplier: "Shenzhen ElectroParts", Buyer: "Gulf Imports LLC", Product: "USB-C Cable (bulk)", Quantity: 40000, "Buy Total": 34000, "Sell Total": 58000, Status: "Confirmed", "Origin Country": "China", "Destination Country": "UAE", "Commission Rate": 41.4, Incoterm: "FOB", "Payment Status": "Unpaid", Currency: "USD", "Date Opened": "2026-04-01", "Expected Close": "2026-05-20", Notes: "Awaiting deposit before booking." },
    { Deal: "D-1045 Pepper → Germany", Supplier: "Kerala Spice Exporters", Buyer: "Berlin Organics GmbH", Product: "Black Pepper", Quantity: 9000, "Buy Total": 45900, "Sell Total": 64800, Status: "Shipped", "Origin Country": "India", "Destination Country": "Germany", "Commission Rate": 29.2, Incoterm: "CIF", "Payment Status": "Deposit Paid", Currency: "EUR", "Date Opened": "2026-04-18", "Expected Close": "2026-06-01", Notes: "In transit via Suez." },
    { Deal: "D-1050 Cardamom → Sweden", Supplier: "Kerala Spice Exporters", Buyer: "Nordic Foods AB", Product: "Cardamom", Quantity: 2500, "Buy Total": 55000, "Sell Total": 73750, Status: "Negotiating", "Origin Country": "India", "Destination Country": "Sweden", "Commission Rate": 25.4, Incoterm: "CIF", "Payment Status": "Unpaid", Currency: "EUR", "Date Opened": "2026-05-05", "Expected Close": "2026-06-20", Notes: "Price under negotiation." },
    { Deal: "D-1053 Cocoa → Caribbean", Supplier: "Andes Cacao Cooperative", Buyer: "Caribbean Trading Co", Product: "Raw Cocoa Beans", Quantity: 10000, "Buy Total": 28000, "Sell Total": 36000, Status: "Lead", "Origin Country": "Ecuador", "Destination Country": "Trinidad & Tobago", "Commission Rate": 22.2, Incoterm: "FOB", "Payment Status": "Unpaid", Currency: "USD", "Date Opened": "2026-05-15", "Expected Close": "2026-07-01", Notes: "Inbound enquiry, sample requested." },
    { Deal: "D-1055 Coffee → USA", Supplier: "Andes Cacao Cooperative", Buyer: "Atlantic Wholesale Inc", Product: "Arabica Green Coffee", Quantity: 8000, "Buy Total": 33600, "Sell Total": 44000, Status: "Cancelled", "Origin Country": "Ecuador", "Destination Country": "USA", "Commission Rate": 23.6, Incoterm: "FOB", "Payment Status": "Unpaid", Currency: "USD", "Date Opened": "2026-05-20", Notes: "Buyer postponed to next quarter." },
  ],
  Shipments: [
    { Reference: "SH-2201", Deal: "D-1018 Cocoa → Germany", Status: "Delivered", "Origin Port": "Guayaquil", "Destination Port": "Hamburg", "Origin Country": "Ecuador", "Destination Country": "Germany", Carrier: "Maersk", Vessel: "Maersk Sentosa", "Container No": "MSKU7741203", "Bill of Lading": "MAEU2201BL", "Gross Weight (kg)": 18450, "Container Count": 1, "Container Type": "40HC", "Freight Cost": 3200, Incoterm: "CIF", ETD: "2026-01-20", ETA: "2026-02-18", Notes: "Cleared customs, delivered to warehouse." },
    { Reference: "SH-2208", Deal: "D-1021 Coffee → Sweden", Status: "Delivered", "Origin Port": "Guayaquil", "Destination Port": "Gothenburg", "Origin Country": "Ecuador", "Destination Country": "Sweden", Carrier: "Hapag-Lloyd", Vessel: "Hapag Brussels", "Container No": "HLBU3382910", "Bill of Lading": "HLBU2208BL", "Gross Weight (kg)": 12380, "Container Count": 1, "Container Type": "40ft", "Freight Cost": 3500, Incoterm: "CIF", ETD: "2026-02-05", ETA: "2026-03-03", Notes: "On time." },
    { Reference: "SH-2215", Deal: "D-1025 Jasmine Rice → USA", Status: "Delivered", "Origin Port": "Ho Chi Minh", "Destination Port": "Miami", "Origin Country": "Vietnam", "Destination Country": "USA", Carrier: "CMA CGM", Vessel: "CMA CGM Lyra", "Container No": "CMAU6610022", "Bill of Lading": "CMAU2215BL", "Gross Weight (kg)": 50800, "Container Count": 2, "Container Type": "40ft", "Freight Cost": 4800, Incoterm: "FOB", ETD: "2026-02-18", ETA: "2026-03-20", Notes: "FDA inspection passed." },
    { Reference: "SH-2223", Deal: "D-1031 White Rice → Caribbean", Status: "In Transit", "Origin Port": "Ho Chi Minh", "Destination Port": "Port of Spain", "Origin Country": "Vietnam", "Destination Country": "Trinidad & Tobago", Carrier: "Evergreen", Vessel: "Ever Genius", "Container No": "EGHU5520177", "Bill of Lading": "EGLV2223BL", "Gross Weight (kg)": 81200, "Container Count": 2, "Container Type": "40HC", "Freight Cost": 5200, Incoterm: "FOB", ETD: "2026-03-12", ETA: "2026-04-12", Notes: "Two 40ft containers en route." },
    { Reference: "SH-2230", Deal: "D-1034 Cotton → USA", Status: "Delivered", "Origin Port": "Venice", "Destination Port": "New York", "Origin Country": "Italy", "Destination Country": "USA", Carrier: "MSC", Vessel: "MSC Bari", "Container No": "MEDU8830441", "Bill of Lading": "MEDU2230BL", "Gross Weight (kg)": 7200, "Container Count": 1, "Container Type": "40ft", "Freight Cost": 2900, Incoterm: "CIF", ETD: "2026-03-18", ETA: "2026-04-08", Notes: "Delivered to NJ distribution center." },
    { Reference: "SH-2238", Deal: "D-1045 Pepper → Germany", Status: "In Transit", "Origin Port": "Cochin", "Destination Port": "Hamburg", "Origin Country": "India", "Destination Country": "Germany", Carrier: "Maersk", Vessel: "Maersk Surabaya", "Container No": "MSKU9012774", "Bill of Lading": "MAEU2238BL", "Gross Weight (kg)": 9300, "Container Count": 1, "Container Type": "20ft", "Freight Cost": 2600, Incoterm: "CIF", ETD: "2026-04-28", ETA: "2026-05-30", Notes: "Transiting Suez." },
    { Reference: "SH-2244", Deal: "D-1040 USB-C → UAE", Status: "Booked", "Origin Port": "Shenzhen", "Destination Port": "Jebel Ali", "Origin Country": "China", "Destination Country": "UAE", Carrier: "COSCO", Vessel: "COSCO Aden", "Container No": "CSNU7745120", "Bill of Lading": "COSU2244BL", "Gross Weight (kg)": 2000, "Container Count": 1, "Container Type": "20ft", "Freight Cost": 1800, Incoterm: "FOB", ETD: "2026-05-28", ETA: "2026-06-10", Notes: "Booking confirmed, awaiting cargo." },
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

/** Add any of `fields` that aren't already on the table (by name). */
async function ensureFields(tableId, existingFields, fields) {
  const have = new Set(existingFields.map((f) => f.name));
  for (const field of fields) {
    if (have.has(field.name)) continue;
    await api(`/meta/bases/${BASE_ID}/tables/${tableId}/fields`, "POST", field);
    console.log(`  + added field "${field.name}"`);
  }
}

/** Delete every record in a table so the seed starts from a clean slate. */
async function deleteAll(tableId) {
  const ids = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(`GET ${tableId} → ${res.status}: ${JSON.stringify(json)}`);
    ids.push(...json.records.map((r) => r.id));
    offset = json.offset;
  } while (offset);

  for (const batch of chunk(ids, 10)) {
    const qs = batch.map((id) => `records[]=${id}`).join("&");
    await api(`/${BASE_ID}/${tableId}?${qs}`, "DELETE");
  }
  if (ids.length) console.log(`  cleared ${ids.length} existing records`);
}

async function main() {
  const existing = await api(`/meta/bases/${BASE_ID}/tables`, "GET");
  const byName = new Map(existing.tables.map((t) => [t.name, t]));

  for (const table of TABLES) {
    const found = byName.get(table.name);
    let tableId;
    if (found) {
      tableId = found.id;
      console.log(`• ${table.name} exists (${tableId})`);
      // Add new schema fields, then wipe records for a fresh reseed.
      await ensureFields(tableId, found.fields, table.fields);
      await deleteAll(tableId);
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
