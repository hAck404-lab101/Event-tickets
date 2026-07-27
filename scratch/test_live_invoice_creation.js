async function testAllInvoiceCreation() {
  const apiKey = "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";

  const hosts = [
    "https://webapi.doronpay.com/smart-invoicing",
    "https://webapi.doronpay.com",
    "https://app.doronx.com/api"
  ];

  const paths = [
    "/invoices",
    "/invoices/create",
    "/smart-invoicing/invoices"
  ];

  const payloads = [
    {
      payerName: "Kwame Mensah",
      payerEmail: "kwame@example.com",
      payerPhone: "0240000000",
      amount: 10,
      currency: "GHS",
      asset: "USDT",
      network: "TRC20",
      description: "Test Ticket Purchase",
      forceRateRefresh: true
    },
    {
      payerName: "Kwame Mensah",
      payerEmail: "kwame@example.com",
      payerPhone: "0240000000",
      amount: 10,
      currency: "USD",
      asset: "USDT",
      network: "TRC20",
      description: "Test Ticket Purchase",
      forceRateRefresh: true
    },
    {
      asset: "USDT",
      network: "TRC20",
      amount: 10,
      currency: "GHS",
      description: "Test Ticket Purchase"
    }
  ];

  for (const host of hosts) {
    for (const path of paths) {
      for (const payload of payloads) {
        try {
          const res = await fetch(`${host}${path}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-doronpay-api-key": apiKey,
              "Authorization": `Bearer ${apiKey}`,
              "x-api-key": apiKey
            },
            body: JSON.stringify(payload)
          });
          const text = await res.text();
          console.log(`POST ${host}${path} (curr: ${payload.currency}) => Status ${res.status}:`, text.slice(0, 150));
          if (res.status === 200 || res.status === 201 || text.includes("success") || text.includes("url") || text.includes("invoice")) {
            console.log("SUCCESS RESPONSE:", text);
          }
        } catch (e) {
          console.log(`Error on ${host}${path}:`, e.message);
        }
      }
    }
  }
}

testAllInvoiceCreation().catch(console.error);
