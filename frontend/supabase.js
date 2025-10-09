// Initialize Supabase client
const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration! Make sure env.js is loaded.');
}

// Create Supabase client
// When loaded from CDN, Supabase is available as window.supabase
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Make the client globally available
window.supabaseClient = supabaseClient;

// Database operations
async function selectFrom(table, columns = '*', filters = {}) {
    let query = supabaseClient.from(table).select(columns);
    
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
    const { data: result, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
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
    const { error } = await supabaseClient
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
    let channel = supabaseClient.channel(`${table}-changes`);
    
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
    supabaseClient.removeChannel(channel);
}

// Edge function invocation
async function invokeEdgeFunction(functionName, payload = {}) {
    try {
        const { data, error } = await supabaseClient.functions.invoke(functionName, {
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
    const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(path, file);
    
    if (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
    
    return data;
}

async function getPublicUrl(bucket, path) {
    const { data } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(path);
    
    return data.publicUrl;
}

async function deleteFile(bucket, paths) {
    const { error } = await supabaseClient.storage
        .from(bucket)
        .remove(paths);
    
    if (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Export functions
window.invokeEdgeFunction = invokeEdgeFunction;
window.selectFrom = selectFrom;
window.insertInto = insertInto;
window.updateIn = updateIn;
window.deleteFrom = deleteFrom;
window.subscribeToTable = subscribeToTable;
window.unsubscribe = unsubscribe;
window.uploadFile = uploadFile;
window.getPublicUrl = getPublicUrl;
window.deleteFile = deleteFile;