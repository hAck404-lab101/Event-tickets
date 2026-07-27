async function findEnv() {
  const res = await fetch("https://app.doronx.com/chunk-R7VXQ7VO.js");
  const text = await res.text();
  console.log("Chunk R7VXQ7VO length:", text.length);

  const envIdx = text.indexOf("apiUrl") !== -1 ? text.indexOf("apiUrl") : text.indexOf("api");
  const matches = text.match(/https?:\/\/[a-zA-Z0-9.\-_]+/g);
  console.log("All hostnames in main chunk:", Array.from(new Set(matches)));
}

findEnv().catch(console.error);
