// Test page application logic with Shadow DOM
import { styles } from './css.js';

class TestApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.testsPassed = {
      database: false,
      llm: false
    };
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
    this.initializeUserManagement();
    this.loadSharedUtilities();
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
            <button class="btn btn-small" id="main-app-btn">Main App</button>
            <button class="btn btn-small" id="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container">
        <div class="welcome-section">
          <h2>Test Your Setup</h2>
          <p>Let's verify your full-stack configuration is working correctly. Once all tests pass, you'll be ready to build your app with Claude Code!</p>
        </div>
        
        <!-- Test Setup Section -->
        <div class="test-setup">
          <div class="test-grid">
            <div class="test-card">
              <h4>1. Frontend</h4>
              <p>✅ Frontend deployed and running</p>
            </div>
            
            <div class="test-card">
              <h4>2. Database</h4>
              <button class="btn btn-secondary" id="test-database-btn">
                Test Database
              </button>
            </div>
            
            <div class="test-card">
              <h4>3. LLM Integration</h4>
              <div class="llm-test">
                <input type="text" id="llm-prompt" placeholder="Ask a question..." value="What is 2+2?">
                <button class="btn btn-primary" id="test-llm-btn">
                  Test LLM API
                </button>
              </div>
            </div>
          </div>
          
          <div id="test-results" class="test-results"></div>
          
          <div class="test-success" id="test-success">
            <h4>🎉 All Tests Passed!</h4>
            <p><strong>Your setup is working perfectly!</strong></p>
            <p>You're ready to start building your app! Visit the main dashboard to get started.</p>
          </div>
        </div>
      </main>
    `;
  }

  initializeEventListeners() {
    // Main app button
    const mainAppBtn = this.shadowRoot.getElementById('main-app-btn');
    mainAppBtn.addEventListener('click', () => {
      window.location.href = '../app/';
    });

    // Logout button
    const logoutBtn = this.shadowRoot.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('userEmail');
      window.location.href = '../login/';
    });

    // Test database button
    const testDbBtn = this.shadowRoot.getElementById('test-database-btn');
    testDbBtn.addEventListener('click', () => this.testDatabase());

    // Test LLM button
    const testLlmBtn = this.shadowRoot.getElementById('test-llm-btn');
    testLlmBtn.addEventListener('click', () => this.testLLM());
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
  }

  async loadSharedUtilities() {
    // Wait for supabase client to be available
    await this.waitForGlobal('supabaseClient');
    await this.waitForGlobal('invokeEdgeFunction');
    await this.waitForGlobal('getCurrentUser');
  }

  waitForGlobal(globalName) {
    return new Promise((resolve) => {
      if (window[globalName]) {
        resolve();
      } else {
        const check = () => {
          if (window[globalName]) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      }
    });
  }

  checkAllTests() {
    if (Object.values(this.testsPassed).every(v => v)) {
      const successDiv = this.shadowRoot.getElementById('test-success');
      successDiv.style.display = 'block';
    }
  }

  async testDatabase() {
    const resultsDiv = this.shadowRoot.getElementById('test-results');
    resultsDiv.innerHTML = '<p>⏳ Testing database connection...</p>';
    
    try {
      // Try to read from items table
      const { data, error } = await window.supabaseClient
        .from('items')
        .select('id')
        .limit(1);
        
      if (error) throw error;
      
      resultsDiv.innerHTML = `
        <div class="alert alert-success">
          <strong>✅ Database:</strong> Connected successfully!
        </div>
      `;
      this.testsPassed.database = true;
      this.checkAllTests();
    } catch (error) {
      resultsDiv.innerHTML = `
        <div class="alert alert-error">
          <strong>❌ Database Error:</strong> ${error.message}
        </div>
      `;
    }
  }

  async testLLM() {
    const resultsDiv = this.shadowRoot.getElementById('test-results');
    const promptInput = this.shadowRoot.getElementById('llm-prompt');
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
          <br><small>Response from OpenAI GPT-5 via Responses API</small>
        </div>
      `;
      this.testsPassed.llm = true;
      this.checkAllTests();
    } catch (error) {
      resultsDiv.innerHTML = `
        <div class="alert alert-error">
          <strong>❌ LLM Error:</strong> ${error.message}
          <br><small>Make sure OPENAI_API_KEY is set in Supabase Edge Function secrets</small>
        </div>
      `;
    }
  }

}


// Register the custom element
customElements.define('test-app', TestApp);