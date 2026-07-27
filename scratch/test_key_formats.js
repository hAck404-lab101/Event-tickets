async function testFormats() {
  const endpoint = "https://webapi.doronpay.com/smart-invoicing/invoices";
  const rawKey = "whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";
  const cleanKey = "f435b4c38030d47c31cd5220a963ba7615cf240780b8231a";

  const keyVariations = [
    rawKey,
    cleanKey,
    `drx_${cleanKey}`,
    `drx_live_${cleanKey}`,
    `dp_live_${cleanKey}`,
    `dp_${cleanKey}`,
    `sk_${cleanKey}`,
    `pk_${cleanKey}`
  ];

  for (const k of keyVariations) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-doronpay-api-key": k
        },
        body: JSON.stringify({
          amount: 10,
          currency: "GHS",
          customer: { name: "Test", email: "test@example.com", phone: "0540000000" },
          reference: `TX-${Date.now()}`
        })
      });
      console.log(`Key "${k}" => Status ${res.status}:`, (await res.text()).slice(0, 150));
    } catch (e) {
      console.log(`Key "${k}" => Error:`, e.message);
    }
  }
}

testFormats().catch(console.error);
