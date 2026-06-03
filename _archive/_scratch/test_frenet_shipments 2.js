require('dotenv').config({ path: '.env.local' });

async function run() {
  const token = process.env.FRENET_TOKEN_KINGS;
  
  // Try to list shipments / orders from Frenet
  const endpoints = [
    "https://api.frenet.com.br/shipping/info",
    "https://api.frenet.com.br/v2/me/shipment",
    "https://api.frenet.com.br/shipment/shipmentinfo",
  ];
  
  for (const url of endpoints) {
    console.log(`\n--- Testing ${url} ---`);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        }
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Body:", text.substring(0, 500));
    } catch(e) {
      console.error("Error:", e.message);
    }
  }
}
run();
