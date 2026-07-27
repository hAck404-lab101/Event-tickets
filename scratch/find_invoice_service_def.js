async function findInvoiceServiceDef() {
  const res = await fetch("https://app.doronx.com/chunk-R7VXQ7VO.js");
  const text = await res.text();

  let idx = text.indexOf("InvoiceService");
  if (idx !== -1) {
    console.log("Snippet around InvoiceService in R7VXQ7VO:");
    console.log(text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 1000)));
  }

  // Search chunk-XUSY62HY.js as well
  const res2 = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text2 = await res2.text();
  let idx2 = text2.indexOf("InvoiceService");
  if (idx2 !== -1) {
    console.log("Snippet around InvoiceService in XUSY62HY:");
    console.log(text2.slice(Math.max(0, idx2 - 100), Math.min(text2.length, idx2 + 1000)));
  }
}

findInvoiceServiceDef().catch(console.error);
