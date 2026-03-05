// ============================================
// Core Domain Types for TradeEt
// ============================================

/**
 * Represents a trade in the system.
 * Mirrors the database schema for the trades table.
 */
export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number | null;
  profit_usd: number | null;
  notes: string | null;
  screenshot_url: string | null;
  trade_date: string;
  created_at: string;
  tags: string[] | null;
}

/**
 * User profile data
 */
export interface Profile {
  id: string;
  email: string | null;
  // The user's current access level. We now treat every new account as a
  // 7‑day free trial (role still stored as 'free' for backwards compatibility)
  // and require a paid "pro" status once the trial expires. Admins keep the
  // same elevated permission.
  role: 'free' | 'pro' | 'admin';
  exchange_rate: number;
  affiliate_code: string | null;
  is_influencer: boolean;
  referred_by_id: string | null;
  // when the free trial expires (UTC timestamp). null means no expiration (e.g.
  // legacy or admin account).
  trial_expires: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Standardized result type for server actions
 */
export type Result<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string; code?: string };

/**
 * Affiliate statistics
 */
export interface AffiliateStats {
  affiliateCode: string | null;
  isInfluencer: boolean;
  totalReferrals: number;
  pendingCommissions: number;
  paidCommissions: number;
  pendingEarnings: number;
  totalPaidEarnings: number;
  totalEarnings: number;
}

/**
 * Commission record
 */
export interface Commission {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  amount_due: number;
  status: 'pending' | 'paid';
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}
