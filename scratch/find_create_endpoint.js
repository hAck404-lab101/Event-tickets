async function findCreateEndpoint() {
  const res = await fetch("https://app.doronx.com/chunk-XUSY62HY.js");
  const text = await res.text();

  // Search for create( function definition in invoice service
  let idx = text.indexOf("create(");
  while (idx !== -1) {
    console.log("Found create( at index:", idx);
    console.log("Snippet:\n", text.slice(Math.max(0, idx - 50), Math.min(text.length, idx + 250)));
    idx = text.indexOf("create(", idx + 1);
  }
}

findCreateEndpoint().catch(console.error);
