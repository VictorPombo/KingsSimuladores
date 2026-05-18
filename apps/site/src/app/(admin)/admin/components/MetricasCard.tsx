import { getAdminMetrics } from '../actions/metrics'
import { MetricasCardClient } from './MetricasCardClient'

export async function MetricasCard() {
  const data = await getAdminMetrics()
  return <MetricasCardClient data={data} />
}
