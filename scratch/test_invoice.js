async function probeEndpoints() {
  const baseUrl = "https://webapi.doronpay.com";
  const apiKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";

  const paths = [
    "/v1/invoices",
    "/api/v1/invoices",
    "/invoices",
    "/api/invoices",
    "/smart-invoicing",
    "/api/smart-invoicing",
    "/v1/smart-invoicing",
    "/invoice/create",
    "/api/invoice/create",
    "/create-invoice",
    "/api/create-invoice",
    "/v1/checkout",
    "/api/v1/checkout"
  ];

  for (const path of paths) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          amount: 10,
          currency: "GHS",
          customer_name: "Test User",
          customer_email: "test@example.com",
          customer_phone: "0540000000",
          reference: `TEST-${Date.now()}`
        })
      });
      console.log(`POST ${path} -> Status ${res.status}`);
      if (res.status !== 404 && res.status !== 405) {
        console.log(`FOUND PATH! ${path} Body:`, await res.text());
      }
    } catch (e) {
      console.log(`POST ${path} -> Error:`, e.message);
    }
  }
}

probeEndpoints().catch(console.error);
