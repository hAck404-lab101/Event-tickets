async function testPublicCheckout() {
  const apiKey = "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";
  const baseUrl = "https://webapi.doronpay.com/smart-invoicing";

  const paths = [
    "/rates",
    "/wallets",
    "/payment-stands",
    "/invoices",
    "/invoices/search",
    "/reports"
  ];

  for (const path of paths) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          "x-doronpay-api-key": apiKey
        }
      });
      console.log(`GET ${path} => Status ${res.status}:`, (await res.text()).slice(0, 200));
    } catch (e) {
      console.log(`GET ${path} error:`, e.message);
    }
  }
}

testPublicCheckout().catch(console.error);
