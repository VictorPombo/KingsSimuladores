require('dotenv').config({ path: '.env.local' });

async function run() {
  const token = process.env.FRENET_TOKEN_KINGS;
  
  // Try the Frenet shipment list endpoint (painel-like)
  const endpoints = [
    { url: "https://api.frenet.com.br/shipping/shipment", method: "GET" },
    { url: "https://api.frenet.com.br/order/list", method: "GET" },
    { url: "https://api.frenet.com.br/order/labelcart", method: "GET" },
    { url: "https://api.frenet.com.br/shipping/shipment/list", method: "GET" },
    { url: "https://api.frenet.com.br/shipping/order/list", method: "GET" },
    { url: "https://painel.frenet.com.br/api/Order/LabelCart", method: "GET" },
  ];
  
  for (const ep of endpoints) {
    console.log(`\n--- ${ep.method} ${ep.url} ---`);
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        }
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Body:", text.substring(0, 300));
    } catch(e) {
      console.error("Error:", e.message);
    }
  }
}
run();
