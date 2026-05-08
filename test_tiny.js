require('dotenv').config({ path: '.env.local' });
async function test() {
  const token = process.env.OLIST_API_KEY_KINGS;
  // Let's search for the API endpoint "gerar.nota.fiscal.pedido.php"
  const params = new URLSearchParams();
  params.append('token', token);
  params.append('id', '344997097'); // The erp_id of Davi's order
  params.append('formato', 'json');

  const res = await fetch('https://api.tiny.com.br/api2/gerar.nota.fiscal.pedido.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  console.log(await res.text());
}
test();
