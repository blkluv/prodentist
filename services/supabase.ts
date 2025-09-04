import { createClient } from '@supabase/supabase-js';

// --- Real Supabase Client ---
// These are public keys and are safe to be exposed in a client-side application.
// Row Level Security (RLS) should be enabled in your Supabase project for data protection.
const supabaseUrl = 'https://zhgoqmizxvktqgxmzfjv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ29xbWl6eHZrdHFneG16Zmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTUyMzAsImV4cCI6MjA3MjEzMTIzMH0.2D7sJU3bSItotTSS6pL2S1ldahidapXJKETrw1jfRHQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);