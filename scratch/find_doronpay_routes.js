async function findDoronPayRoutes() {
  const res = await fetch("https://app.doronx.com/chunk-R7VXQ7VO.js");
  const text = await res.text();

  let idx = text.indexOf("webapi.doronpay.com");
  while (idx !== -1) {
    console.log("FOUND webapi.doronpay.com AT INDEX:", idx);
    console.log("Snippet:", text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 300)));
    idx = text.indexOf("webapi.doronpay.com", idx + 1);
  }
}

findDoronPayRoutes().catch(console.error);
