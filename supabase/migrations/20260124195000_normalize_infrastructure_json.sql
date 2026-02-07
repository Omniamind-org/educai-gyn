-- Migration to standardize infrastructure JSON format
-- Converts legacy 'books' and 'machines' keys to universal 'quantity' key

DO $$
DECLARE
    r RECORD;
    new_data JSONB;
BEGIN
    FOR r IN SELECT id, infrastructure FROM public.schools WHERE infrastructure IS NOT NULL
    LOOP
        new_data := r.infrastructure;
        
        -- Migrate Library: books -> quantity
        IF (new_data -> 'library' ->> 'books') IS NOT NULL THEN
            new_data := jsonb_set(
                new_data, 
                '{library, quantity}', 
                (new_data -> 'library' -> 'books')
            ) - '{library, books}'::text[];
        END IF;

        -- Migrate Lab: machines -> quantity
        IF (new_data -> 'lab' ->> 'machines') IS NOT NULL THEN
            new_data := jsonb_set(
                new_data, 
                '{lab, quantity}', 
                (new_data -> 'lab' -> 'machines')
            ) - '{lab, machines}'::text[];
        END IF;

        -- Update the row if changes were made
        IF new_data IS DISTINCT FROM r.infrastructure THEN
            UPDATE public.schools 
            SET infrastructure = new_data 
            WHERE id = r.id;
        END IF;
    END LOOP;
END $$;
