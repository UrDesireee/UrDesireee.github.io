// Supabase configuration
const supabaseConfig = {
    url: '', // Will be set from HTML
    key: '', // Will be set from HTML
};

// Initialize Supabase client
let supabase = null;

function initializeSupabase(url, key) {
    supabaseConfig.url = url;
    supabaseConfig.key = key;
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

export { initializeSupabase, checkUser, supabase };