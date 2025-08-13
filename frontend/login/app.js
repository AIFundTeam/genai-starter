// Login page application logic with Shadow DOM
import { styles } from './css.js';

class LoginApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <!-- Header -->
      <header>
        <div class="container">
          <div class="logo">
            <h1>App Template</h1>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container">
        <div class="auth-container">
          <div class="auth-card">
            <h2>Welcome!</h2>
            <p>Enter your email to get started</p>
            
            <form id="login-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="you@example.com"
                  required
                  autofocus
                >
              </div>
              
              <button type="submit" class="btn btn-primary btn-block">
                Continue
              </button>
            </form>
            
            <div class="auth-footer">
              <p>No password required - just enter your email to start using the app!</p>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer>
        <div class="container">
          <p>&copy; 2024 Your App. Built with the Full-Stack Template.</p>
        </div>
      </footer>
    `;
  }

  initializeEventListeners() {
    // Check if user is already logged in
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      window.location.href = '../app/';
    }

    // Handle form submission
    const form = this.shadowRoot.getElementById('login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = this.shadowRoot.getElementById('email').value.trim();
      if (email) {
        // Save email to localStorage
        localStorage.setItem('userEmail', email);
        // Redirect to main app
        window.location.href = '../app/';
      }
    });
  }
}

// Register the custom element
customElements.define('login-app', LoginApp);