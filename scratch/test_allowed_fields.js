async function testFieldsOneByOne() {
  const k = "drx_live_de491229fa84aaa33702feeaeb32bca3e2e450b724fc3712d5242b6eec42eacc";
  const props = [
    "currency",
    "description",
    "notes",
    "email",
    "phone",
    "name",
    "callbackUrl",
    "callback_url",
    "webhookUrl",
    "webhook_url",
    "redirectUrl",
    "metadata",
    "orderId",
    "externalId",
    "invoiceNumber",
    "items"
  ];

  for (const p of props) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const body = { asset: "USDT", network: "TRC20", amount: 10 };
      body[p] = "test";
      const res = await fetch("https://webapi.doronpay.com/smart-invoicing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-doronpay-api-key": k },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      const isAllowed = !text.includes("is not allowed");
      console.log(`Field "${p}": allowed = ${isAllowed} | Status: ${res.status} | Output: ${text.slice(0, 120)}`);
    } catch (e) {
      console.log(`Field "${p}" error:`, e.message);
    }
  }
}

testFieldsOneByOne().catch(console.error);
