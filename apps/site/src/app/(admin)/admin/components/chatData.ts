// ===== MOCK DATA =====
export const SELLERS = [
  { id: 's1', name: 'Ricardo Almeida', avatar: 'RA', since: '2024-03', rating: 4.8, sales: 12, blocked: 0 },
  { id: 's2', name: 'Camila Torres', avatar: 'CT', since: '2023-11', rating: 4.5, sales: 8, blocked: 1 },
  { id: 's3', name: 'Bruno Martins', avatar: 'BM', since: '2025-01', rating: 5.0, sales: 3, blocked: 0 },
]

export const BUYERS = [
  { id: 'b1', name: 'João Silva', avatar: 'JS', since: '2025-02', purchases: 1, blocked: 0 },
  { id: 'b2', name: 'Ana Costa', avatar: 'AC', since: '2024-08', purchases: 3, blocked: 2 },
  { id: 'b3', name: 'Pedro Souza', avatar: 'PS', since: '2025-03', purchases: 0, blocked: 0 },
  { id: 'b4', name: 'Mariana Lima', avatar: 'ML', since: '2024-12', purchases: 2, blocked: 0 },
]

export const LISTINGS = [
  { id: 'l1', title: 'Volante Logitech G29 + Pedais', price: 1200, condition: 'Usado - Bom estado', sellerId: 's1', img: '🎮' },
  { id: 'l2', title: 'Cockpit Playseat Challenge', price: 2800, condition: 'Seminovo', sellerId: 's1', img: '🪑' },
  { id: 'l3', title: 'Pedal Fanatec CSL Elite', price: 1500, condition: 'Usado - Excelente', sellerId: 's2', img: '🦶' },
  { id: 'l4', title: 'Cockpit SimRig SR1 Completo', price: 4500, condition: 'Usado - Bom estado', sellerId: 's3', img: '🏎️' },
  { id: 'l5', title: 'Volante Thrustmaster T300 RS', price: 1800, condition: 'Seminovo', sellerId: 's2', img: '🎯' },
]

export type Message = {
  id: string; senderId: string; text: string; time: string; blocked?: boolean; blockReason?: string; isAdmin?: boolean;
}

export type Conversation = {
  id: string; listingId: string; buyerId: string; sellerId: string; messages: Message[]; lastActivity: string; unreadBuyer: number; unreadSeller: number;
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', listingId: 'l1', buyerId: 'b1', sellerId: 's1', lastActivity: '10:45', unreadBuyer: 0, unreadSeller: 1,
    messages: [
      { id: 'm1', senderId: 'b1', text: 'Oi! Ainda tem o G29 disponível?', time: '10:30' },
      { id: 'm2', senderId: 's1', text: 'Sim! Está em ótimo estado, uso há 1 ano apenas.', time: '10:32' },
      { id: 'm3', senderId: 'b1', text: 'Qual o estado de conservação? Aceita R$1000?', time: '10:35' },
      { id: 'm4', senderId: 's1', text: 'O mínimo que faço é R$1100. Tá impecável, sem marcas.', time: '10:40' },
      { id: 'm5', senderId: 'b1', text: 'Fechado! Como faço pra pagar?', time: '10:45' },
    ]
  },
  {
    id: 'c2', listingId: 'l3', buyerId: 'b2', sellerId: 's2', lastActivity: '09:20', unreadBuyer: 0, unreadSeller: 0,
    messages: [
      { id: 'm6', senderId: 'b2', text: 'Boa tarde! O pedal ainda tá disponível?', time: '09:00' },
      { id: 'm7', senderId: 's2', text: 'Tá sim! Quer mais fotos?', time: '09:05' },
      { id: 'm8', senderId: 'b2', text: 'Me chama no whats 11 99876-5432', time: '09:10', blocked: true, blockReason: 'Telefone/WhatsApp detectado' },
      { id: 'm9', senderId: 'b2', text: 'Sim, pode mandar mais fotos por aqui mesmo!', time: '09:15' },
      { id: 'm10', senderId: 's2', text: 'Perfeito, vou tirar agora e envio!', time: '09:20' },
    ]
  },
  {
    id: 'c3', listingId: 'l2', buyerId: 'b3', sellerId: 's1', lastActivity: '14:30', unreadBuyer: 1, unreadSeller: 0,
    messages: [
      { id: 'm11', senderId: 'b3', text: 'Oi! O cockpit vem com base pra volante?', time: '14:00' },
      { id: 'm12', senderId: 's1', text: 'Vem completo! Base, assento e suporte de pedal.', time: '14:10' },
      { id: 'm13', senderId: 'b3', text: 'meu insta é @pedro_sim pra ver minhas fotos do setup', time: '14:15', blocked: true, blockReason: 'Rede social detectada (@usuario)' },
      { id: 'm14', senderId: 'b3', text: 'Muito bom! Qual o peso total pra calcular frete?', time: '14:20' },
      { id: 'm15', senderId: 's1', text: 'Pesa uns 18kg no total. CEP de destino?', time: '14:25' },
      { id: 'm16', senderId: 's1', text: 'Posso fazer R$2500 pra fechar rápido.', time: '14:30', isAdmin: false },
    ]
  },
  {
    id: 'c4', listingId: 'l4', buyerId: 'b4', sellerId: 's3', lastActivity: '16:00', unreadBuyer: 0, unreadSeller: 0,
    messages: [
      { id: 'm17', senderId: 'b4', text: 'Bruno, tenho interesse no cockpit SR1!', time: '15:00' },
      { id: 'm18', senderId: 's3', text: 'Opa! Posso fazer R$4000 pra você.', time: '15:10' },
      { id: 'm19', senderId: 'b4', text: 'Fechou! Meu CEP é 01310-100 pra calcular frete.', time: '15:20' },
      { id: 'm20', senderId: 's3', text: 'Pelo peso vai precisar de transportadora. Vou cotar.', time: '15:30' },
      { id: 'm21', senderId: 'admin', text: 'Olá! Sou o moderador da plataforma. Lembro que o pagamento deve ser feito exclusivamente pela plataforma para segurança de ambos. Boas negociações!', time: '15:45', isAdmin: true },
      { id: 'm22', senderId: 's3', text: 'Obrigado pelo aviso! Vamos fazer tudo certinho por aqui.', time: '16:00' },
    ]
  },
]

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
