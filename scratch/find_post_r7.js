async function findPostR7() {
  const res = await fetch("https://app.doronx.com/chunk-R7VXQ7VO.js");
  const text = await res.text();

  let idx = text.indexOf("/invoices");
  while (idx !== -1) {
    console.log("Snippet at index", idx, ":\n", text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 300)));
    idx = text.indexOf("/invoices", idx + 1);
  }
}

findPostR7().catch(console.error);
