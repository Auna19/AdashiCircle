-- ============================================================
-- AdashiCircle Sample Seed Data
-- Run this AFTER executing 001_initial_schema.sql
-- Note: Replace the organizer_user_id with your real auth.users UUID
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_period_1 UUID;
  v_period_2 UUID;
BEGIN
  -- Grab the first registered user or create a placeholder UUID if none exists
  SELECT id INTO v_user_id FROM public.users LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- 1. Create a flagship Rotational Savings Circle
    INSERT INTO public.savings_groups (
      name,
      slug,
      description,
      group_type,
      category,
      created_by,
      contribution_amount_kobo,
      frequency,
      max_members,
      current_members,
      start_date,
      first_contribution_deadline,
      invitation_code,
      status,
      privacy
    ) VALUES (
      'Lagos SME Cooperative Circle',
      'lagos-sme-cooperative-circle',
      'Rotating savings association for Lagos market traders and business owners.',
      'rotational',
      'Market Traders',
      v_user_id,
      5000000, -- ₦50,000.00
      'monthly',
      10,
      1,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days',
      'LAGOS001',
      'active',
      'invite_only'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_group_id;

    -- 2. Add Group Rules
    INSERT INTO public.group_rules (
      group_id,
      grace_period_days,
      late_penalty_kobo,
      allow_partial_payments,
      require_payment_evidence,
      payout_requires_all_paid
    ) VALUES (
      v_group_id,
      3,
      200000, -- ₦2,000 late fee
      false,
      true,
      true
    )
    ON CONFLICT (group_id) DO NOTHING;

    -- 3. Add Group Member (Organizer as Admin)
    INSERT INTO public.group_members (
      group_id,
      user_id,
      role,
      status,
      payout_position,
      joined_at
    ) VALUES (
      v_group_id,
      v_user_id,
      'admin',
      'active',
      1,
      NOW()
    )
    ON CONFLICT (group_id, user_id) DO NOTHING;

    -- 4. Create Contribution Periods
    INSERT INTO public.contribution_periods (
      group_id,
      period_number,
      start_date,
      end_date,
      due_date,
      status
    ) VALUES (
      v_group_id,
      1,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      CURRENT_DATE + INTERVAL '7 days',
      'active'
    )
    RETURNING id INTO v_period_1;

    INSERT INTO public.contribution_periods (
      group_id,
      period_number,
      start_date,
      end_date,
      due_date,
      status
    ) VALUES (
      v_group_id,
      2,
      CURRENT_DATE + INTERVAL '31 days',
      CURRENT_DATE + INTERVAL '60 days',
      CURRENT_DATE + INTERVAL '38 days',
      'upcoming'
    )
    RETURNING id INTO v_period_2;

    -- 5. Insert Sample Contribution Record
    INSERT INTO public.contributions (
      group_id,
      period_id,
      user_id,
      expected_amount_kobo,
      amount_paid_kobo,
      payment_method,
      transaction_reference,
      status,
      payment_date,
      verified_by,
      verified_at
    ) VALUES (
      v_group_id,
      v_period_1,
      v_user_id,
      5000000,
      5000000,
      'bank_transfer',
      'AC-TX-892401',
      'confirmed',
      NOW(),
      v_user_id,
      NOW()
    );

    -- 6. Insert Corresponding Transaction Ledger Entry
    INSERT INTO public.transactions (
      group_id,
      user_id,
      type,
      amount_kobo,
      status,
      reference,
      description
    ) VALUES (
      v_group_id,
      v_user_id,
      'contribution',
      5000000,
      'confirmed',
      'AC-TX-892401',
      'Period #1 Monthly Contribution for Lagos SME Circle'
    );

    -- 7. Insert Sample Announcement
    INSERT INTO public.announcements (
      group_id,
      title,
      content,
      created_by,
      is_pinned
    ) VALUES (
      v_group_id,
      'Welcome to Lagos SME Cooperative Circle!',
      'All members are reminded that Period #1 contributions are due on the 7th. Please transfer directly to the designated circle account and upload your transaction reference.',
      v_user_id,
      true
    );

    RAISE NOTICE 'Sample seed data created successfully for user % and group %', v_user_id, v_group_id;
  ELSE
    RAISE NOTICE 'No registered users found in public.users. Please create an account via /register first, then run this seed script.';
  END IF;
END $$;
