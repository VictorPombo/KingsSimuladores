const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Handle the confirm dialog automatically
  page.on('dialog', async dialog => {
    console.log('Dialog appeared:', dialog.message());
    await dialog.accept();
  });

  try {
    console.log('Navigating to Kings product...');
    await page.goto('http://localhost:3000');
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Evaluate in browser to add Kings item
    await page.evaluate(() => {
      const cartStr = localStorage.getItem('@kings/cart') || '[]';
      const cart = JSON.parse(cartStr);
      cart.push({ id: 'kings-1', title: 'Kings Item', price: 100, quantity: 1, brand: 'kings', imageUrl: '' });
      localStorage.setItem('@kings/cart', JSON.stringify(cart));
    });
    
    // Refresh to apply state
    await page.reload();
    console.log('Kings item added to cart.');
    
    let cartContent = await page.evaluate(() => localStorage.getItem('@kings/cart'));
    console.log('Cart content before conflict:', cartContent);

    console.log('Navigating to MSU product...');
    await page.goto('http://localhost:3000/usado/produtos');
    await page.waitForTimeout(2000);
    
    // Let's trigger the addItem function through the UI to test the confirm dialog
    // Actually, it's easier to dispatch a custom event or find a buy button.
    // Let's just find the first "Comprar Agora" or "Adicionar ao Carrinho" button and click it.
    console.log('Looking for Add to Cart button...');
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.toLowerCase().includes('comprar') || text.toLowerCase().includes('adicionar'))) {
        console.log('Clicking button:', text);
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      // Add fake MSU product directly via window method if it exists, or just log failure.
      console.log('Could not find buy button, trying to click first product link...');
      await page.click('a[href^="/usado/produtos/"]');
      await page.waitForTimeout(2000);
      const buyBtn = await page.$('button:has-text("Comprar")');
      if (buyBtn) {
        await buyBtn.click();
      } else {
        const addBtn = await page.$('button:has-text("Adicionar")');
        if (addBtn) await addBtn.click();
      }
    }

    await page.waitForTimeout(1000);
    cartContent = await page.evaluate(() => localStorage.getItem('@kings/cart'));
    console.log('Cart content after conflict:', cartContent);
    
  } catch(e) {
    console.error('Test error:', e);
  } finally {
    await browser.close();
  }
})();
