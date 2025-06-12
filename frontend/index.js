// Main app logic
let itemsChannel = null;

// Initialize app
document.addEventListener('user-ready', async (event) => {
    console.log('App initialized for user:', event.detail.email);
    
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    loadDashboard();
    loadItems();
    loadSettings();
    
    // Subscribe to realtime updates
    subscribeToItems();
});

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// Dashboard functions
async function loadDashboard() {
    try {
        // Load items count
        const items = await window.selectFrom('items', 'id');
        document.getElementById('total-items').textContent = items.length;
        
        // Load recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activities } = await supabaseClient
            .from('items')
            .select('id')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });
            
        document.getElementById('recent-activity').textContent = activities?.length || 0;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Test functions
let testsPassed = {
    database: false,
    publicApi: false,
    protectedApi: false,
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
        const data = await window.invokeEdgeFunction('protected-endpoint', {
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
                <br><small>Response from OpenAI GPT-3.5</small>
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

// Items functions
async function loadItems() {
    try {
        const showAll = localStorage.getItem('show-all-items') === 'true';
        let items;
        
        if (showAll) {
            items = await window.selectFrom('items', '*');
        } else {
            // Only show current user's items
            const { data, error } = await supabaseClient
                .from('items')
                .select('*')
                .eq('user_email', window.getCurrentUser())
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            items = data;
        }
        
        renderItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
        document.getElementById('items-list').innerHTML = 
            '<p class="error">Error loading items. Please refresh the page.</p>';
    }
}

function renderItems(items) {
    const itemsList = document.getElementById('items-list');
    
    if (items.length === 0) {
        itemsList.innerHTML = '<p class="empty-state">No items yet. Create your first item!</p>';
        return;
    }
    
    itemsList.innerHTML = items.map(item => `
        <div class="item-card" data-id="${item.id}">
            <h4>${item.name}</h4>
            <p>${item.description || 'No description'}</p>
            <div class="item-meta">
                <span>By: ${item.user_email}</span>
                <span>Created: ${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-small" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Subscribe to realtime updates
function subscribeToItems() {
    itemsChannel = window.subscribeToTable('items', (payload) => {
        console.log('Items changed:', payload);
        
        // Reload items on any change
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            loadItems();
            loadDashboard(); // Update counts
        }
    });
}

// Item modal functions
function showAddItemModal() {
    document.getElementById('add-item-modal').classList.add('show');
    document.getElementById('item-name').focus();
}

function hideAddItemModal() {
    document.getElementById('add-item-modal').classList.remove('show');
    document.getElementById('add-item-form').reset();
}

async function handleAddItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    
    try {
        await window.insertInto('items', {
            name,
            description,
            user_email: window.getCurrentUser()
        });
        
        hideAddItemModal();
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Error adding item. Please try again.');
    }
}

// Item actions
async function editItem(id) {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        await window.deleteFrom('items', id);
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

// Settings functions
async function loadSettings() {
    // Show current user email
    document.getElementById('settings-email').value = window.getCurrentUser();
    
    // Load preferences from localStorage
    const showAll = localStorage.getItem('show-all-items') === 'true';
    document.getElementById('show-all-items').checked = showAll;
}

function saveSettings() {
    const showAll = document.getElementById('show-all-items').checked;
    localStorage.setItem('show-all-items', showAll);
    
    // Reload items with new preference
    loadItems();
    
    alert('Settings saved!');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (itemsChannel) {
        supabaseClient.removeChannel(itemsChannel);
    }
});