import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key.
// It's highly recommended to use environment variables for this in a real project.
// Example for Vite: import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = 'https://niqkuhcrgobafktivonw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcWt1aGNyZ29iYWZrdGl2b253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDA3MzAsImV4cCI6MjA2OTQ3NjczMH0.Zy8i1GiPyKJueYS_TfRIvIBL9MS5qXyIrwkOoXHdCTQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
