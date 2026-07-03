-- Migração 029: Trava de colunas financeiras em payouts (defesa em profundidade)
--
-- Contexto: a policy "payouts_update_seller_tracking" (migração 027) restringe
-- UPDATE em payouts a `seller_id = auth.uid()`, mas não restringe QUAIS colunas
-- podem ser alteradas. Como o client Supabase do vendedor é anon/authenticated
-- (não service_role), um vendedor autenticado pode hoje enviar um UPDATE que
-- altera `status` de 'held' para 'available' na própria linha, pulando por
-- completo a confirmação de recebimento do comprador (rota release-escrow).
--
-- Esta migração NÃO substitui a policy de RLS (linha de posse continua válida
-- e necessária) — adiciona uma trigger que bloqueia mudanças em colunas
-- financeiras/de status quando a alteração vem de uma sessão 'authenticated'
-- (o próprio vendedor). Escritas via service_role (rotas admin, cron do
-- msu_split, release-escrow) usam a chave de service role e continuam
-- funcionando normalmente — auth.role() retorna 'service_role' nesse caso,
-- fora do escopo desta trava.

CREATE OR REPLACE FUNCTION public.payouts_restrict_seller_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só entra em vigor quando o próprio vendedor (sessão 'authenticated',
  -- dono da linha) está fazendo o UPDATE. Service role (admin/cron) passa direto.
  IF auth.role() = 'authenticated' AND OLD.seller_id = auth.uid() THEN
    IF NEW.status                  IS DISTINCT FROM OLD.status
       OR NEW.seller_id            IS DISTINCT FROM OLD.seller_id
       OR NEW.net_amount           IS DISTINCT FROM OLD.net_amount
       OR NEW.gross_amount         IS DISTINCT FROM OLD.gross_amount
       OR NEW.platform_fee_amount  IS DISTINCT FROM OLD.platform_fee_amount
       OR NEW.platform_fee_percent IS DISTINCT FROM OLD.platform_fee_percent
       OR NEW.order_item_id        IS DISTINCT FROM OLD.order_item_id
       OR NEW.release_date         IS DISTINCT FROM OLD.release_date
       OR NEW.external_transfer_id IS DISTINCT FROM OLD.external_transfer_id
    THEN
      RAISE EXCEPTION 'Vendedores só podem atualizar dados de rastreio (tracking_code, shipped_at). Alteração de status ou valores é restrita ao sistema.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payouts_restrict_seller_update_trigger ON payouts;

CREATE TRIGGER payouts_restrict_seller_update_trigger
  BEFORE UPDATE ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.payouts_restrict_seller_update();
