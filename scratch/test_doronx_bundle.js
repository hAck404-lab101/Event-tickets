async function inspectAppBundle() {
  const res = await fetch("https://app.doronx.com/");
  const html = await res.text();
  console.log("HTML length:", html.length);

  const jsMatches = html.match(/src=["']([^"']+\.js[^"']*)["']/g) || [];
  console.log("JS Files:", jsMatches);

  for (const m of jsMatches) {
    const src = m.replace(/src=["']/, "").replace(/["']$/, "");
    const fullUrl = src.startsWith("http") ? src : `https://app.doronx.com/${src.replace(/^\//, "")}`;
    console.log("Fetching JS:", fullUrl);
    try {
      const jsRes = await fetch(fullUrl);
      const jsText = await jsRes.text();
      console.log(`JS ${src} length:`, jsText.length);

      // Search for API endpoints in bundle
      const apiMatches = jsText.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
      if (apiMatches) {
        console.log("API endpoints in bundle:", Array.from(new Set(apiMatches)).slice(0, 30));
      }
      const httpMatches = jsText.match(/https?:\/\/[a-zA-Z0-9._\-]+\/[a-zA-Z0-9_\-\/]+/g);
      if (httpMatches) {
        console.log("HTTP URLs in bundle:", Array.from(new Set(httpMatches)).slice(0, 30));
      }
    } catch (e) {
      console.log("Error fetching JS:", e.message);
    }
  }
}

inspectAppBundle().catch(console.error);
