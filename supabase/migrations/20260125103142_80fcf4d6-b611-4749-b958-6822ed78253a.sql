-- =============================================
-- SECURITY FIX: Protect email_captures table
-- =============================================

-- Block public read access to email addresses
CREATE POLICY "Block public read access" 
ON public.email_captures 
FOR SELECT 
USING (false);

-- Block public update access
CREATE POLICY "Block public update access" 
ON public.email_captures 
FOR UPDATE 
USING (false);

-- Block public delete access
CREATE POLICY "Block public delete access" 
ON public.email_captures 
FOR DELETE 
USING (false);

-- =============================================
-- SECURITY FIX: Protect rate_limits table
-- =============================================

-- Enable RLS on rate_limits (may already be enabled)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Block all public access - only service role should access this
CREATE POLICY "Block public select" 
ON public.rate_limits 
FOR SELECT 
USING (false);

CREATE POLICY "Block public insert" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Block public update" 
ON public.rate_limits 
FOR UPDATE 
USING (false);

CREATE POLICY "Block public delete" 
ON public.rate_limits 
FOR DELETE 
USING (false);

-- =============================================
-- SECURITY FIX: Protect analyses table integrity
-- =============================================

-- Block modifications to existing analyses
CREATE POLICY "Block public update" 
ON public.analyses 
FOR UPDATE 
USING (false);

CREATE POLICY "Block public delete" 
ON public.analyses 
FOR DELETE 
USING (false);