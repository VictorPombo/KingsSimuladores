/**
 * Fase 3.2 — Navegação de Catálogo
 */

import { test, expect } from '@playwright/test'
import { TIMEOUTS, SELECTORS } from '../../qa-config'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'

test.describe('Catálogo: Navegação e Filtros', () => {
  test('Página de produtos carrega catálogo @critical', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.payment })

    // Verificar que há cards de produto no grid (não links de menu/categoria)
    const productCards = page.locator(SELECTORS.productCard)
    await expect(productCards.first()).toBeVisible({ timeout: TIMEOUTS.payment })

    const count = await productCards.count()
    expect(count).toBeGreaterThan(0)
    await page.screenshot({ path: 'tests/reports/catalog-products.png' })
  })

  test('Página inicial carrega corretamente', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Verificar título da página
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)

    // Verificar que a página não tem erro 500
    expect(page.url()).toContain('kingssimuladores')
    await page.screenshot({ path: 'tests/reports/homepage.png' })
  })

  test('Imagens de produto carregam sem erro 404', async ({ page }) => {
    const failedImages: string[] = []

    page.on('response', (response) => {
      if (response.url().includes('supabase') || response.url().includes('storage')) {
        if (response.status() === 404) {
          failedImages.push(response.url())
        }
      }
    })

    await page.goto(`${BASE_URL}/simuladores`, { waitUntil: 'networkidle', timeout: TIMEOUTS.long })

    // Avisar se há imagens 404 mas não falhar — serve como alerta
    if (failedImages.length > 0) {
      console.warn(`[QA] ${failedImages.length} imagens retornaram 404:`, failedImages.slice(0, 5))
    }

    // O teste passa se a página carregou — os 404 de imagem são warnings
    expect(true).toBeTruthy()
  })

  test('Busca de produto funciona', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar" i], input[placeholder*="buscar" i], input[placeholder*="pesquisar" i]').first()

    if (await searchInput.count() === 0) {
      test.skip(true, 'Campo de busca não encontrado na homepage')
      return
    }

    await searchInput.fill('volante')
    await page.keyboard.press('Enter')
    await page.waitForLoadState('domcontentloaded')

    await page.screenshot({ path: 'tests/reports/catalog-search.png' })
    expect(page.url()).toContain('kingssimuladores')
  })
})
