async function findInvoiceService() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  let idx = text.indexOf("this.invoiceService.");
  while (idx !== -1) {
    console.log("Found invoiceService call at index:", idx);
    console.log("Snippet:\n", text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 400)));
    idx = text.indexOf("this.invoiceService.", idx + 1);
  }
}

findInvoiceService().catch(console.error);
