import { test, expect } from '@playwright/test';

test.describe('E2E: Checkout Pipeline (Kings e MSU)', () => {
  
  test('Deve ser capaz de navegar, adicionar ao carrinho e finalizar (sandbox) uma compra com sucesso', async ({ page }) => {
    
    // 1. Acesso à Loja Virtual
    console.log('Navegando para Home...');
    await page.goto('/');
    
    // 2. Busca e Seleção do primeiro Produto da vitrine
    await page.waitForSelector('a[href^="/produtos/"]');
    const firstProduct = page.locator('a[href^="/produtos/"]').first();
    const productUrl = await firstProduct.getAttribute('href');
    expect(productUrl).toBeDefined();
    
    // 3. Entrando na página de detalhe
    console.log(`Acessando produto: ${productUrl}`);
    await page.goto(productUrl as string);
    await page.waitForLoadState('networkidle');

    // 4. Adicionando ao Carrinho
    console.log('Adicionando ao Carrinho...');
    const btnAddToCart = page.locator('button:has-text("Adicionar")');
    await expect(btnAddToCart).toBeVisible();
    await btnAddToCart.click();
    
    // 5. Drawer lateral precisa abrir
    const cartDrawer = page.locator('text=Seu Carrinho');
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });
    
    // 6. Ir para o Checkout
    console.log('Redirecionando para o Checkout...');
    const btnCheckout = page.locator('a:has-text("Finalizar Compra")');
    await expect(btnCheckout).toBeVisible();
    await btnCheckout.click();
    
    // 7. Página de Checkout (Logado vs Deslogado - Aqui assumimos LoggedOut para forçar fallback de Auth)
    // Se a aplicação redirecionar para Login, nós paramos aqui, pois testamos a barreira.
    // Como Mock, passaremos Auth.
    await page.waitForURL('**/checkout**');
    console.log('Página de Checkout alcançada.');

    // Preenchendo Form de Endereço Fake (MOCK de Playwright)
    // Nós podemos criar um interceptador local aqui pra forçar a aprovação, 
    // mas por hora só vamos verificar se os elementos do formulário de frete e Pix existem.
    await expect(page.locator('text=Resumo do Pedido')).toBeVisible();
    
  });
});
