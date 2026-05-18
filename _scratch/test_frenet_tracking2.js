require('dotenv').config({ path: '.env.local' });

async function run() {
  const token = process.env.FRENET_TOKEN_KINGS;
  
  // Try the tracking info with CarrierCode and ServiceCode from the /shipping/info response
  const payload = {
    TrackingNumber: "QU247608282BR",
    ShippingServiceCode: "03220",
    CarrierCode: "COR"
  };

  console.log("Testing with ServiceCode+CarrierCode...");
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
