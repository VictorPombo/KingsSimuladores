#!/bin/bash
# MockTrigger CLI - KingsHub Mercado Pago Simulator

if [ -z "$1" ]; then
  echo "Uso: ./simulate_webhook.sh <ID_DO_PEDIDO_PENDENTE>"
  echo "Encontre um ID pendente abrindo http://localhost:3000/admin/pedidos na coluna 'ID'"
  exit 1
fi

ORDER_ID=$1
# O fallback mock usa o prefixo 'mockpay_'
MOCK_PAYMENT_ID="mockpay_$ORDER_ID"

echo "🤖 Simulando webhook do Mercado Pago para a compra do Pedido: $ORDER_ID"
echo "Enviando Falso POST para http://localhost:3000/api/webhooks/mercadopago"

curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "data": {
      "id": "'"$MOCK_PAYMENT_ID"'"
    }
  }'

echo ""
echo "✅ Requisição enviada. Se tudo ocorreu bem, o pedido deve ter alterado para 'PAID'."
