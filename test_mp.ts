const token = 'APP_USR-5756146414688811-041411-39241e851bac856602a3200d0fee6329-1652035007';

async function run() {
  const payload = {
    items: [
      {
        title: "Test Item",
        quantity: 1,
        unit_price: 100
      }
    ],
    payer: {
      email: "test_user_123456@testuser.com"
    },
    external_reference: "TEST-1234"
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
  console.log('Status:', res.status);
  console.log('Body:', text);
}

run();
