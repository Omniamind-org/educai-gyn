-- Migration to Expose Infrastructure Score to Schools Table

-- 1. Add column to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS infrastructure_score INTEGER DEFAULT 0;

-- 2. Update the caching function to also copy the score
CREATE OR REPLACE FUNCTION public.update_infrastructure_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.schools
    SET 
        infrastructure = NEW.data,
        infrastructure_score = CAST(NEW.score AS INTEGER), -- Copy the score
        risk_level = CASE 
            WHEN NEW.score < 50 THEN 'critical'
            WHEN NEW.score < 75 THEN 'alert'
            ELSE 'stable'
        END
    WHERE id = NEW.school_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Backfill existing scores (if any)
UPDATE public.schools s
SET infrastructure_score = (
    SELECT score::INTEGER 
    FROM public.infrastructure_surveys i 
    WHERE i.school_id = s.id 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM public.infrastructure_surveys i WHERE i.school_id = s.id
);
