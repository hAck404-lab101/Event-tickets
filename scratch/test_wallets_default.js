async function testWalletsDefault() {
  const apiKey = "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";
  const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";

  const items = [
    { asset: "USDT", network: "TRC20" },
    { asset: "USDT", network: "BEP20" },
    { asset: "USDT", network: "SOLANA" },
    { asset: "USDC", network: "SOLANA" },
    { asset: "USDC", network: "BEP20" },
    { asset: "BTC", network: "BTC" }
  ];

  for (const item of items) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doronpay-api-key": apiKey
        },
        body: JSON.stringify({
          payerName: "Kwame Mensah",
          payerEmail: "kwame@example.com",
          payerPhone: "0240000000",
          amount: 10,
          currency: "GHS",
          asset: item.asset,
          network: item.network,
          description: "Test Ticket Purchase",
          forceRateRefresh: true
        })
      });
      const text = await res.text();
      console.log(`Asset ${item.asset} (${item.network}) => Status ${res.status}:`, text);
    } catch (e) {
      console.log(`Error ${item.asset}:`, e.message);
    }
  }
}

testWalletsDefault().catch(console.error);
