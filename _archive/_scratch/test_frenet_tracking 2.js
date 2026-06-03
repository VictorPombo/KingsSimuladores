require('dotenv').config({ path: '.env.local' });

async function run() {
  const token = process.env.FRENET_TOKEN_KINGS;
  
  // Test tracking info endpoint
  const payload = {
    TrackingNumber: "QU247608282BR",  // Example tracking number
    ShipmentOrderId: "24375928"
  };

  console.log("Testing /tracking/trackinginfo ...");
  const res = await fetch("https://api.frenet.com.br/tracking/trackinginfo", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
