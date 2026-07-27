async function findUsage() {
  const res = await fetch("https://app.doronx.com/chunk-R7VXQ7VO.js");
  const text = await res.text();

  let idx = text.indexOf("smartInvoicingPath");
  if (idx !== -1) {
    console.log("Snippet around smartInvoicingPath:");
    console.log(text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 1000)));
  }

  // Also check other chunks if necessary
  const invoiceRes = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const invoiceText = await invoiceRes.text();
  let idx2 = invoiceText.indexOf("/smart-invoicing");
  if (idx2 !== -1) {
    console.log("Snippet in invoice chunk around /smart-invoicing:");
    console.log(invoiceText.slice(Math.max(0, idx2 - 100), Math.min(invoiceText.length, idx2 + 1000)));
  }
}

findUsage().catch(console.error);
