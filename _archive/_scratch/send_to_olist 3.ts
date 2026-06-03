import { pushOrderToOlist } from './packages/payments/src/olist';
async function test() {
  try {
    const res = await pushOrderToOlist('329502c7-7e29-4031-a208-fcf78419e2a4', 'kings');
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
