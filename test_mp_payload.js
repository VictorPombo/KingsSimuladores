require('dotenv').config({ path: '.env.local' });

async function test() {
  const token = process.env.MP_ACCESS_TOKEN;
  const payload = {
    items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 10, currency_id: 'BRL' }],
    payer: { nome: "Davi Gomes", email: "davidgomesvieira.ted@gmail.com", cpf: "12345678900" },
    external_reference: '12345',
    back_urls: { success: '', pending: '', failure: '' },
    auto_return: 'approved'
  };
  
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  console.log("MP Response:", res.status, text);
}
test();
