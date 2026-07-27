async function test() {
  const res = await fetch("https://doronx.com");
  const text = await res.text();
  console.log("Page title / head:", text.slice(0, 1000));
  const scriptMatches = text.match(/<script[^>]*src=["']([^"']+)["']/g);
  console.log("Scripts:", scriptMatches);
  const apiMatches = text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s"']*/g);
  console.log("All URLs:", Array.from(new Set(apiMatches)));
}
test().catch(console.error);
