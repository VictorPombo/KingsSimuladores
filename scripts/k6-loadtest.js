import http from 'k6/http';
import { check, sleep } from 'k6';

// 100 VUs simultâneos focados no Marketplace MSU para provar a escalabilidade do Supabase
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up: 0 to 20 users
    { duration: '1m', target: 100 },  // Peak: 100 concurrent users active navigating
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = 'http://127.0.0.1:3000';

export default function () {
  // Navegação: Acessa a Home do MSU
  const resHome = http.get(`${BASE_URL}/usado`);
  check(resHome, {
    'Home carregada (status 200)': (r) => r.status === 200,
  });

  // Pausa realista humana (1 a 3 segundos)
  sleep(Math.random() * 2 + 1);

  // Navegação: Vai para Explorar Produtos (SSR/Filter Fetch)
  const resExplore = http.get(`${BASE_URL}/usado/produtos`);
  check(resExplore, {
    'Explorar carregada (status 200)': (r) => r.status === 200,
  });

  // Pausa realista humana
  sleep(Math.random() * 2 + 1);
}
