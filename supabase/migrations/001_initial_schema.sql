-- ============================================================
-- AdashiCircle Database Schema
-- PostgreSQL via Supabase
-- All monetary values stored in KOBO (1 Naira = 100 Kobo)
-- Run migrations in order using Supabase SQL editor or CLI
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'user');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_verification');
CREATE TYPE group_type AS ENUM ('rotational', 'target', 'fixed_term');
CREATE TYPE group_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE group_privacy AS ENUM ('private', 'invite_only', 'public');
CREATE TYPE contribution_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'custom');
CREATE TYPE member_status AS ENUM ('invited', 'active', 'suspended', 'removed', 'left');
CREATE TYPE member_role AS ENUM ('admin', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');
CREATE TYPE contribution_status AS ENUM ('pending', 'awaiting_verification', 'confirmed', 'partially_paid', 'rejected', 'overdue');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'cash', 'mobile_money', 'paystack', 'flutterwave', 'other');
CREATE TYPE payout_status AS ENUM ('upcoming', 'awaiting_approval', 'processing', 'completed', 'delayed', 'cancelled');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'rejected', 'closed');
CREATE TYPE dispute_type AS ENUM ('missing_contribution', 'incorrect_amount', 'incorrect_status', 'incorrect_payout', 'unauthorized_adjustment', 'other');
CREATE TYPE notification_type AS ENUM (
  'group_invitation', 'membership_approved', 'membership_rejected',
  'contribution_deadline', 'contribution_confirmed', 'contribution_rejected',
  'contribution_overdue', 'payout_upcoming', 'payout_completed',
  'payout_delayed', 'announcement', 'dispute_update', 'general'
);
CREATE TYPE audit_action AS ENUM (
  'user_registered', 'user_login', 'user_logout', 'password_reset',
  'profile_updated', 'account_suspended', 'account_reactivated',
  'group_created', 'group_updated', 'group_paused', 'group_completed', 'group_cancelled',
  'member_invited', 'member_joined', 'member_approved', 'member_rejected',
  'member_removed', 'member_suspended',
  'contribution_recorded', 'contribution_verified', 'contribution_rejected',
  'contribution_adjusted', 'contribution_period_created',
  'payout_schedule_generated', 'payout_created', 'payout_confirmed',
  'payout_cancelled', 'payout_delayed',
  'dispute_raised', 'dispute_resolved', 'dispute_rejected',
  'announcement_created', 'announcement_deleted',
  'group_settings_changed', 'admin_action'
);

-- ============================================================
-- TABLE 1: users
-- Links to Supabase auth.users via id
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT UNIQUE,
  role            user_role NOT NULL DEFAULT 'user',
  status          account_status NOT NULL DEFAULT 'pending_verification',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  state           TEXT,
  country         TEXT NOT NULL DEFAULT 'Nigeria',
  date_of_birth   DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: savings_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.savings_groups (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                      TEXT NOT NULL,
  slug                      TEXT UNIQUE NOT NULL,
  description               TEXT,
  image_url                 TEXT,
  category                  TEXT,
  group_type                group_type NOT NULL DEFAULT 'rotational',
  status                    group_status NOT NULL DEFAULT 'draft',
  privacy                   group_privacy NOT NULL DEFAULT 'invite_only',
  created_by                UUID NOT NULL REFERENCES public.users(id),
  contribution_amount_kobo  BIGINT NOT NULL CHECK (contribution_amount_kobo > 0),
  frequency                 contribution_frequency NOT NULL DEFAULT 'monthly',
  custom_frequency_days     INT,
  max_members               INT NOT NULL DEFAULT 20 CHECK (max_members >= 2 AND max_members <= 200),
  current_members           INT NOT NULL DEFAULT 0,
  start_date                DATE NOT NULL,
  end_date                  DATE,
  first_contribution_date   DATE NOT NULL,
  payout_arrangement        TEXT,
  total_cycles              INT,
  current_cycle             INT NOT NULL DEFAULT 0,
  invitation_code           TEXT UNIQUE,
  invitation_link_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_date IS NULL OR end_date > start_date)
);

-- ============================================================
-- TABLE 4: group_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.group_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID UNIQUE NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  rules_text  TEXT NOT NULL DEFAULT '',
  late_penalty_kobo   BIGINT NOT NULL DEFAULT 0,
  grace_period_days   INT NOT NULL DEFAULT 0,
  allow_partial       BOOLEAN NOT NULL DEFAULT FALSE,
  require_evidence    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 5: group_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'member',
  status          member_status NOT NULL DEFAULT 'active',
  payout_position INT,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at      TIMESTAMPTZ,
  removed_by      UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id),
  UNIQUE(group_id, payout_position)
);

-- ============================================================
-- TABLE 6: group_invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  invited_by      UUID NOT NULL REFERENCES public.users(id),
  invitee_email   TEXT,
  invitee_phone   TEXT,
  invitee_user_id UUID REFERENCES public.users(id),
  token           TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          invitation_status NOT NULL DEFAULT 'pending',
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invitee_contact CHECK (invitee_email IS NOT NULL OR invitee_phone IS NOT NULL OR invitee_user_id IS NOT NULL)
);

-- ============================================================
-- TABLE 7: contribution_periods
-- Auto-generated based on group frequency
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contribution_periods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  period_number   INT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  due_date        DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, period_number)
);

-- ============================================================
-- TABLE 8: contributions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contributions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id                  UUID NOT NULL REFERENCES public.savings_groups(id),
  member_id                 UUID NOT NULL REFERENCES public.group_members(id),
  user_id                   UUID NOT NULL REFERENCES public.users(id),
  period_id                 UUID NOT NULL REFERENCES public.contribution_periods(id),
  expected_amount_kobo      BIGINT NOT NULL CHECK (expected_amount_kobo > 0),
  amount_paid_kobo          BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_kobo >= 0),
  payment_date              DATE,
  payment_method            payment_method,
  transaction_reference     TEXT,
  evidence_url              TEXT,
  status                    contribution_status NOT NULL DEFAULT 'pending',
  verified_by               UUID REFERENCES public.users(id),
  verified_at               TIMESTAMPTZ,
  rejection_reason          TEXT,
  notes                     TEXT,
  recorded_by               UUID REFERENCES public.users(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, period_id)
);

-- ============================================================
-- TABLE 9: contribution_adjustments
-- Auditable correction records (never delete/silently edit)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contribution_adjustments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id       UUID NOT NULL REFERENCES public.contributions(id),
  adjusted_by           UUID NOT NULL REFERENCES public.users(id),
  previous_amount_kobo  BIGINT NOT NULL,
  new_amount_kobo       BIGINT NOT NULL,
  previous_status       contribution_status NOT NULL,
  new_status            contribution_status NOT NULL,
  reason                TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 10: payout_schedules
-- Rotational payout position assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payout_schedules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.group_members(id),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  position        INT NOT NULL,
  scheduled_date  DATE NOT NULL,
  expected_amount_kobo BIGINT NOT NULL,
  status          payout_status NOT NULL DEFAULT 'upcoming',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, position),
  UNIQUE(group_id, member_id)
);

-- ============================================================
-- TABLE 11: payouts
-- Actual payout execution records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id              UUID NOT NULL REFERENCES public.savings_groups(id),
  schedule_id           UUID UNIQUE REFERENCES public.payout_schedules(id),
  recipient_user_id     UUID NOT NULL REFERENCES public.users(id),
  recipient_member_id   UUID NOT NULL REFERENCES public.group_members(id),
  amount_kobo           BIGINT NOT NULL CHECK (amount_kobo > 0),
  payout_date           DATE,
  payment_reference     TEXT,
  payment_method        payment_method,
  status                payout_status NOT NULL DEFAULT 'awaiting_approval',
  confirmed_by          UUID REFERENCES public.users(id),
  confirmed_at          TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 12: transactions
-- Financial transaction ledger (immutable log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id          UUID REFERENCES public.savings_groups(id),
  user_id           UUID NOT NULL REFERENCES public.users(id),
  contribution_id   UUID REFERENCES public.contributions(id),
  payout_id         UUID REFERENCES public.payouts(id),
  type              TEXT NOT NULL CHECK (type IN ('contribution', 'payout', 'refund', 'penalty', 'adjustment')),
  amount_kobo       BIGINT NOT NULL,
  reference         TEXT UNIQUE,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 13: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  group_id    UUID REFERENCES public.savings_groups(id) ON DELETE SET NULL,
  type        notification_type NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 14: notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  in_app_enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled             BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled               BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  contribution_reminders    BOOLEAN NOT NULL DEFAULT TRUE,
  payout_notifications      BOOLEAN NOT NULL DEFAULT TRUE,
  group_announcements       BOOLEAN NOT NULL DEFAULT TRUE,
  dispute_updates           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 15: disputes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES public.savings_groups(id),
  raised_by       UUID NOT NULL REFERENCES public.users(id),
  assigned_to     UUID REFERENCES public.users(id),
  type            dispute_type NOT NULL,
  status          dispute_status NOT NULL DEFAULT 'open',
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  evidence_url    TEXT,
  contribution_id UUID REFERENCES public.contributions(id),
  payout_id       UUID REFERENCES public.payouts(id),
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 16: dispute_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dispute_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id      UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  changed_by      UUID NOT NULL REFERENCES public.users(id),
  previous_status dispute_status NOT NULL,
  new_status      dispute_status NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 17: announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
  created_by  UUID NOT NULL REFERENCES public.users(id),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Announcement reads (read/unread tracking)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- ============================================================
-- TABLE 18: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  group_id    UUID REFERENCES public.savings_groups(id) ON DELETE SET NULL,
  action      audit_action NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  details     JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_savings_groups_created_by ON public.savings_groups(created_by);
CREATE INDEX idx_savings_groups_status ON public.savings_groups(status);
CREATE INDEX idx_savings_groups_slug ON public.savings_groups(slug);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_status ON public.group_members(status);
CREATE INDEX idx_group_invitations_token ON public.group_invitations(token);
CREATE INDEX idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX idx_group_invitations_invitee_email ON public.group_invitations(invitee_email);
CREATE INDEX idx_contribution_periods_group_id ON public.contribution_periods(group_id);
CREATE INDEX idx_contribution_periods_due_date ON public.contribution_periods(due_date);
CREATE INDEX idx_contributions_group_id ON public.contributions(group_id);
CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_period_id ON public.contributions(period_id);
CREATE INDEX idx_contributions_status ON public.contributions(status);
CREATE INDEX idx_payout_schedules_group_id ON public.payout_schedules(group_id);
CREATE INDEX idx_payout_schedules_user_id ON public.payout_schedules(user_id);
CREATE INDEX idx_payouts_group_id ON public.payouts(group_id);
CREATE INDEX idx_payouts_recipient_user_id ON public.payouts(recipient_user_id);
CREATE INDEX idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_disputes_group_id ON public.disputes(group_id);
CREATE INDEX idx_disputes_raised_by ON public.disputes(raised_by);
CREATE INDEX idx_announcements_group_id ON public.announcements(group_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_group_id ON public.audit_logs(group_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_savings_groups_updated_at BEFORE UPDATE ON public.savings_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_group_rules_updated_at BEFORE UPDATE ON public.group_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_group_members_updated_at BEFORE UPDATE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_contributions_updated_at BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payout_schedules_updated_at BEFORE UPDATE ON public.payout_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payouts_updated_at BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_disputes_updated_at BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- GROUP MEMBER COUNT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.savings_groups SET current_members = current_members + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE public.savings_groups SET current_members = current_members + 1 WHERE id = NEW.group_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE public.savings_groups SET current_members = GREATEST(current_members - 1, 0) WHERE id = NEW.group_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.savings_groups SET current_members = GREATEST(current_members - 1, 0) WHERE id = OLD.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_member_count
AFTER INSERT OR UPDATE OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is a member of a group
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is a group admin
CREATE OR REPLACE FUNCTION is_group_admin(p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
      AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users can view their own record" ON public.users
  FOR SELECT USING (id = auth.uid() OR is_super_admin());
CREATE POLICY "Users can update their own record" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- USER PROFILES policies
CREATE POLICY "Profiles visible to group members" ON public.user_profiles
  FOR SELECT USING (
    user_id = auth.uid() OR is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = user_profiles.user_id
        AND gm1.status = 'active' AND gm2.status = 'active'
    )
  );
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- SAVINGS GROUPS policies
CREATE POLICY "Members can view their groups" ON public.savings_groups
  FOR SELECT USING (
    is_super_admin() OR is_group_member(id) OR created_by = auth.uid()
  );
CREATE POLICY "Authenticated users can create groups" ON public.savings_groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Group admins can update their groups" ON public.savings_groups
  FOR UPDATE USING (is_group_admin(id) OR is_super_admin());

-- GROUP MEMBERS policies
CREATE POLICY "Group members can see member list" ON public.group_members
  FOR SELECT USING (is_group_member(group_id) OR is_super_admin());
CREATE POLICY "Group admins can manage members" ON public.group_members
  FOR ALL USING (is_group_admin(group_id) OR is_super_admin());
CREATE POLICY "Users can insert own membership" ON public.group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- GROUP INVITATIONS policies
CREATE POLICY "Invitees and admins can view invitations" ON public.group_invitations
  FOR SELECT USING (
    invitee_user_id = auth.uid() OR invited_by = auth.uid()
    OR is_group_admin(group_id) OR is_super_admin()
  );
CREATE POLICY "Group admins can create invitations" ON public.group_invitations
  FOR INSERT WITH CHECK (is_group_admin(group_id) OR is_super_admin());
CREATE POLICY "Invitees and admins can update invitations" ON public.group_invitations
  FOR UPDATE USING (
    invitee_user_id = auth.uid() OR is_group_admin(group_id) OR is_super_admin()
  );

-- CONTRIBUTION PERIODS policies
CREATE POLICY "Group members can view periods" ON public.contribution_periods
  FOR SELECT USING (is_group_member(group_id) OR is_super_admin());
CREATE POLICY "Group admins can manage periods" ON public.contribution_periods
  FOR ALL USING (is_group_admin(group_id) OR is_super_admin());

-- CONTRIBUTIONS policies
CREATE POLICY "Members can view own contributions" ON public.contributions
  FOR SELECT USING (
    user_id = auth.uid() OR is_group_admin(group_id) OR is_super_admin()
  );
CREATE POLICY "Group admins can record contributions" ON public.contributions
  FOR INSERT WITH CHECK (is_group_admin(group_id) OR is_super_admin());
CREATE POLICY "Group admins can update contributions" ON public.contributions
  FOR UPDATE USING (is_group_admin(group_id) OR is_super_admin());

-- PAYOUT SCHEDULES policies
CREATE POLICY "Group members can view payout schedules" ON public.payout_schedules
  FOR SELECT USING (is_group_member(group_id) OR is_super_admin());
CREATE POLICY "Group admins can manage payout schedules" ON public.payout_schedules
  FOR ALL USING (is_group_admin(group_id) OR is_super_admin());

-- PAYOUTS policies
CREATE POLICY "Group members can view payouts" ON public.payouts
  FOR SELECT USING (is_group_member(group_id) OR is_super_admin());
CREATE POLICY "Group admins can manage payouts" ON public.payouts
  FOR ALL USING (is_group_admin(group_id) OR is_super_admin());

-- TRANSACTIONS policies
CREATE POLICY "Users see own transactions; admins see group" ON public.transactions
  FOR SELECT USING (
    user_id = auth.uid() OR is_group_admin(group_id) OR is_super_admin()
  );

-- NOTIFICATIONS policies
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR is_super_admin());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- NOTIFICATION PREFERENCES policies
CREATE POLICY "Users manage own preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- DISPUTES policies
CREATE POLICY "Involved parties and admins can view disputes" ON public.disputes
  FOR SELECT USING (
    raised_by = auth.uid() OR is_group_admin(group_id) OR is_super_admin()
  );
CREATE POLICY "Group members can raise disputes" ON public.disputes
  FOR INSERT WITH CHECK (raised_by = auth.uid() AND is_group_member(group_id));
CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE USING (is_group_admin(group_id) OR is_super_admin());

-- ANNOUNCEMENTS policies
CREATE POLICY "Group members can view announcements" ON public.announcements
  FOR SELECT USING (is_group_member(group_id) OR is_super_admin());
CREATE POLICY "Group admins can manage announcements" ON public.announcements
  FOR ALL USING (is_group_admin(group_id) OR is_super_admin());

-- AUDIT LOGS policies
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Group admins can view group audit logs" ON public.audit_logs
  FOR SELECT USING (is_group_admin(group_id));

