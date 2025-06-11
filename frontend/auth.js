// Global auth state
let currentUser = null;

// Wait for auth to be ready
window.authReady = new Promise((resolve) => {
    window.resolveAuthReady = resolve;
});

// Authentication initialization
document.addEventListener('DOMContentLoaded', () => {
    if (!window.supabase) {
        console.error("Supabase client not found!");
        document.body.innerHTML = '<h1>Application Error</h1><p>Could not initialize. Please refresh the page.</p>';
        return;
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', _event);
        currentUser = session?.user ?? null;
        
        handleAuthRouting();
        updateUI();
        
        // Resolve auth ready promise
        if (window.resolveAuthReady) {
            window.resolveAuthReady(currentUser);
            window.resolveAuthReady = null;
        }
        
        // Dispatch auth ready event
        document.dispatchEvent(new CustomEvent('auth-ready', { 
            detail: { user: currentUser } 
        }));
    });

    setupEventListeners();
});

// Route based on auth state
function handleAuthRouting() {
    const path = window.location.pathname;
    const isLoginPage = path.includes('login');
    const isIndexPage = path === '/' || path.includes('index.html');

    if (!currentUser && isIndexPage) {
        // Not logged in and on main app page - redirect to login
        console.log('Redirecting to login...');
        window.location.href = 'login.html';
    } else if (currentUser && isLoginPage) {
        // Logged in but on login page - redirect to main app
        console.log('Redirecting to app...');
        window.location.href = 'index.html';
    }
}

// Update UI elements based on auth state
async function updateUI() {
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const userRole = document.getElementById('user-role');
    const signOutBtn = document.getElementById('sign-out-btn');
    const authContent = document.getElementById('auth-content');
    const publicContent = document.getElementById('public-content');

    if (currentUser) {
        // Show authenticated content
        if (userInfo) userInfo.style.display = 'block';
        if (authContent) authContent.style.display = 'block';
        if (publicContent) publicContent.style.display = 'none';
        
        // Update user info
        if (userEmail) userEmail.textContent = currentUser.email;
        
        // Get user role
        if (userRole) {
            const role = await getUserRole();
            userRole.textContent = role || 'user';
            userRole.className = `role-badge role-${role || 'user'}`;
        }
        
        // Show sign out button
        if (signOutBtn) signOutBtn.style.display = 'inline-block';
    } else {
        // Show public content
        if (userInfo) userInfo.style.display = 'none';
        if (authContent) authContent.style.display = 'none';
        if (publicContent) publicContent.style.display = 'block';
        if (signOutBtn) signOutBtn.style.display = 'none';
    }
}

// Get current user's role from database
async function getUserRole() {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single();
            
        if (error) throw error;
        return data?.role;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

// Setup common event listeners
function setupEventListeners() {
    // Sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.onclick = async (e) => {
            e.preventDefault();
            console.log('Signing out...');
            
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                alert(`Error signing out: ${error.message}`);
            }
        };
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            if (!email) {
                alert('Please enter your email');
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/index.html`
                    }
                });
                
                if (error) throw error;
                
                alert(`Magic link sent to ${email}! Check your inbox.`);
                loginForm.reset();
            } catch (error) {
                console.error('Error sending magic link:', error);
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Magic Link';
            }
        };
    }
}

// Export functions for use in other modules
window.getCurrentUser = () => currentUser;
window.getUserRole = getUserRole;
window.requireAuth = async () => {
    await window.authReady;
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
};