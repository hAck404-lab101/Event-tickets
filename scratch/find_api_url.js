async function findApiUrl() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  // Search for http requests or endpoints around '/invoices'
  const idx = text.indexOf("/invoices");
  if (idx !== -1) {
    console.log("Snippet around /invoices:");
    console.log(text.slice(Math.max(0, idx - 200), Math.min(text.length, idx + 400)));
  }

  const idx2 = text.indexOf("smart-invoice");
  if (idx2 !== -1) {
    console.log("Snippet around smart-invoice:");
    console.log(text.slice(Math.max(0, idx2 - 200), Math.min(text.length, idx2 + 400)));
  }
}

findApiUrl().catch(console.error);
