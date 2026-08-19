import { createClient } from "@supabase/supabase-js";

// ==========================================
// 1. SUPABASE URL
// Paste your project URL below:
// ==========================================
const SUPABASE_URL = "https://uzoihsxcnrlhxincqqzl.supabase.co";

// ==========================================
// 2. SUPABASE PUBLIC KEY (anon / publishable)
// Paste your project public anon key below:
// ==========================================
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b2loc3hjbnJsaHhpbmNxcXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMDc1MTUsImV4cCI6MjEwMjY4MzUxNX0.xdYcUG7qy7mn64PNbFj3ghWKXgllDzs4MsKwWOecU6s";

// ==========================================
// 3. EXPORT CLIENT INSTANCE
// ==========================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
