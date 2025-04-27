// Supabase configuration
const supabaseConfig = {
    url: 'https://vuexvuxmbsspltewgleq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZXh2dXhtYnNzcGx0ZXdnbGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2OTYzNzAsImV4cCI6MjA2MTI3MjM3MH0.j-WxT7lIxZfTwoBnzhcPdZPNjrCNexdXSq8qtOLsHTw'
};

// Initialize Supabase client
let supabase = null;

function initializeSupabase() {
    supabase = supabaseClient.createClient(supabaseConfig.url, supabaseConfig.key);
}

// Check if user is already logged in
const checkUser = async () => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }
    const user = await supabase.auth.getUser();
    return user;
};

export async function getConfig() {
    return {
        supabaseUrl: supabaseConfig.url,
        supabaseKey: supabaseConfig.key
    };
}

export { initializeSupabase, checkUser, supabase };