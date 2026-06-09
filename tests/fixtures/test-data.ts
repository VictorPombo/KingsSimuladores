/**
 * Fixtures de dados reutilizáveis nos testes.
 * Produto real do banco para testes de checkout.
 */

export const TEST_PRODUCT_SLUG = 'volante-logitech-g29' // ajustar se necessário

export const GUEST_CHECKOUT_PAYLOAD = {
  items: [
    {
      id: 'qa-test-product-fixture',
      title: 'Produto QA Fixture',
      quantity: 1,
      price: 99.90,
      storeOrigin: 'kings',
    },
  ],
  customer: {
    nome: 'QA Fixture Automatico',
    email: `qa-fixture-${Date.now()}@test.kingssimuladores.com.br`,
    cpf: '123.456.789-09',
    telefone: '(11) 99999-7777',
  },
  address: {
    cep: '01310-100',
    logradouro: 'Av Paulista',
    numero: '1578',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    complemento: '',
    referencia: '',
  },
  shipping: {
    name: 'PAC',
    price: '30.00',
  },
  total: 129.90,
  pix_discount: false,
}
