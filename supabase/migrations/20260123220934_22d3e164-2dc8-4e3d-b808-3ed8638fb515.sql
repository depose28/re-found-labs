-- Add columns to track report sending status
ALTER TABLE public.email_captures
ADD COLUMN report_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN report_error TEXT DEFAULT NULL;