async function testUsdtGhs() {
  const k = "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";
  const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";

  const networks = ["TRC20", "BEP20", "ERC20", "SOLANA"];

  for (const n of networks) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doronpay-api-key": k
        },
        body: JSON.stringify({
          asset: "USDT",
          network: n,
          amount: 150,
          currency: "GHS",
          description: "VIP Ticket Purchase"
        })
      });
      console.log(`Network "${n}" => Status ${res.status}:`, await res.text());
    } catch (e) {
      console.log(`Network "${n}" error:`, e.message);
    }
  }
}

testUsdtGhs().catch(console.error);
