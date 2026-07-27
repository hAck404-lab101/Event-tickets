async function findCreateInvoiceApi() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  // Search for 'Create Invoice' or form submission endpoint
  let idx = text.indexOf("Create Invoice & Payment Link");
  if (idx === -1) idx = text.indexOf("Create Invoice");

  if (idx !== -1) {
    console.log("Found Create Invoice button at index:", idx);
    console.log("Snippet:\n", text.slice(Math.max(0, idx - 400), Math.min(text.length, idx + 800)));
  } else {
    console.log("Not found in chunk-XUSY62HY.js, searching other patterns...");
  }

  // Search for HTTP post calls in invoice chunk
  const matches = text.match(/http\.post\([^)]+\)/g);
  if (matches) {
    console.log("HTTP POST calls in chunk:", Array.from(new Set(matches)));
  }
}

findCreateInvoiceApi().catch(console.error);
