require('dotenv').config({ path: '.env.local' });
const token = process.env.MP_ACCESS_TOKEN;
fetch("https://api.mercadopago.com/v1/payments/157927740868", {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(data => console.log(data.status, data.status_detail));
