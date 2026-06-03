-- Fila assíncrona de jobs pós-pagamento
-- Cada job representa uma tarefa externa (ERP, logística, notificação) que
-- deve ser executada após confirmação de pagamento, fora do ciclo do webhook.

CREATE TABLE IF NOT EXISTS order_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  -- Tipos válidos: 'olist_erp' | 'frenet_label' | 'notify_customer_whatsapp'
  --               | 'notify_customer_email' | 'notify_admin_email' | 'msu_split'
  status text NOT NULL DEFAULT 'pending',
  -- Estados: pending → processing → done | failed → dead (após 3 retries)
  retry_count int NOT NULL DEFAULT 0,
  payload jsonb,
  error_log text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE(order_id, job_type)
);

-- Índice para o worker: puxa pending em ordem de criação
CREATE INDEX IF NOT EXISTS order_jobs_pending_idx
  ON order_jobs(created_at)
  WHERE status = 'pending';

-- Índice para alertas de dead letter queue no painel admin
CREATE INDEX IF NOT EXISTS order_jobs_dead_idx
  ON order_jobs(order_id)
  WHERE status = 'dead';

-- View auxiliar para o painel: jobs mortos que precisam de atenção manual
CREATE OR REPLACE VIEW dead_order_jobs AS
  SELECT
    j.id,
    j.order_id,
    j.job_type,
    j.retry_count,
    j.error_log,
    j.created_at,
    o.status AS order_status,
    o.total AS order_total
  FROM order_jobs j
  JOIN orders o ON o.id = j.order_id
  WHERE j.status = 'dead'
  ORDER BY j.created_at DESC;
