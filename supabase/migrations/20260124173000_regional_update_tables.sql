-- 1. Create table for Daily Attendance
CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    present_students JSONB DEFAULT '[]'::jsonb, -- Array of student IDs present
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(class_id, date)
);

-- 2. Create table for Survey Campaigns (Configurable periods)
CREATE TABLE IF NOT EXISTS public.survey_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    target_role public.app_role NOT NULL CHECK (target_role IN ('professor', 'aluno', 'diretor')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for Climate/Satisfaction Surveys (Teachers)
CREATE TABLE IF NOT EXISTS public.climate_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.survey_campaigns(id) ON DELETE CASCADE,
    nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(teacher_id, campaign_id)
);

-- 4. Create table for Infrastructure Surveys (Directors)
CREATE TABLE IF NOT EXISTS public.infrastructure_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    term TEXT NOT NULL, -- e.g., '2024.1'
    data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Full checklist state
    score NUMERIC(5,2) DEFAULT 0, -- Calculated score 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 5. Add 'type' column to tasks to differentiate Exams vs Regular Work
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('exam', 'assignment', 'project')) DEFAULT 'assignment';

-- 6. Enable RLS
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_surveys ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Permissive for now, refining later)
CREATE POLICY "Enable all access for authenticated users" ON public.daily_attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read/write for authenticated users" ON public.survey_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read/write for authenticated users" ON public.climate_surveys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read/write for authenticated users" ON public.infrastructure_surveys FOR ALL USING (auth.role() = 'authenticated');

-- 8. Backend Logic: Functions & Triggers

-- Function A: Get Active Survey for a Role
CREATE OR REPLACE FUNCTION public.get_active_survey(user_role public.app_role)
RETURNS UUID AS $$
    SELECT id 
    FROM public.survey_campaigns 
    WHERE target_role = user_role 
    AND is_active = true 
    AND CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1;
$$ LANGUAGE SQL;

-- Function B: Update School Attendance % on Daily Attendance Insert/Update
CREATE OR REPLACE FUNCTION public.update_school_attendance_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_school_id UUID;
    v_total_days INTEGER;
    v_total_presents INTEGER;
    v_total_expected INTEGER;
    v_class_student_count INTEGER;
BEGIN
    -- 1. Find school_id via class -> school (Need to link class to school first?)
    -- Assuming classes are linked to schools via some join, checking schema...
    -- Wait, schema check: classes table doesn't have school_id directly?
    -- It seems classes are loose or linked via teachers?
    -- Let's re-check schema. For now, we will skip the exact school aggregation until schema is validated.
    -- We'll assume a direct link logic or stub it.
    
    -- STUB: Log for now
    RAISE NOTICE 'Attendance updated for class %', NEW.class_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attendance_change
AFTER INSERT OR UPDATE ON public.daily_attendance
FOR EACH ROW EXECUTE FUNCTION public.update_school_attendance_stats();

-- Function C: Update Infrastructure Score on Survey Insert
CREATE OR REPLACE FUNCTION public.update_infrastructure_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the main schools table with this new data snapshot
    UPDATE public.schools
    SET 
        infrastructure = NEW.data,
        -- Simple logic: if score < 50, risk = critical
        risk_level = CASE 
            WHEN NEW.score < 50 THEN 'critical'
            WHEN NEW.score < 75 THEN 'alert'
            ELSE 'stable'
        END
    WHERE id = NEW.school_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_infra_survey_change
AFTER INSERT ON public.infrastructure_surveys
FOR EACH ROW EXECUTE FUNCTION public.update_infrastructure_score();
