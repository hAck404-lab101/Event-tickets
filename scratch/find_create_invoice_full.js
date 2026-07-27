async function findCreateFull() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  // Search for 'this.http.post' in chunk-XUSY62HY.js
  let idx = text.indexOf("http.post");
  while (idx !== -1) {
    console.log("Snippet at", idx, ":\n", text.slice(Math.max(0, idx - 50), Math.min(text.length, idx + 250)));
    idx = text.indexOf("http.post", idx + 1);
  }
}

findCreateFull().catch(console.error);
