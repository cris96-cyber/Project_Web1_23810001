const SUPABASE_ENABLED = true;

const SUPABASE_URL = "https://ddoacrhzjfcifxokgxde.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb2Fjcmh6amZjaWZ4b2tneGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzA0NjEsImV4cCI6MjA5NDM0NjQ2MX0.js-gwAgeacPmhbf8pgesUq41YbI4xVCTqQQSJI-TvlQ";

const SUPABASE_STORAGE_BUCKET = "web1-assets";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
