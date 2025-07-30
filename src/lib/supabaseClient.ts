import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key.
// It's highly recommended to use environment variables for this in a real project.
// Example for Vite: import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = 'https://dnpjvngwxhvadskopekr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGp2bmd3eGh2YWRza29wZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzg0OTQsImV4cCI6MjA2OTIxNDQ5NH0.Ve0UhG4lt_YGo39zZBzZWXfdMnO0rHSz8K1YScI_4vA';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);