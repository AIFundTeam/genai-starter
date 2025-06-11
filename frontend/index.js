// Main app logic
let itemsChannel = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure user is authenticated
    const user = await window.requireAuth();
    if (!user) return;
    
    console.log('App initialized for user:', user.email);
    
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
        const items = await window.supabaseClient.selectFrom('items', 'id', {
            user_id: window.getCurrentUser().id
        });
        document.getElementById('total-items').textContent = items.length;
        
        // Load recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activities } = await supabase
            .from('items')
            .select('id')
            .eq('user_id', window.getCurrentUser().id)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });
            
        document.getElementById('recent-activity').textContent = activities?.length || 0;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Test endpoint functions
async function testPublicEndpoint() {
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = '<p>Testing public endpoint...</p>';
    
    try {
        const data = await window.supabaseClient.invokeEdgeFunction('hello-world', {
            name: window.getCurrentUser().email
        });
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>Success!</strong> Response: ${JSON.stringify(data, null, 2)}
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    }
}

async function testProtectedEndpoint() {
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = '<p>Testing protected endpoint...</p>';
    
    try {
        const data = await window.supabaseClient.invokeEdgeFunction('protected-endpoint');
        
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>Success!</strong> Response: ${JSON.stringify(data, null, 2)}
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    }
}

// Items functions
async function loadItems() {
    try {
        const items = await window.supabaseClient.selectFrom('items', '*', {
            user_id: window.getCurrentUser().id
        });
        
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
    itemsChannel = window.supabaseClient.subscribeToTable('items', (payload) => {
        console.log('Items changed:', payload);
        
        // Reload items on any change
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            loadItems();
            loadDashboard(); // Update counts
        }
    }, {
        user_id: window.getCurrentUser().id
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
        await window.supabaseClient.insertInto('items', {
            name,
            description,
            user_id: window.getCurrentUser().id
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
        await window.supabaseClient.deleteFrom('items', id);
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

// Settings functions
async function loadSettings() {
    const user = window.getCurrentUser();
    document.getElementById('settings-email').value = user.email;
    
    const role = await window.getUserRole();
    document.getElementById('settings-role').value = role || 'user';
    
    // Load preferences from localStorage or database
    const notifications = localStorage.getItem('email-notifications') !== 'false';
    document.getElementById('email-notifications').checked = notifications;
}

function saveSettings() {
    const notifications = document.getElementById('email-notifications').checked;
    localStorage.setItem('email-notifications', notifications);
    
    alert('Settings saved!');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (itemsChannel) {
        window.supabaseClient.unsubscribe(itemsChannel);
    }
});