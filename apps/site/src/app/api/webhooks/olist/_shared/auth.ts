import { NextResponse } from 'next/server'

/**
 * Olist/Tiny ERP Webhook — Módulo Compartilhado
 * 
 * Valida a origem do callback e fornece utilitários comuns
 * para todos os 6 endpoints de notificação.
 */

const LOG_PREFIX = '[Olist Webhook]'

/** Tokens permitidos (Kings + Seven) */
function getAllowedTokens(): string[] {
  const tokens: string[] = []
  if (process.env.OLIST_API_KEY_KINGS) tokens.push(process.env.OLIST_API_KEY_KINGS)
  if (process.env.OLIST_API_KEY_SABRINA) tokens.push(process.env.OLIST_API_KEY_SABRINA)
  if (process.env.OLIST_API_KEY_SEVEN) tokens.push(process.env.OLIST_API_KEY_SEVEN)
  if (process.env.OLIST_ACCESS_TOKEN) tokens.push(process.env.OLIST_ACCESS_TOKEN)
  return tokens
}

/**
 * Identifica a loja de origem com base no token recebido.
 * Retorna 'kings' | 'seven' | null (se inválido).
 */
export function identifyStoreByToken(token: string | null): 'kings' | 'seven' | 'sabrina_prado' | null {
  if (!token) return null
  if (token === process.env.OLIST_API_KEY_SEVEN) return 'seven'
  if (token === process.env.OLIST_API_KEY_SABRINA) return 'sabrina_prado'
  if (token === process.env.OLIST_API_KEY_KINGS || token === process.env.OLIST_ACCESS_TOKEN) return 'kings'
  return null
}

/**
 * Autentica o webhook do Tiny/Olist.
 * 
 * O Tiny envia o token como query param `?token=xxx` ou no body como `token`.
 * Se válido, retorna o token. Se inválido, retorna null.
 */
export function authenticateWebhook(url: string, body?: any): { token: string | null; store: 'kings' | 'seven' | 'sabrina_prado' | null } {
  const searchParams = new URL(url).searchParams
  
  // Tiny pode enviar o token de diferentes formas
  const token = searchParams.get('token') || body?.token || null
  
  if (!token) {
    return { token: null, store: null }
  }

  const allowedTokens = getAllowedTokens()
  
  if (!allowedTokens.includes(token)) {
    return { token: null, store: null }
  }

  return { token, store: identifyStoreByToken(token) }
}

/** Resposta padronizada de sucesso */
export function successResponse(message: string, data?: Record<string, any>) {
  return NextResponse.json({ ok: true, message, ...data })
}

/** Resposta padronizada de erro */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

/** Resposta padronizada de não-autenticado */
export function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: 'Token inválido ou ausente.' }, { status: 401 })
}

/** Logger centralizado */
export function log(scope: string, message: string, data?: any) {
  if (data) {
    console.log(`${LOG_PREFIX}[${scope}] ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data)
  } else {
    console.log(`${LOG_PREFIX}[${scope}] ${message}`)
  }
}

export function logError(scope: string, message: string, error?: any) {
  console.error(`${LOG_PREFIX}[${scope}] ❌ ${message}`, error)
}
