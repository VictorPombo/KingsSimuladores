// ===== FILTRO ANTI-CONTATO (PRODUÇÃO) =====
// Regras de detecção para bloquear tentativas de compartilhar contato pessoal no chat do MSU.

export type Message = {
  id: string; senderId: string; text: string; time: string; blocked?: boolean; blockReason?: string; isAdmin?: boolean;
}

export type Conversation = {
  id: string; listingId: string; buyerId: string; sellerId: string; messages: Message[]; lastActivity: string; unreadBuyer: number; unreadSeller: number;
}

// ===== CONTACT FILTER =====
const PHONE_PATTERNS = [
  /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g,
  /\+?\d{2,3}\s*\d{2}\s*\d{4,5}[-.\s]?\d{4}/g,
  /\d{8,}/g,
  /0800\s*\d{3,}/gi,
]
const PHONE_KEYWORDS = /\b(whats|whatsapp|zap|zapzap|liga\s*(pra|para)|me\s*chama|meu\s*n[uú]mero|meu\s*cel|meu\s*telefone|fone)\b/gi
const EMAIL_PATTERNS = [/\S+@\S+\.\S+/g, /\b(arroba|@)\b/gi]
const EMAIL_KEYWORDS = /\b(meu\s*e?-?mail|gmail|hotmail|outlook|yahoo|manda\s*e?-?mail)\b/gi
const SOCIAL_PATTERNS = [/@[a-zA-Z0-9_.]{3,}/g]
const SOCIAL_KEYWORDS = /\b(instagram|insta|face|facebook|telegram|discord|twitter|tiktok|linkedin|me\s*segue|me\s*acha|meu\s*perfil|meu\s*@)\b/gi
const URL_PATTERNS = [/https?:\/\/\S+/gi, /www\.\S+/gi, /bit\.ly|goo\.gl|tinyurl/gi]
const URL_KEYWORDS = /\b(ponto\s*com|\.com|\.br)\b/gi
const BYPASS_PATTERN = /\d\s*[a-zA-Z]\s*\d\s*[a-zA-Z]\s*\d/g
const SPACED_DIGITS = /\d\s{2,}\d\s{2,}\d\s{2,}\d/g
const OBFUSCATED_NUMBERS = /\b(zer0|z3r0|do1s|tr3s|quatr0|cinc0|s3is|s3t3|0ito|oit0|n0ve)\b/gi
const SPELLED_NUMBERS = /\b(zero|um|dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove)\b/gi

// Exceções
const CEP_PATTERN = /^\d{5}-?\d{3}$/
const MONEY_PATTERN = /R\$\s*[\d.,]+/g

export function filterMessage(text: string): { blocked: boolean; reason: string } {
  const clean = text.replace(MONEY_PATTERN, '').replace(CEP_PATTERN, '')
  
  for (const p of PHONE_PATTERNS) { p.lastIndex = 0; if (p.test(clean)) { 
    const digits = clean.replace(/\D/g, ''); 
    if (digits.length >= 8 && !CEP_PATTERN.test(clean.trim())) return { blocked: true, reason: 'Telefone detectado' } 
  }}
  if (PHONE_KEYWORDS.test(clean)) return { blocked: true, reason: 'Referência a telefone/WhatsApp' }
  for (const p of EMAIL_PATTERNS) { p.lastIndex = 0; if (p.test(clean)) return { blocked: true, reason: 'Email detectado' } }
  if (EMAIL_KEYWORDS.test(clean)) return { blocked: true, reason: 'Referência a email' }
  for (const p of SOCIAL_PATTERNS) { p.lastIndex = 0; if (p.test(clean)) return { blocked: true, reason: 'Rede social detectada (@usuario)' } }
  if (SOCIAL_KEYWORDS.test(clean)) return { blocked: true, reason: 'Referência a rede social' }
  for (const p of URL_PATTERNS) { p.lastIndex = 0; if (p.test(clean)) return { blocked: true, reason: 'Link/URL detectado' } }
  if (URL_KEYWORDS.test(clean)) return { blocked: true, reason: 'Referência a URL/domínio' }
  if (BYPASS_PATTERN.test(clean)) return { blocked: true, reason: 'Tentativa de contornar filtro' }
  if (SPACED_DIGITS.test(clean)) return { blocked: true, reason: 'Dígitos com espaçamento suspeito' }
  
  if (OBFUSCATED_NUMBERS.test(clean)) return { blocked: true, reason: 'Tentativa de ofuscar número' }
  
  const spelledCount = (clean.match(SPELLED_NUMBERS) || []).length
  if (spelledCount > 2) return { blocked: true, reason: 'Múltiplos números por extenso (possível telefone)' }

  const digits = clean.replace(/\D/g, '')
  if (digits.length > 3 && spelledCount > 0 && digits.length + spelledCount >= 8) {
    return { blocked: true, reason: 'Sequência suspeita de números e texto' }
  }

  return { blocked: false, reason: '' }
}
