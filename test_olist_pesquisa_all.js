require('dotenv').config({ path: '.env.local' });
async function test() {
  const token = process.env.OLIST_API_KEY_KINGS;
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while(hasMore) {
    const res = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${token}&formato=json&pagina=${page}`
    });
    const data = await res.json();
    if(data.retorno.status === 'Erro') {
       hasMore = false;
    } else {
       const prods = data.retorno.produtos || [];
       allProducts = allProducts.concat(prods);
       if(prods.length < 100) hasMore = false;
       else page++;
    }
  }
  console.log(`Total Olist products across all pages: ${allProducts.length}`);
}
test();
