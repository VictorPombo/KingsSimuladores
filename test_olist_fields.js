require('dotenv').config({ path: '.env.local' });
async function test() {
  const token = process.env.OLIST_API_KEY_KINGS;
  const res = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${token}&formato=json`
  });
  const data = await res.json();
  console.log(JSON.stringify(data.retorno.produtos[0], null, 2));
}
test();
