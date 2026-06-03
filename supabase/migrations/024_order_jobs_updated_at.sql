-- Adiciona coluna updated_at na tabela order_jobs para habilitar rescue de jobs travados.
-- Um job fica "travado" quando entra em status 'processing' mas o Cron reinicia antes
-- de concluí-lo, deixando-o preso indefinidamente fora da DLQ.
-- O rescue no worker usa este campo para resgatar jobs presos há mais de 5 minutos.

ALTER TABLE order_jobs
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Trigger para manter updated_at sempre atual em qualquer UPDATE
CREATE OR REPLACE FUNCTION set_order_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_jobs_updated_at_trigger ON order_jobs;
CREATE TRIGGER order_jobs_updated_at_trigger
  BEFORE UPDATE ON order_jobs
  FOR EACH ROW EXECUTE FUNCTION set_order_jobs_updated_at();

-- Índice parcial para o rescue: busca eficiente de jobs travados em 'processing'
CREATE INDEX IF NOT EXISTS order_jobs_processing_stale_idx
  ON order_jobs(updated_at)
  WHERE status = 'processing';
