-- 1. Create Status Enum
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved');

-- 2. Upgrade Reports Table
ALTER TABLE public.reports 
  RENAME COLUMN reported_id TO reported_user_id;

ALTER TABLE public.reports 
  RENAME COLUMN note TO description;

ALTER TABLE public.reports 
  ADD COLUMN status report_status DEFAULT 'pending';

-- Migrate existing 'resolved' flags if any
UPDATE public.reports SET status = 'resolved' WHERE resolved = true;
UPDATE public.reports SET status = 'pending' WHERE resolved = false;

ALTER TABLE public.reports 
  DROP COLUMN resolved;

-- 3. Create Admin Messages Table
CREATE TABLE public.admin_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Row Level Security (RLS) Policies

-- Reports Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can insert reports
CREATE POLICY "Users can insert reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can manage all reports
CREATE POLICY "Admins have full access to reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Admin Messages Policies
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Admins have full access to admin messages
CREATE POLICY "Admins have full access to admin messages"
  ON public.admin_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Users can read messages where they are sender or recipient
CREATE POLICY "Users can read their own support messages"
  ON public.admin_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 5. Indexes for Performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_admin_messages_report_id ON public.admin_messages(report_id);
