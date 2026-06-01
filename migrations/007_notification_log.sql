-- ============================================================
-- Migration 007: Notification log + waitlist drip columns
-- Run this in Supabase SQL editor before deploying the service
-- ============================================================

-- 1. notification_log — tracks every email sent, prevents duplicates
CREATE TABLE IF NOT EXISTS public.notification_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email   TEXT NOT NULL,
  recipient_type    TEXT NOT NULL CHECK (recipient_type IN ('beta_user', 'waitlist')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('weekly_digest', 'quiet_week', 'reengagement', 'waitlist_drip', 'waitlist_newsletter')),
  sequence_step     INT,
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  metadata          JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS notification_log_email_idx
  ON public.notification_log(recipient_email, sent_at DESC);

CREATE INDEX IF NOT EXISTS notification_log_type_idx
  ON public.notification_log(notification_type, sent_at DESC);

-- 2. waitlist_submissions — add drip tracking columns
-- NOTE: table must already exist from your initial schema
ALTER TABLE public.waitlist_submissions
  ADD COLUMN IF NOT EXISTS drip_step          INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opted_out          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phase2_started_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscribed_at      TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_sent_at       TIMESTAMPTZ;

-- Backfill subscribed_at for existing rows
UPDATE public.waitlist_submissions
  SET subscribed_at = created_at
  WHERE subscribed_at IS NULL AND created_at IS NOT NULL;

-- Index for drip cron query
CREATE INDEX IF NOT EXISTS waitlist_drip_idx
  ON public.waitlist_submissions(opted_out, drip_step, last_sent_at)
  WHERE opted_out = false;
