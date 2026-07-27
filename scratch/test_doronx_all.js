async function probeAll() {
  const apiKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";
  const hosts = [
    "https://app.doronx.com",
    "https://doronx.com",
    "https://webapi.doronpay.com"
  ];
  const paths = [
    "/api/invoices",
    "/api/invoices/create",
    "/api/v1/invoices",
    "/api/smart-invoicing",
    "/api/smart-invoicing/create",
    "/api/invoice",
    "/api/checkout",
    "/api/v1/checkout",
    "/api/v1/smart-invoice"
  ];

  for (const host of hosts) {
    for (const path of paths) {
      try {
        const res = await fetch(`${host}${path}`, {
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
        console.log(`POST ${host}${path} -> Status ${res.status}`);
        if (res.status !== 404 && res.status !== 405) {
          console.log(`FOUND! ${host}${path} Body:`, await res.text());
        }
      } catch (e) {
        console.log(`POST ${host}${path} -> Error:`, e.message);
      }
    }
  }
}

probeAll().catch(console.error);
