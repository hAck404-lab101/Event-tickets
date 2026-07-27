async function findInvoiceServiceImpl() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  let idx = text.indexOf("create(w){");
  if (idx === -1) idx = text.indexOf("create(w)");
  if (idx === -1) idx = text.indexOf("create(");

  while (idx !== -1) {
    const snippet = text.slice(Math.max(0, idx - 50), Math.min(text.length, idx + 400));
    if (snippet.includes("http") || snippet.includes("post") || snippet.includes("invoices")) {
      console.log("Snippet at", idx, ":\n", snippet);
    }
    idx = text.indexOf("create(", idx + 1);
  }
}

findInvoiceServiceImpl().catch(console.error);
