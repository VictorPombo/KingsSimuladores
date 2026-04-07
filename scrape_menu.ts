import * as cheerio from 'cheerio';

async function scrape() {
  try {
    const res = await fetch('https://www.kingssimuladores.com.br/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Loja Integrada uses .menu.superior or a nav element
    const menuItems: any[] = [];
    $('.menu.superior .nivel-um > li, .menu-lista > li').each((i, el) => {
      let a = $(el).find('> a').first();
      // Se não achar o <a> direto, pega o span ou a tag principal
      if (!a.length) {
        a = $(el).find('a').first();
      }
      const name = a.text().trim();
      const href = a.attr('href');
      
      const subItems: any[] = [];
      $(el).find('.nivel-dois > li > a, .dropdown-menu a, .submenu a').each((j, subEl) => {
        const subName = $(subEl).text().trim();
        if (subName) {
           subItems.push({
             name: subName,
             href: $(subEl).attr('href'),
           });
        }
      });
      
      if (name) {
        menuItems.push({ name, href, subItems });
      }
    });

    console.log('MENU ITEMS EXTRACTED:');
    console.log(JSON.stringify(menuItems, null, 2));
  } catch (err) {
    console.error(err);
  }
}
scrape();
