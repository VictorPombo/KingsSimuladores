require('dotenv').config({ path: '.env.local' });
async function test() {
  const token = process.env.OLIST_API_KEY_KINGS;
  
  const tinyProduto = {
    produto: {
      id: "342943876",
      origem: "0" // Nacional
    }
  };

  const params = new URLSearchParams();
  params.append('token', token);
  params.append('formato', 'json');
  params.append('produto', JSON.stringify(tinyProduto));

  const res = await fetch('https://api.tiny.com.br/api2/produto.alterar.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
