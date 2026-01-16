-- Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    total_students INTEGER DEFAULT 0,
    permanence INTEGER DEFAULT 0,
    average_grade NUMERIC(4,2) DEFAULT 0,
    attendance INTEGER DEFAULT 0,
    risk_level TEXT CHECK (risk_level IN ('stable', 'alert', 'critical')),
    teacher_count INTEGER DEFAULT 0,
    teacher_satisfaction INTEGER DEFAULT 0,
    continued_education INTEGER DEFAULT 0,
    infrastructure JSONB DEFAULT '{}'::jsonb,
    alerts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create school_metrics table (for subject grades)
CREATE TABLE IF NOT EXISTS public.school_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'languages', 'sciences', 'humanities')),
    grade NUMERIC(4,1) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(school_id, subject)
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow read for everyone for now, since it's a demo/dashboard)
CREATE POLICY "Allow public read access on regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Allow public read access on school_metrics" ON public.school_metrics FOR SELECT USING (true);

-- Functions to assist with seeding
CREATE OR REPLACE FUNCTION get_region_id(region_name TEXT) RETURNS UUID AS $$
    SELECT id FROM public.regions WHERE name = region_name LIMIT 1;
$$ LANGUAGE SQL;

-- SEED DATA
-- Insert Regions
INSERT INTO public.regions (name) VALUES 
('CENTRO'), ('NORTE'), ('SUL'), ('LESTE'), ('OESTE')
ON CONFLICT (name) DO NOTHING;

-- Insert Schools and Metrics (Using DO block for logic)
DO $$
DECLARE
    r_centro UUID;
    r_norte UUID;
    r_sul UUID;
    r_leste UUID;
    r_oeste UUID;
    s_id UUID;
BEGIN
    SELECT id INTO r_centro FROM public.regions WHERE name = 'CENTRO';
    SELECT id INTO r_norte FROM public.regions WHERE name = 'NORTE';
    SELECT id INTO r_sul FROM public.regions WHERE name = 'SUL';
    SELECT id INTO r_leste FROM public.regions WHERE name = 'LESTE';
    SELECT id INTO r_oeste FROM public.regions WHERE name = 'OESTE';

    -- 1. Escola Estadual Centro
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('Escola Estadual Centro', r_centro, 450, 92, 8.5, 98, 'stable', 24, 45, 85, '{"library": {"books": 2500, "status": "active"}, "lab": {"machines": 20, "status": "maintenance"}}', ARRAY['Baixa frequência registrada no 8º ano B (Semana 42).', 'Pendência na entrega do Censo Escolar.'])
    RETURNING id INTO s_id;
    
    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 8.5), (s_id, 'languages', 9.0), (s_id, 'sciences', 8.8), (s_id, 'humanities', 9.2);

    -- 2. Escola Prof. Norte A
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('Escola Prof. Norte A', r_norte, 320, 78, 7.2, 85, 'alert', 18, 32, 60, '{"library": {"books": 1800, "status": "active"}, "lab": {"machines": 15, "status": "active"}}', ARRAY['Alta taxa de evasão no 9º ano.', 'Necessidade de reposição de professores.'])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 6.8), (s_id, 'languages', 7.5), (s_id, 'sciences', 7.0), (s_id, 'humanities', 7.5);

    -- 3. CIEP Norte B (Integral)
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('CIEP Norte B (Integral)', r_norte, 290, 65, 6.5, 78, 'critical', 22, 28, 45, '{"library": {"books": 1200, "status": "maintenance"}, "lab": {"machines": 10, "status": "maintenance"}}', ARRAY['Risco crítico de evasão.', 'Infraestrutura precisa de reformas urgentes.', 'Déficit de professores de matemática.'])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 5.8), (s_id, 'languages', 6.5), (s_id, 'sciences', 6.2), (s_id, 'humanities', 7.0);

    -- 4. Colégio Sul Modelo
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('Colégio Sul Modelo', r_sul, 510, 95, 8.8, 96, 'stable', 30, 68, 92, '{"library": {"books": 4000, "status": "active"}, "lab": {"machines": 35, "status": "active"}}', ARRAY[]::text[])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 8.9), (s_id, 'languages', 9.2), (s_id, 'sciences', 8.5), (s_id, 'humanities', 8.8);

    -- 5. Escola Técnica Leste
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('Escola Técnica Leste', r_leste, 280, 62, 7.0, 80, 'critical', 16, 25, 50, '{"library": {"books": 1500, "status": "active"}, "lab": {"machines": 25, "status": "maintenance"}}', ARRAY['Alta evasão no curso técnico.', 'Equipamentos do laboratório desatualizados.'])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 7.2), (s_id, 'languages', 6.8), (s_id, 'sciences', 7.5), (s_id, 'humanities', 6.5);

    -- 6. C.E. Oeste Integrado
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('C.E. Oeste Integrado', r_oeste, 410, 88, 7.8, 92, 'stable', 26, 52, 78, '{"library": {"books": 2800, "status": "active"}, "lab": {"machines": 22, "status": "active"}}', ARRAY['Monitorar turmas do período noturno.'])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 7.5), (s_id, 'languages', 8.0), (s_id, 'sciences', 7.8), (s_id, 'humanities', 8.0);

    -- 7. Escola Centro Sul
    INSERT INTO public.schools (name, region_id, total_students, permanence, average_grade, attendance, risk_level, teacher_count, teacher_satisfaction, continued_education, infrastructure, alerts)
    VALUES ('Escola Centro Sul', r_centro, 380, 89, 7.5, 94, 'stable', 20, 48, 72, '{"library": {"books": 2200, "status": "active"}, "lab": {"machines": 18, "status": "active"}}', ARRAY[]::text[])
    RETURNING id INTO s_id;

    INSERT INTO public.school_metrics (school_id, subject, grade) VALUES
    (s_id, 'math', 7.2), (s_id, 'languages', 7.8), (s_id, 'sciences', 7.5), (s_id, 'humanities', 7.5);

END $$;
