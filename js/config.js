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

async function loadEnvVariables() {
    try {
        const response = await fetch('/.env');
        const text = await response.text();
        
        // Parse .env file content
        const envVars = {};
        text.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        
        return envVars;
    } catch (error) {
        console.error('Error loading environment variables:', error);
        return {};
    }
}

let envVariables = null;

export async function getConfig() {
    if (!envVariables) {
        envVariables = await loadEnvVariables();
    }
    return {
        supabaseUrl: envVariables.SUPABASE_URL,
        supabaseKey: envVariables.SUPABASE_ANON_KEY
    };
}

export { initializeSupabase, checkUser, supabase };