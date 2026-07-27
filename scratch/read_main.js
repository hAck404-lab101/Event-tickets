async function readMain() {
  const res = await fetch("https://app.doronx.com/main-SCHMII5M.js");
  const text = await res.text();
  console.log("MAIN JS CONTENT:\n", text);
}
readMain();
