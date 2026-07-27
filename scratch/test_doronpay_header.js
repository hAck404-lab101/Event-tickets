async function testDoronPayHeader() {
  const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";
  const apiKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-doronpay-api-key": apiKey
    },
    body: JSON.stringify({
      amount: 10,
      currency: "GHS",
      customer: {
        name: "Test Customer",
        email: "test@example.com",
        phone: "0540000000"
      },
      items: [
        {
          name: "VIP Ticket",
          quantity: 1,
          unit_price: 10
        }
      ],
      reference: `TX-${Date.now()}`,
      callback_url: "https://tixlyevents-tickets-beta.vercel.app/payment/pending",
      webhook_url: "https://tixlyevents-tickets-beta.vercel.app/api/webhooks/doronx"
    })
  });

  console.log("Status:", res.status);
  console.log("Response Body:", await res.text());
}

testDoronPayHeader().catch(console.error);
