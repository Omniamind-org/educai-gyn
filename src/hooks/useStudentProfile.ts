import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudentProfile {
    id: string;
    name: string;
    cpf: string;
    grade: string;
    phone: string | null;
}

export function useStudentProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('students')
                    .select('id, name, cpf, grade, phone')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching student profile:', error);
                    setProfile(null);
                } else {
                    setProfile(data);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    return { profile, loading };
}
