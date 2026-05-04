require('dotenv').config({ path: 'apps/site/.env.local' });

async function checkVariations(id) {
  const token = process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN;
  const params = new URLSearchParams({
    token: token,
    formato: 'json',
    id: id
  });
  
  const res = await fetch('https://api.tiny.com.br/api2/produto.obter.php?' + params.toString());
  const data = await res.json();
  console.log("Obter", id, JSON.stringify(data, null, 2));
}

checkVariations('342940354');
