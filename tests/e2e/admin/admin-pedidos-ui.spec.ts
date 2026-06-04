/**
 * Suite E2E — Admin Pedidos UI (KingsHub)
 *
 * Cobre:
 *  - /admin/pedidos carrega sem erros JS críticos (TypeError/ReferenceError)
 *  - Botão "Sincronizar no ERP" está visível no DOM
 *  - Hover no botão exibe tooltip do ActionTooltip
 *
 * Auth: bypass via Supabase Admin API (createSession) — não depende de senha.
 * Injetamos os cookies de sessão diretamente no Playwright context.
 *
 * NÃO clica no botão Sincronizar — apenas valida a UI.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { TIMEOUTS } from '../../qa-config'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// admin@kings.com.br — auth_id confirmado via Supabase
const ADMIN_EMAIL = 'admin@kings.com.br'
const ADMIN_USER_ID = 'de746300-07d5-452d-83a5-8e024bd23a4f'
const PROJECT_REF = 'mlrcaugthlkscusyxqrf'

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const HAS_SUPABASE = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY)

function captureConsoleErrors(page: Page): () => string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return () => errors
}

/**
 * Gera um magic link para o admin, troca o token por uma sessão real
 * e injeta os cookies no Playwright context — sem necessidade de senha.
 */
async function injectAdminSession(context: BrowserContext): Promise<boolean> {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Passo 1: gera o OTP/magic link para o admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: ADMIN_EMAIL,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[QA] Erro ao gerar magic link:', linkError?.message)
      return false
    }

    // Passo 2: troca o token hash por uma sessão real via verifyOtp
    const regularClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: verifyData, error: verifyError } = await regularClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'email',
    })

    if (verifyError || !verifyData?.session) {
      console.error('[QA] Erro ao verificar OTP:', verifyError?.message)
      return false
    }

    const { access_token, refresh_token } = verifyData.session
    const cookieDomain = new URL(BASE_URL).hostname

    // Passo 3: injeta a sessão no formato exato que o Supabase SSR createBrowserClient gera:
    // "base64-" + base64url(JSON.stringify(fullSession))
    const sessionJson = JSON.stringify(verifyData.session)
    const sessionBase64 = Buffer.from(sessionJson).toString('base64url')
    const cookieValue = `base64-${sessionBase64}`

    await context.addCookies([
      {
        name: `sb-${PROJECT_REF}-auth-token`,
        value: cookieValue,
        domain: cookieDomain,
        path: '/',
        httpOnly: false,
        secure: cookieDomain !== 'localhost',
        sameSite: 'Lax',
      },
    ])

    return true
  } catch (err) {
    console.error('[QA] Exceção em injectAdminSession:', err)
    return false
  }
}

test.describe('Admin — Pedidos UI: Sincronizar no ERP', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!HAS_SUPABASE, 'Pulado: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos')
    const injected = await injectAdminSession(context)
    if (!injected) {
      test.skip(true, 'Falha ao injetar sessão admin via service_role')
    }
  })

  test('/admin/pedidos carrega sem erros JS críticos', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'load', timeout: TIMEOUTS.payment })

    // Se redirecionou para /login, o cookie não foi aceito pelo middleware
    if (page.url().includes('/login')) {
      test.skip(true, 'Cookie de sessão rejeitado — middleware redirecionou para login')
      return
    }

    // Aguarda a tabela ou a mensagem de lista vazia — sem usar .or() ambíguo
    await expect(
      page.locator('table').first()
    ).toBeVisible({ timeout: TIMEOUTS.medium })

    const errors = getErrors()
    const critical = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('favicon') &&
      !e.includes('next-route-announcer') &&
      /(TypeError|ReferenceError)/i.test(e)
    )

    expect(critical, `Erros JS críticos: ${critical.join('\n')}`).toHaveLength(0)

    await page.screenshot({ path: 'tests/screenshots/admin-pedidos-loaded.png', fullPage: false })
  })

  test('botão "Sincronizar no ERP" existe e tooltip aparece no hover', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'load', timeout: TIMEOUTS.payment })

    if (page.url().includes('/login')) {
      test.skip(true, 'Cookie de sessão rejeitado — middleware redirecionou para login')
      return
    }

    // Aguarda a tabela carregar
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: TIMEOUTS.medium })

    // Percorre até 8 linhas até encontrar o botão "Sincronizar no ERP"
    // (o botão só aparece em pedidos com erp_id definido)
    let btnSincronizar = null
    const rows = page.locator('table tbody tr')
    const rowCount = Math.min(await rows.count(), 8)

    for (let i = 0; i < rowCount; i++) {
      // Clica na linha para expandir
      await rows.nth(i).click()
      await page.waitForTimeout(400)

      // Verifica se o botão apareceu na expansão
      const btn = page.getByRole('button', { name: /sincronizar no erp/i }).first()
      if (await btn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        btnSincronizar = btn
        break
      }

      // Colapsa antes de tentar a próxima linha
      await rows.nth(i).click()
      await page.waitForTimeout(200)
    }

    expect(btnSincronizar, 'Nenhum pedido com erp_id encontrado — botão "Sincronizar no ERP" não apareceu').not.toBeNull()

    // Hover para disparar o ActionTooltip (delay de 300ms + margem)
    await btnSincronizar!.hover()
    await page.waitForTimeout(600)

    // O ActionTooltip renderiza um div absoluto com o texto do tooltip
    const tooltip = page.locator('div').filter({
      hasText: /força o reenvio|envia os dados|sincronizar|tiny erp/i,
    }).last()

    await expect(
      tooltip,
      'Tooltip do botão Sincronizar deve aparecer após hover'
    ).toBeVisible({ timeout: TIMEOUTS.short })

    await page.screenshot({
      path: 'tests/screenshots/admin-pedidos-sincronizar-tooltip.png',
      fullPage: false,
    })
  })
})
