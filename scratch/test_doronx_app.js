async function test() {
  const apiKey = 'whsec_f435b4c38030d47c31cd5220a963ba7615cf240780b8231a';
  const hosts = [
    'https://app.doronx.com',
    'https://webapi.doronpay.com',
    'https://doronx.com'
  ];
  const paths = [
    '/api/v1/invoices',
    '/api/invoices',
    '/v1/invoices',
    '/api/smart-invoice',
    '/api/bitcoin/smart-invoice',
    '/smart-invoice'
  ];

  for (const host of hosts) {
    for (const p of paths) {
      try {
        const res = await fetch(host + p, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            amount: 10,
            currency: 'GHS',
            reference: 'TEST-123',
            callback_url: 'https://tixlyevents-tickets-beta.vercel.app/payment/pending',
            webhook_url: 'https://tixlyevents-tickets-beta.vercel.app/api/webhooks/doronx'
          })
        });
        console.log(host + p, '=>', res.status);
        if (res.status !== 404 && res.status !== 405) {
          console.log('RESPONSE BODY:', await res.text());
        }
      } catch (e) {
        console.log(host + p, '=> ERROR:', e.message);
      }
    }
  }
}
test();
