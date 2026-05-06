require('dotenv').config({ path: '.env.local' });

async function test() {
  const token = process.env.MP_ACCESS_TOKEN;
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 10, currency_id: 'BRL' }]
    })
  });
  const data = await res.json();
  console.log("MP Response:", res.status, data);
}
test();
