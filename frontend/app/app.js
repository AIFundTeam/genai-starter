// Main app page application logic with Shadow DOM
import { styles } from './css.js';

class MainApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
    this.initializeUserManagement();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <!-- Header -->
      <header>
        <div class="container">
          <div class="logo">
            <h1>My App</h1>
          </div>
          <nav>
            <span class="user-info">User: <strong id="current-user">Loading...</strong></span>
            <button class="btn btn-small" id="test-setup-btn">Test Setup</button>
            <button class="btn btn-small" id="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container">
        <div class="welcome-section">
          <h2>Welcome to Your App!</h2>
          <p>Your full-stack template is ready. Start building amazing features with Claude Code.</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <h4>🚀 Ready to Build</h4>
            <p>Your app template is fully configured with Supabase, Cloudflare, and OpenAI integration.</p>
          </div>
          
          <div class="feature-card">
            <h4>🤖 AI-Powered Development</h4>
            <p>Use Claude Code to rapidly build features. The template is optimized for AI assistance.</p>
          </div>
          
          <div class="feature-card">
            <h4>⚡ Production Ready</h4>
            <p>Built with modern technologies and best practices for scalable applications.</p>
          </div>
        </div>
        
        <div class="getting-started">
          <h3>🎯 Next Steps</h3>
          <p>Ask Claude Code to build your custom features:</p>
          <ul>
            <li><code>"Build me a task management app"</code></li>
            <li><code>"Create a simple blog with posts"</code></li>
            <li><code>"Make a note-taking app with search"</code></li>
            <li><code>"Add user profiles and settings"</code></li>
          </ul>
          <p>Claude Code understands this template structure and can help you build features quickly!</p>
        </div>
      </main>
    `;
  }

  initializeEventListeners() {
    // Test setup button
    const testBtn = this.shadowRoot.getElementById('test-setup-btn');
    testBtn.addEventListener('click', () => {
      window.location.href = '../test/';
    });

    // Logout button
    const logoutBtn = this.shadowRoot.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('userEmail');
      window.location.href = '../login/';
    });
  }

  initializeUserManagement() {
    // Check if user is logged in
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      window.location.href = '../login/';
      return;
    }

    // Update user display
    const userDisplay = this.shadowRoot.getElementById('current-user');
    if (userDisplay) {
      userDisplay.textContent = savedEmail;
    }

    // App is ready for development
    console.log('Main app initialized for user:', savedEmail);
    console.log('Ready for custom features!');
  }
}

// Register the custom element
customElements.define('main-app', MainApp);