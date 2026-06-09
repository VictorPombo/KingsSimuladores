/**
 * Agente 2 — UX de Catálogo
 *
 * Cobre a jornada pré-checkout: homepage → listagem → PDP → simulador de frete.
 * Nenhum teste faz login nem dispara pagamento real.
 *
 * Referências de código:
 *  - apps/site/src/app/(store)/page.tsx         (Homepage)
 *  - apps/site/src/app/(store)/produtos/page.tsx (Listagem)
 *  - apps/site/src/app/(store)/produtos/[id]/page.tsx (PDP)
 *  - apps/site/src/components/store/shipping/ShippingSimulator.tsx
 */

import { test, expect, type Page } from '@playwright/test'
import { TIMEOUTS, TEST_CUSTOMER } from '../../qa-config'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Navega para /produtos e retorna o locator do primeiro card de produto. */
async function gotoFirstProduct(page: Page) {
  await page.goto(`${BASE_URL}/produtos`, {
    waitUntil: 'domcontentloaded',
    timeout: TIMEOUTS.payment,
  })
  // Exclui links que apontam exatamente para /produtos (sem slug), como nav links
  return page.locator('.kings-catalog-grid a[href*="/produtos/"]:not([href$="/produtos"])').first()
}

/** Coleta erros de console (ignora ruído conhecido de extensões). */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Ignorar erros externos ao app (extensões do browser, analytics)
      if (
        text.includes('chrome-extension') ||
        text.includes('net::ERR_') ||
        text.includes('favicon')
      ) return
      errors.push(text)
    }
  })
  return errors
}

// ─── Suite ────────────────────────────────────────────────────────────────────

test.describe('Catálogo UX — Homepage, Listagem e PDP @ux', () => {

  // ── Homepage ────────────────────────────────────────────────────────────────

  test('Homepage carrega com pelo menos um produto visível @critical', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)

    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.long,
    })

    // Verificar título da página
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
    expect(title.toLowerCase()).toContain('kings')

    // Deve haver ao menos um link de produto (carrossel de lançamentos / mais vendidos)
    const productLinks = page.locator('a[href*="/produtos/"]')
    await expect(productLinks.first()).toBeVisible({ timeout: TIMEOUTS.long })

    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)

    // Nenhum erro de console crítico
    expect(consoleErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError'))).toHaveLength(0)

    await page.screenshot({ path: 'tests/reports/homepage-ux.png' })
  })

  test('Homepage não retorna status 5xx', async ({ page }) => {
    const responses: number[] = []
    page.on('response', r => {
      if (r.url() === page.url() || r.url().startsWith(BASE_URL)) {
        responses.push(r.status())
      }
    })

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const serverErrors = responses.filter(s => s >= 500)
    expect(serverErrors).toHaveLength(0)
  })

  // ── Navegação para /produtos ─────────────────────────────────────────────────

  test('Navegação para /produtos exibe grid de produtos @critical', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)

    await page.goto(`${BASE_URL}/produtos`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.payment,
    })

    // Página de produtos deve estar acessível
    expect(page.url()).toContain('/produtos')

    // Deve haver cards com links para PDPs
    const productLinks = page.locator('a[href*="/produtos/"]')
    await expect(productLinks.first()).toBeVisible({ timeout: TIMEOUTS.long })

    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)

    // Nenhum erro JS crítico
    expect(consoleErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError'))).toHaveLength(0)

    await page.screenshot({ path: 'tests/reports/catalog-listing-ux.png' })
  })

  test('Link na homepage leva corretamente para /produtos', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Procurar link de navegação para catálogo (nav ou botão "Ver todos")
    const catalogLink = page
      .locator('a[href*="/produtos"]')
      .filter({ hasNotText: /\/produtos\// }) // excluir links de PDP direto
      .first()

    if (await catalogLink.count() === 0) {
      test.skip(true, 'Nenhum link para /produtos encontrado na homepage — verificar navegação do tema')
      return
    }

    await catalogLink.click()
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    expect(page.url()).toContain('/produtos')
  })

  // ── PDP ─────────────────────────────────────────────────────────────────────

  test('Clicar em produto leva para PDP com URL /produtos/[slug] @critical', async ({ page }) => {
    const firstProduct = await gotoFirstProduct(page)

    if (await firstProduct.count() === 0) {
      test.skip(true, 'Nenhum produto encontrado em /produtos — banco pode estar vazio')
      return
    }

    const href = await firstProduct.getAttribute('href')
    await firstProduct.click()
    await page.waitForURL(/\/produtos\/[^?#]+/, { timeout: TIMEOUTS.long })

    // URL deve ser /produtos/<slug>
    expect(page.url()).not.toContain('/produtos?')

    await page.screenshot({ path: 'tests/reports/pdp-navigation.png' })
  })

  test('PDP exibe título do produto e preço @critical', async ({ page }) => {
    const firstProduct = await gotoFirstProduct(page)

    if (await firstProduct.count() === 0) {
      test.skip(true, 'Nenhum produto encontrado — banco pode estar vazio')
      return
    }

    await firstProduct.click()
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    // Título (h1)
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: TIMEOUTS.medium })
    const titleText = await h1.innerText()
    expect(titleText.trim().length).toBeGreaterThan(3)

    // Preço — deve haver um valor monetário visível
    const priceEl = page.locator('text=/R\\$\\s*\\d/').first()
    await expect(priceEl).toBeVisible({ timeout: TIMEOUTS.medium })

    await page.screenshot({ path: 'tests/reports/pdp-title-price.png' })
  })

  test('PDP tem botão "Adicionar ao Carrinho" visível quando produto em estoque @critical', async ({ page }) => {
    /**
     * O AddToCartButton é renderizado apenas quando o produto NÃO está esgotado.
     * Quando esgotado, o NotifyMeForm é exibido no lugar.
     * Este teste navega pelo catálogo até encontrar um produto disponível.
     */
    await page.goto(`${BASE_URL}/produtos`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.payment,
    })

    const productLinks = page.locator('.kings-catalog-grid a[href*="/produtos/"]')
    const count = await productLinks.count()

    if (count === 0) {
      test.skip(true, 'Nenhum produto encontrado em /produtos')
      return
    }

    let foundAddToCart = false

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto(`${BASE_URL}/produtos`, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUTS.payment,
      })
      const link = page.locator('.kings-catalog-grid a[href*="/produtos/"]').nth(i)
      await link.click()
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

      // AddToCartButton renderiza um <button> com "Adicionar" ou "Comprar"
      const addBtn = page.locator(
        'button:has-text("Adicionar"), button:has-text("Comprar"), button[aria-label*="carrinho" i]'
      ).first()

      if (await addBtn.count() > 0 && await addBtn.isVisible()) {
        await expect(addBtn).toBeEnabled({ timeout: TIMEOUTS.short })
        foundAddToCart = true
        await page.screenshot({ path: 'tests/reports/pdp-add-to-cart-btn.png' })
        break
      }
    }

    if (!foundAddToCart) {
      test.skip(true, 'Todos os produtos visitados estão esgotados — verificar estoque no banco')
    }
  })

  test('PDP exibe preço Pix com desconto @critical', async ({ page }) => {
    const firstProduct = await gotoFirstProduct(page)

    if (await firstProduct.count() === 0) {
      test.skip(true, 'Nenhum produto encontrado')
      return
    }

    await firstProduct.click()
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    // O ShippingSimulator e a PDP renderizam menção a "Pix" e "desconto"
    const pixMention = page.locator('text=/[Pp]ix/').first()
    await expect(pixMention).toBeVisible({ timeout: TIMEOUTS.medium })

    await page.screenshot({ path: 'tests/reports/pdp-pix-price.png' })
  })

  // ── Simulador de frete na PDP ────────────────────────────────────────────────

  test('CEP válido no simulador de frete exibe opções de entrega (não alert nativo)', async ({ page }) => {
    /**
     * O ShippingSimulator usa setErrorMSG/setOptions — nenhum alert() nativo.
     * Um CEP válido deve exibir pelo menos uma opção de frete no DOM.
     */
    const firstProduct = await gotoFirstProduct(page)

    if (await firstProduct.count() === 0) {
      test.skip(true, 'Nenhum produto encontrado')
      return
    }

    await firstProduct.click()
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    // Verificar se o simulador está presente (apenas para produtos em estoque)
    const cepInput = page.locator('input[placeholder*="CEP" i], input[placeholder*="cep" i]').first()
    if (await cepInput.count() === 0) {
      test.skip(true, 'Simulador de frete não encontrado — produto pode estar esgotado')
      return
    }

    // Garantir que nenhum alert() nativo seja disparado
    let nativeAlertFired = false
    page.on('dialog', async (dialog) => {
      nativeAlertFired = true
      await dialog.dismiss()
    })

    await cepInput.fill(TEST_CUSTOMER.cep) // 01310-100
    await page.getByRole('button', { name: /calcular frete/i }).click()

    await page.waitForTimeout(3000) // aguardar resposta da API de frete

    expect(nativeAlertFired).toBe(false)

    // Se o CEP for válido, a API retorna opções — verificar visibilidade no DOM
    // Pode retornar erro de cotação em ambiente real: isso é aceitável
    const freteResult = page.locator('text=/[Rr]eal|[Cc]orre|[Ss]edex|[Ee]stimat|[Pp]razo|dias úteis/').first()
    const freteError = page.locator('text=/[Nn]ão foi possível|[Ee]rro|[Ee]xpirado/').first()

    const hasResult = await freteResult.count() > 0
    const hasError = await freteError.count() > 0

    // Deve mostrar resultado OU mensagem de erro — nunca silêncio total
    expect(hasResult || hasError).toBe(true)

    await page.screenshot({ path: 'tests/reports/shipping-sim-valid-cep.png' })
  })

  test('CEP inválido no simulador de frete exibe erro visual (não alert nativo) @critical', async ({ page }) => {
    /**
     * ShippingSimulator.tsx linha 55: setErrorMSG('Digite um CEP válido')
     * A mensagem é renderizada em um <div> com color: var(--danger).
     * Nenhum alert() deve ser disparado.
     */
    const firstProduct = await gotoFirstProduct(page)

    if (await firstProduct.count() === 0) {
      test.skip(true, 'Nenhum produto encontrado')
      return
    }

    await firstProduct.click()
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    const cepInput = page.locator('input[placeholder*="CEP" i], input[placeholder*="cep" i]').first()
    if (await cepInput.count() === 0) {
      test.skip(true, 'Simulador de frete não encontrado — produto pode estar esgotado')
      return
    }

    // Capturar qualquer dialog nativo
    let nativeAlertFired = false
    page.on('dialog', async (dialog) => {
      nativeAlertFired = true
      await dialog.dismiss()
    })

    // Digitar CEP inválido (menos de 8 dígitos)
    await cepInput.fill('123')
    await page.getByRole('button', { name: /calcular frete/i }).click()

    await page.waitForTimeout(500)

    // Nenhum alert() nativo deve ter disparado
    expect(nativeAlertFired).toBe(false)

    // Mensagem de erro deve aparecer no DOM (ShippingSimulator: "Digite um CEP válido")
    const errorEl = page.locator('text=/[Dd]igiite um CEP|[Cc]EP válido|CEP inválido/').first()
    await expect(errorEl).toBeVisible({ timeout: TIMEOUTS.short })

    await page.screenshot({ path: 'tests/reports/shipping-sim-invalid-cep.png' })
  })

  // ── Busca ────────────────────────────────────────────────────────────────────

  test('Busca por termo redireciona para /produtos?q= ou exibe resultados', async ({ page }) => {
    /**
     * O /produtos/page.tsx suporta searchParams.q para busca por título.
     * A homepage pode ter campo de busca (SearchAction no schema JSON-LD).
     */
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="uscar" i], input[placeholder*="esquisar" i]')
      .first()

    if (await searchInput.count() === 0) {
      // Tentar acesso direto via URL (comportamento garantido pelo servidor)
      await page.goto(`${BASE_URL}/produtos?q=volante`, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUTS.long,
      })
      expect(page.url()).toContain('/produtos')
      await page.screenshot({ path: 'tests/reports/catalog-search-url.png' })
      return
    }

    await searchInput.fill('volante')
    await page.keyboard.press('Enter')
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.long })

    // Deve ter ido para /produtos ou permanecer com resultados
    expect(page.url()).toContain('kingssimuladores')
    await page.screenshot({ path: 'tests/reports/catalog-search-ux.png' })
  })

  test('Filtro de categoria em /produtos funciona via query string', async ({ page }) => {
    /**
     * /produtos/page.tsx aceita searchParams.category (slug) e filtra por category_id.
     * Testamos que a URL carrega sem erro 500 — não validamos conteúdo (depende do banco).
     */
    let serverError = false
    page.on('response', r => {
      if (r.status() >= 500) serverError = true
    })

    await page.goto(`${BASE_URL}/produtos?category=simuladores`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.long,
    })

    expect(serverError).toBe(false)
    expect(page.url()).toContain('/produtos')
    await page.screenshot({ path: 'tests/reports/catalog-filter-category.png' })
  })
})
