require('dotenv').config({ path: 'apps/site/.env.local' });

async function checkSku(sku) {
  const token = process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN;
  const params = new URLSearchParams({
    token: token,
    formato: 'json',
    pesquisa: sku
  });
  
  const res = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php?' + params.toString());
  const data = await res.json();
  console.log("Pesquisa", sku, JSON.stringify(data, null, 2));
}

checkSku('cockpit_aviacao');
