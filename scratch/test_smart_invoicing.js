async function testSmartInvoicingEndpoints() {
  const apiKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";
  const baseUrl = "https://webapi.doronpay.com/smart-invoicing";

  const paths = [
    "/invoices",
    "/invoices/create",
    "/invoices/generate",
    "/invoice",
    "/checkout",
    "/pay",
    "/payments",
    "/public/invoices",
    "/merchant/invoices"
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
          customer_name: "Test Customer",
          customer_email: "test@example.com",
          customer_phone: "0540000000",
          reference: `TX-TEST-${Date.now()}`
        })
      });
      console.log(`POST ${baseUrl}${path} => Status ${res.status}`);
      if (res.status !== 404 && res.status !== 405) {
        console.log(`FOUND PATH: ${path} Body:`, await res.text());
      }
    } catch (e) {
      console.log(`POST ${baseUrl}${path} => Error:`, e.message);
    }
  }
}

testSmartInvoicingEndpoints().catch(console.error);
