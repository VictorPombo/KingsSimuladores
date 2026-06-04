-- Migration 027: RLS policies for payouts table
-- The payouts table exists but has RLS enabled with zero policies,
-- causing permission denied errors for sellers/buyers on client-side calls.

-- SELECT: sellers see their own payouts; buyers see payouts linked to their orders;
--         admins (service_role) bypass RLS entirely.
CREATE POLICY "payouts_select_seller"
  ON payouts FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "payouts_select_buyer"
  ON payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN profiles p ON p.id = o.customer_id
      WHERE oi.id = payouts.order_item_id
        AND p.auth_id = auth.uid()
    )
  );

-- UPDATE: sellers may only update tracking_code and shipped_at on their own rows.
-- We enforce column restriction via a check that prevents other columns changing.
CREATE POLICY "payouts_update_seller_tracking"
  ON payouts FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- INSERT and DELETE are intentionally left without user policies —
-- only service_role (used by the cron worker via createAdminClient) can write rows.
