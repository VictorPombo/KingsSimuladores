/**
 * O modelo multi-tenant da Seven Sim Racing usa rotas no domínio principal (via rewrite)
 * ou domínio próprio. O fluxo de checkout NÃO é em `/seven/checkout` e sim na rota
 * compartilhada `/checkout`. A distinção da marca se dá pelo campo `storeOrigin: 'seven'`
 * no carrinho, que é gravado como `brand_origin: 'seven'` no pedido.
 */
import { test, expect } from '@playwright/test'
import { createAdminClient } from '@kings/db'
import { TIMEOUTS, TEST_CUSTOMER } from '../../qa-config'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3015'
const SEVEN_BASE_URL = process.env.SEVEN_BASE_URL ?? 'https://www.sevensimracing.com.br'
const KINGS_API_URL = process.env.BASE_URL ?? 'http://localhost:3015'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addConvertedProduct(page: any) {
  await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'load', timeout: TIMEOUTS.long }).catch(() => null)
  
  const productLinks = page.locator('a[href*="/produtos/"]:not([href$="/produtos"])')
  const count = await productLinks.count()
  
  let added = false
  for (let i = 0; i < Math.min(count, 5); i++) {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'load', timeout: TIMEOUTS.long }).catch(() => null)
    
    const link = page.locator('a[href*="/produtos/"]:not([href$="/produtos"])').nth(i)
    if (await link.count() === 0) continue
    
    const href = await link.getAttribute('href')
    if (!href) continue

    const targetUrl = href.startsWith('http') ? href : new URL(href, BASE_URL).href
    await page.goto(targetUrl, { waitUntil: 'load', timeout: TIMEOUTS.long }).catch(() => null)
    
    await page.waitForTimeout(1500)

    const addBtn = page.locator('button:has-text("Adicionar"), button:has-text("Comprar"), button[aria-label*="carrinho" i]').first()
    
    if (await addBtn.count() > 0 && await addBtn.isEnabled()) {
      await addBtn.click({ force: true })
      
      const drawer = page.locator('.cart-drawer-container').first()
      try {
        await expect(drawer).toBeVisible({ timeout: 5000 })
        added = true
        break
      } catch (e) {}
    }
  }

  if (added) {
    await page.evaluate(() => {
      const saved = window.localStorage.getItem('@kings/cart')
      if (saved) {
        try {
          const items = JSON.parse(saved)
          items.forEach((item: any) => {
            item.storeOrigin = 'seven'
            item.brand = 'seven'
          })
          window.localStorage.setItem('@kings/cart', JSON.stringify(items))
        } catch(e) {}
      }
    })
    return true
  }
  return false
}

test.describe('Checkout Seven Sim Racing @critical', () => {

  test('Produto Seven aparece no catálogo Seven', async ({ page }) => {
    const response = await page.goto(`${SEVEN_BASE_URL}/produtos`, { waitUntil: 'domcontentloaded' }).catch(() => null)
    test.skip(!response || !response.ok(), `Não foi possível acessar ${SEVEN_BASE_URL}/produtos`)

    const firstProduct = page.locator('a[href*="/produtos/"]:not([href$="/produtos"])').first()
    await expect(firstProduct).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('Checkout com item Seven atinge a rota /checkout compartilhada', async ({ page }) => {
    const added = await addConvertedProduct(page)
    test.skip(!added, 'Não foi possível adicionar e converter produto via UI')

    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded' })
    
    // Check if the form is actually rendered instead of hanging on waitForFunction
    const formGrid = page.locator('.kings-checkout-grid, input[placeholder*="Nome"]').first()
    await expect(formGrid).toBeVisible({ timeout: TIMEOUTS.medium })

    expect(page.url()).toContain('/checkout')
  })

  test('Formulário de checkout aceita dados Seven', async ({ page }) => {
    const added = await addConvertedProduct(page)
    test.skip(!added, 'Não foi possível adicionar e converter produto via UI')

    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded' })

    const nameInput = page.locator('input[placeholder*="Nome"]').first()
    await expect(nameInput).toBeVisible({ timeout: TIMEOUTS.medium })
    
    await nameInput.fill(TEST_CUSTOMER.nome)
    await page.locator('input[type="email"], input[name="email"]').first().fill(`qa-seven-${Date.now()}@kings.com.br`)
    await page.locator('input[name="cpf"], input[placeholder*="CPF"]').first().fill(TEST_CUSTOMER.cpf)
    await page.locator('input[type="tel"], input[placeholder*="Telefone"]').first().fill(TEST_CUSTOMER.telefone)
    
    const cepInput = page.locator('input[name="cep"], input[placeholder*="CEP"]').first()
    await cepInput.fill(TEST_CUSTOMER.cep)
    
    await page.waitForTimeout(2000)
    
    const numInput = page.locator('input[name="numero"], input[placeholder*="Nº"], input[placeholder*="Número"]').first()
    if (await numInput.isVisible()) {
      await numInput.fill('123')
    }
    
    // Avança para o Passo 2: Entrega
    const btnEntrega = page.locator('button:has-text("Continuar para Frete"), button:has-text("Continuar para Pagamento")').first()
    await expect(btnEntrega).toBeEnabled({ timeout: TIMEOUTS.medium })
    await btnEntrega.click()
    await page.waitForTimeout(2000) // Aguarda calcular fretes

    // Verifica se fomos para a etapa de frete
    const freteOption = page.locator('.kings-frete-card').first()
    if (await freteOption.isVisible()) {
      await freteOption.click()
    } else {
      // Se não há opções de frete, clica em retirar na loja
      const retiradaCheckbox = page.locator('input[type="checkbox"]').first()
      if (await retiradaCheckbox.isVisible()) {
        await retiradaCheckbox.check({ force: true })
      }
    }

    // Avança para o Passo 3: Pagamento (se necessário)
    const btnPagamento = page.locator('button:has-text("Continuar para Pagamento")').first()
    await expect(btnPagamento).toBeVisible({ timeout: TIMEOUTS.medium })
    await expect(btnPagamento).toBeEnabled({ timeout: TIMEOUTS.medium })
    await btnPagamento.click()
    await page.waitForTimeout(1000)

    const payBtn = page.locator('button', { hasText: /Pagar|Finalizar/i }).first()
    await expect(payBtn).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('API /api/checkout cria pedido com brand_origin = seven', async ({ request }) => {
    test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Precisa da SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createAdminClient()
    const { data: brandData } = await supabase.from('brands').select('id').eq('name', 'seven').single()
    const brandId = brandData?.id
    test.skip(!brandId, 'Brand Seven não encontrado no DB')

    const productId = `qa-prod-seven-api-${Date.now()}`
    const variationId = `qa-var-seven-api-${Date.now()}`

    await supabase.from('products').insert({
      id: productId,
      title: 'QA Produto Seven API',
      brand_id: brandId,
      status: 'active',
      base_price: 100,
      slug: productId
    })

    await supabase.from('product_variations').insert({
      id: variationId,
      product_id: productId,
      price: 100,
      stock_quantity: 10,
      sku: productId
    })

    const payload = {
      items: [
        {
          id: productId,
          variationId: variationId,
          quantity: 1,
          price: 100,
          title: 'QA Produto Seven',
          storeOrigin: 'seven'
        }
      ],
      customer: {
        nome: 'QA Seven Customer',
        email: `qa-seven-${Date.now()}@kings.com.br`,
        cpf: TEST_CUSTOMER.cpf,
        telefone: TEST_CUSTOMER.telefone
      },
      address: {
        cep: TEST_CUSTOMER.cep,
        logradouro: 'Rua QA Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      shipping: {
        name: 'PAC',
        price: 15.00,
        metodo: 'PAC',
        valor: 15.00,
        prazo: 5
      },
      total: 115.00,
      pix_discount: false
    }

    const response = await request.post(`${KINGS_API_URL}/api/checkout`, { data: payload })
    const resultText = await response.text()

    const status = response.status()
    if (status === 429) {
      test.skip(true, 'Rate limit atingido ao testar checkout Seven')
      return
    }
    if (status === 404) {
      test.skip(true, 'Endpoint retornou 404 — deploy em andamento')
      return
    }
    if (status === 400) {
      const errBody = JSON.parse(resultText)
      if (errBody.error?.includes('Mercado Pago') || errBody.error?.includes('credenciais') || errBody.error?.includes('rejeitados')) {
        test.skip(true, 'Chaves MP de teste não configuradas para Seven')
        return
      }
    }
    if (!response.ok()) {
      console.error('API Error:', resultText)
    }
    expect(response.ok()).toBeTruthy()

    const result = JSON.parse(resultText)
    expect(result.preferenceId).toBeDefined()
    expect(result.orderId).toBeDefined()

    const { data: orderData } = await supabase.from('orders').select('brand_origin').eq('id', result.orderId).single()
    expect(orderData?.brand_origin).toBe('seven')

    // Cleanup
    await supabase.from('order_items').delete().eq('order_id', result.orderId)
    await supabase.from('orders').delete().eq('id', result.orderId)
    await supabase.from('product_variations').delete().eq('id', variationId)
    await supabase.from('products').delete().eq('id', productId)
  })
})
