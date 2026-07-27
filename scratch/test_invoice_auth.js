async function testInvoiceAuth() {
  const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";
  const apiKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";

  const headerVariations = [
    { "x-api-key": apiKey },
    { "x-secret-key": apiKey },
    { "api-key": apiKey },
    { "Authorization": apiKey },
    { "Authorization": `ApiKey ${apiKey}` },
    { "Authorization": `Bearer ${apiKey}` },
  ];

  for (const h of headerVariations) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...h
        },
        body: JSON.stringify({
          amount: 10,
          currency: "GHS",
          customer_name: "Test Customer",
          customer_email: "test@example.com",
          customer_phone: "0540000000",
          reference: `TX-TEST-${Date.now()}`
        })
      });
      console.log("Headers:", JSON.stringify(h), "=> Status:", res.status, "Body:", await res.text());
    } catch (e) {
      console.log("Headers:", JSON.stringify(h), "=> Error:", e.message);
    }
  }
}

testInvoiceAuth().catch(console.error);
