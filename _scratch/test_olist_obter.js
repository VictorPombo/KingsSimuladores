require('dotenv').config({ path: '.env.local' });
async function test() {
  const token = process.env.OLIST_API_KEY_KINGS;
  // Get an ID from previous run: 342940643
  const params = new URLSearchParams();
  params.append('token', token);
  params.append('formato', 'json');
  params.append('id', '342940643');

  const res = await fetch('https://api.tiny.com.br/api2/produto.obter.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await res.json();
  console.log(JSON.stringify(data.retorno.produto, null, 2));
}
test();
