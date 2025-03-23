// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://alnsqajokzufxfbymzrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnNxYWpva3p1ZnhmYnltenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTY5ODUsImV4cCI6MjA1ODIzMjk4NX0.aGAj3xvvO9MPVUOYiZl9C7-Oihnb5pZXifXXiJmJLdw';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;