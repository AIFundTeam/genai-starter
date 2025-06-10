// Initialize Supabase client
const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration! Make sure env.js is loaded.');
}

// Create Supabase client
const supabase = supabaseLib.createClient(supabaseUrl, supabaseAnonKey);

// Make it globally available
window.supabase = supabase;

// Database operations
async function selectFrom(table, columns = '*', filters = {}) {
    let query = supabase.from(table).select(columns);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });
    
    const { data, error } = await query;
    
    if (error) {
        console.error(`Error selecting from ${table}:`, error);
        throw error;
    }
    
    return data;
}

async function insertInto(table, data) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
    
    if (error) {
        console.error(`Error inserting into ${table}:`, error);
        throw error;
    }
    
    return result;
}

async function updateIn(table, id, updates) {
    const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) {
        console.error(`Error updating ${table}:`, error);
        throw error;
    }
    
    return data;
}

async function deleteFrom(table, id) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw error;
    }
}

// Realtime subscriptions
function subscribeToTable(table, callback, filters = {}) {
    let channel = supabase.channel(`${table}-changes`);
    
    // Build filter string
    let filterStr = '';
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            filterStr += `${key}=eq.${value}`;
        }
    });
    
    channel.on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: table,
            filter: filterStr || undefined
        },
        (payload) => {
            console.log(`Change in ${table}:`, payload);
            callback(payload);
        }
    );
    
    channel.subscribe((status) => {
        console.log(`Subscription to ${table} status:`, status);
    });
    
    return channel;
}

function unsubscribe(channel) {
    supabase.removeChannel(channel);
}

// Edge function invocation
async function invokeEdgeFunction(functionName, payload = {}) {
    try {
        const { data, error } = await supabase.functions.invoke(functionName, {
            body: payload
        });
        
        if (error) {
            console.error(`Error invoking ${functionName}:`, error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error(`Error invoking edge function ${functionName}:`, error);
        throw error;
    }
}

// Storage operations
async function uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
    
    if (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
    
    return data;
}

async function getPublicUrl(bucket, path) {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    
    return data.publicUrl;
}

async function deleteFile(bucket, paths) {
    const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);
    
    if (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Export functions
window.supabaseClient = {
    selectFrom,
    insertInto,
    updateIn,
    deleteFrom,
    subscribeToTable,
    unsubscribe,
    invokeEdgeFunction,
    uploadFile,
    getPublicUrl,
    deleteFile
};