require('dotenv').config({ path: '.env.local' });

async function run() {
  const payload = {
    SellerCEP: '12929608',
    RecipientCEP: '03222030', // from screenshot
    ShipmentInvoiceValue: 100,
    ShippingItemArray: [
      { Height: 20, Length: 20, Width: 20, Weight: 2, Quantity: 1 }
    ]
  };

  const response = await fetch("https://api.frenet.com.br/shipping/quote", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': process.env.FRENET_TOKEN_KINGS
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
