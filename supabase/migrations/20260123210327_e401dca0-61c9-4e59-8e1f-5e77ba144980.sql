-- Create analyses table
CREATE TABLE public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  discovery_score INTEGER NOT NULL,
  discovery_max INTEGER DEFAULT 40,
  performance_score INTEGER NOT NULL,
  performance_max INTEGER DEFAULT 15,
  transaction_score INTEGER NOT NULL,
  transaction_max INTEGER DEFAULT 20,
  trust_score INTEGER NOT NULL,
  trust_max INTEGER DEFAULT 25,
  checks JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  analysis_duration_ms INTEGER,
  error TEXT
);

-- Create email_captures table
CREATE TABLE public.email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  email TEXT NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id),
  source TEXT DEFAULT 'results_page'
);

-- Create indexes
CREATE INDEX idx_analyses_id ON public.analyses(id);
CREATE INDEX idx_analyses_domain ON public.analyses(domain);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at);
CREATE INDEX idx_email_captures_email ON public.email_captures(email);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Public read access for analyses (results are shareable)
CREATE POLICY "Analyses are publicly viewable" ON public.analyses FOR SELECT USING (true);

-- Public insert for analyses (from edge function)
CREATE POLICY "Anyone can create analyses" ON public.analyses FOR INSERT WITH CHECK (true);

-- Public insert for email captures
CREATE POLICY "Anyone can submit email" ON public.email_captures FOR INSERT WITH CHECK (true);