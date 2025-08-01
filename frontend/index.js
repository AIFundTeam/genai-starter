// Main app logic

// Initialize app
document.addEventListener('user-ready', async (event) => {
    console.log('App initialized for user:', event.detail.email);
    
    // App is ready to use
    console.log('Ready for custom features!');
});


// Test functions
let testsPassed = {
    database: false,
    llm: false
};

function checkAllTests() {
    if (Object.values(testsPassed).every(v => v)) {
        document.getElementById('test-success').style.display = 'block';
    }
}

async function testDatabase() {
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = '<p>⏳ Testing database connection...</p>';
    
    try {
        // Try to read from items table
        const { data, error } = await supabaseClient
            .from('items')
            .select('id')
            .limit(1);
            
        if (error) throw error;
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ Database:</strong> Connected successfully!
            </div>
        `;
        testsPassed.database = true;
        checkAllTests();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ Database Error:</strong> ${error.message}
            </div>
        `;
    }
}

async function testPublicEndpoint() {
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = '<p>⏳ Testing public API endpoint...</p>';
    
    try {
        const data = await window.invokeEdgeFunction('hello-world', {
            name: 'Test User'
        });
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ Public API:</strong> ${data.message}
            </div>
        `;
        testsPassed.publicApi = true;
        checkAllTests();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ Public API Error:</strong> ${error.message}
            </div>
        `;
    }
}

async function testProtectedEndpoint() {
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = '<p>⏳ Testing user API endpoint...</p>';
    
    try {
        const data = await window.invokeEdgeFunction('user-endpoint', {
            user_email: window.getCurrentUser()
        });
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ User API:</strong> ${data.user} has ${data.itemCount} items
            </div>
        `;
        testsPassed.protectedApi = true;
        checkAllTests();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ User API Error:</strong> ${error.message}
            </div>
        `;
    }
}

async function testLLM() {
    const resultsDiv = document.getElementById('test-results');
    const promptInput = document.getElementById('llm-prompt');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>Error:</strong> Please enter a prompt
            </div>
        `;
        return;
    }
    
    resultsDiv.innerHTML = '<p>⏳ Testing LLM integration...</p>';
    
    try {
        const data = await window.invokeEdgeFunction('test-llm', { 
            prompt,
            user_email: window.getCurrentUser()
        });
        
        if (data.error) {
            throw new Error(data.message || data.error);
        }
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ LLM API:</strong> ${data.response}
                <br><small>Response from OpenAI GPT-4.1</small>
            </div>
        `;
        testsPassed.llm = true;
        checkAllTests();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ LLM Error:</strong> ${error.message}
                <br><small>Make sure OPENAI_API_KEY is set in Supabase Edge Function secrets</small>
            </div>
        `;
    }
}


