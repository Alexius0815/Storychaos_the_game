import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://iioipzphjxzoiofnukjs.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb2lwenBoanh6b2lvZm51a2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzYzOTMsImV4cCI6MjA5MTc1MjM5M30.aIO5sXDUNNk01lTcqb79f4BowKXy4YH4Er0OrB8gx8U";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
