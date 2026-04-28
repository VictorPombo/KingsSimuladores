const fs = require('fs');
require('dotenv').config();

const LI_CHAVE_API = process.env.LI_CHAVE_API;
const LI_CHAVE_APP = process.env.LI_CHAVE_APP;

if (!LI_CHAVE_API || !LI_CHAVE_APP) {
  console.error("Erro: As variáveis de ambiente LI_CHAVE_API e LI_CHAVE_APP são obrigatórias.");
  console.error("Renomeie .env.example para .env e preencha suas chaves.");
  process.exit(1);
}


// URL oficial da API atualizada da Loja Integrada. 
// O domínio antigo (api.lojaintegrada.com.br) foi desativado e agora redireciona para um portal de busca.
const BASE_URL = 'https://api.awsli.com.br/v1/cliente/';
const LIMIT = 100;

async function fetchClientes() {
  let offset = 0;
  let allClientes = [];
  let keepFetching = true;

  console.log('Iniciando a extração de clientes da Loja Integrada...');

  while (keepFetching) {
    const url = `${BASE_URL}?limit=${LIMIT}&offset=${offset}`;
    
    try {
      // Utiliza o fetch nativo (Node >= 18). Se não estiver disponível, faz o require do node-fetch.
      const fetchApi = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

      const response = await fetchApi(url, {
        method: 'GET',
        headers: {
          // A API atualizada da Loja Integrada exige as duas chaves no header
          'Authorization': `chave_api ${LI_CHAVE_API} aplicacao ${LI_CHAVE_APP}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`\n[Erro na API] Status: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.error('Detalhes da resposta:', errorText);
        break;
      }

      const data = await response.json();
      
      // O retorno da listagem da Loja Integrada fica no array "objects"
      const objects = data.objects || [];

      if (objects.length === 0) {
        break;
      }

      console.log(`Página recebida -> Offset: ${offset} | Clientes nesta página: ${objects.length}`);

      for (const cliente of objects) {
        // Junta nome e sobrenome
        const nomeCompleto = `${cliente.nome || ''} ${cliente.sobrenome || ''}`.trim();
        
        // Fallback para celular se telefone for nulo
        const telefoneFinal = cliente.telefone || cliente.celular || null;

        allClientes.push({
          nome: nomeCompleto,
          email: cliente.email || null,
          telefone: telefoneFinal,
          cpf: cliente.cpf || null
        });
      }

      // Condição de parada: se vieram menos itens do que o limite da página
      if (objects.length < LIMIT) {
        keepFetching = false;
      } else {
        offset += LIMIT;
      }

    } catch (error) {
      console.error(`\nErro fatal na requisição (Offset: ${offset}):`, error.message);
      break;
    }
  }

  // Salva o resultado no JSON final
  fs.writeFileSync('clientes.json', JSON.stringify(allClientes, null, 2), 'utf-8');
  
  console.log('\n=======================================');
  console.log('Extração concluída com sucesso!');
  console.log(`Total de clientes extraídos: ${allClientes.length}`);
  console.log('Arquivo salvo: clientes.json');
  console.log('=======================================');
}

fetchClientes();
