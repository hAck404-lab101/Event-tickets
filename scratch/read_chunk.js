async function readChunk() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();
  console.log("INVOICES CHUNK LENGTH:", text.length);
  const urls = text.match(/["'](\/[a-zA-Z0-9_\-\/]+|https?:\/\/[^"']+)["']/g);
  console.log("URLs in chunk:", Array.from(new Set(urls)));
}
readChunk();
