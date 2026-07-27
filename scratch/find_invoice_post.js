async function findInvoicePost() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  // Search for http.post calls in chunk
  const postMatches = text.match(/http\.post<[^>]+>\([^)]+\)/g) || text.match(/\.http\.post\([^)]+\)/g) || [];
  console.log("Post matches:", Array.from(new Set(postMatches)));
}

findInvoicePost().catch(console.error);
