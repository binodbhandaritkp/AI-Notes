import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
const SUPABASE_URL = "https://uzoihsxcnrlhxincqqzl.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b2loc3hjbnJsaHhpbmNxcXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMDc1MTUsImV4cCI6MjEwMjY4MzUxNX0.xdYcUG7qy7mn64PNbFj3ghWKXgllDzs4MsKwWOecU6s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
