require('dotenv').config({ path: 'apps/site/.env.local' });

async function run() {
  const token = process.env.OLIST_API_KEY_SEVEN;
  const erpIdNum = "922834551";

  const paramsObter = new URLSearchParams();
  paramsObter.append('token', token);
  paramsObter.append('id', erpIdNum);
  paramsObter.append('formato', 'json');

  const resPedido = await fetch('https://api.tiny.com.br/api2/pedido.obter.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: paramsObter.toString()
  });

  const dataPedido = await resPedido.json();
  console.log(JSON.stringify(dataPedido, null, 2));
}
run();
