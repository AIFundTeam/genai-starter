// Main app page application logic with Shadow DOM
import { styles } from './css.js';
import {
  VoiceManager,
  formatTranscriptEntry,
  addTranscriptEntry,
} from '../voice-utils.js';

class MainApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.voiceManager = null;
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
    this.initializeUserManagement();
    this.initializeVoiceManager();
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
          <h2>Template Status</h2>
          <p>Your full-stack template building blocks. Use these features or ask Claude Code to add more!</p>
        </div>

        <div class="status-grid">
          <div class="status-card status-enabled">
            <div class="status-header">
              <h4>✅ Database (PostgreSQL)</h4>
              <span class="status-badge enabled">Enabled</span>
            </div>
            <p>Supabase PostgreSQL database with Row Level Security</p>
            <ul class="status-details">
              <li>Direct queries from frontend</li>
              <li>Real-time subscriptions</li>
              <li>Example: <code>items</code> table included</li>
            </ul>
          </div>

          <div class="status-card status-enabled">
            <div class="status-header">
              <h4>✅ Edge Functions (Backend)</h4>
              <span class="status-badge enabled">Enabled</span>
            </div>
            <p>Serverless Deno functions with automatic CORS</p>
            <ul class="status-details">
              <li>Test-driven development ready</li>
              <li>Shared utilities and templates</li>
              <li>Example: <code>test-llm</code> function included</li>
            </ul>
          </div>

          <div class="status-card status-enabled">
            <div class="status-header">
              <h4>✅ LLM Integration (OpenAI)</h4>
              <span class="status-badge enabled">Enabled</span>
            </div>
            <p>OpenAI API integration for AI features</p>
            <ul class="status-details">
              <li>GPT-4.5 Turbo access</li>
              <li>Streaming responses supported</li>
              <li>Configured in edge functions</li>
            </ul>
          </div>

          <div class="status-card status-disabled" id="voice-status-card">
            <div class="status-header">
              <h4>⏸️ Voice Interface (LiveKit)</h4>
              <span class="status-badge disabled" id="voice-badge">Checking...</span>
            </div>
            <p>Real-time voice conversations with AI agents</p>
            <ul class="status-details">
              <li>STT/TTS with LiveKit Inference</li>
              <li>Agent can call backend functions</li>
              <li>Optional feature - requires setup</li>
            </ul>
          </div>

          <div class="status-card status-enabled">
            <div class="status-header">
              <h4>✅ User Management</h4>
              <span class="status-badge enabled">Enabled</span>
            </div>
            <p>Simple email-based user identification</p>
            <ul class="status-details">
              <li>No password authentication</li>
              <li>localStorage-based sessions</li>
              <li>User email tracked with data</li>
            </ul>
          </div>

          <div class="status-card status-enabled">
            <div class="status-header">
              <h4>✅ Frontend Hosting</h4>
              <span class="status-badge enabled">Enabled</span>
            </div>
            <p>Cloudflare Pages with automatic deployments</p>
            <ul class="status-details">
              <li>Vanilla JS/HTML/CSS (no build)</li>
              <li>Shadow DOM components</li>
              <li>Global CDN distribution</li>
            </ul>
          </div>
        </div>

        <div class="getting-started">
          <h3>🎯 Build Your Features</h3>
          <p>Ask Claude Code to use these building blocks:</p>
          <ul>
            <li><code>"Build me a task management app"</code></li>
            <li><code>"Create a simple blog with posts"</code></li>
            <li><code>"Make a note-taking app with search"</code></li>
            <li><code>"Add AI-powered content generation"</code></li>
          </ul>
          <p>Claude Code understands this template and can combine these blocks to build features quickly!</p>
        </div>

        <div class="voice-section" style="display: none;">
          <h3>🎤 Voice Interface</h3>
          <p>Talk to your AI assistant using voice. The assistant can answer questions and call backend functions.</p>

          <div class="voice-controls">
            <button id="voice-button" class="voice-button">
              🎤
            </button>
            <div id="voice-status" class="voice-status">
              Ready to connect
            </div>
          </div>

          <div class="voice-info" id="voice-info" style="display: none;">
            <p><strong>💡 Try saying:</strong></p>
            <p>• "Can you test the database?"</p>
            <p>• "What can you help me with?"</p>
            <p>• "Tell me about this application"</p>
          </div>

          <div class="transcript-container" id="transcript-container" style="display: none;">
            <div class="transcript-header">
              <h4>📝 Conversation Transcript</h4>
              <button id="clear-transcript-btn" class="btn btn-small">Clear</button>
            </div>
            <div class="transcript-log" id="transcript-log"></div>
          </div>

          <div id="remote-audio-container" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"></div>
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

    // Voice button
    const voiceBtn = this.shadowRoot.getElementById('voice-button');
    voiceBtn.addEventListener('click', () => this.toggleVoice());

    // Clear transcript button
    const clearTranscriptBtn = this.shadowRoot.getElementById('clear-transcript-btn');
    clearTranscriptBtn?.addEventListener('click', () => {
      const transcriptLog = this.shadowRoot.getElementById('transcript-log');
      if (transcriptLog) transcriptLog.innerHTML = '';
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
  }

  async initializeVoiceManager() {
    const voiceStatusCard = this.shadowRoot.getElementById('voice-status-card');
    const voiceBadge = this.shadowRoot.getElementById('voice-badge');
    const voiceSection = this.shadowRoot.querySelector('.voice-section');
    const transcriptLog = this.shadowRoot.getElementById('transcript-log');

    // Create VoiceManager with UI callbacks
    this.voiceManager = new VoiceManager({
      onStatusUpdate: (status) => this.updateVoiceStatus(status),
      onConnectionChange: (connected) => {
        const voiceBtn = this.shadowRoot.getElementById('voice-button');
        const voiceInfo = this.shadowRoot.getElementById('voice-info');
        const transcriptContainer = this.shadowRoot.getElementById('transcript-container');

        if (connected) {
          voiceBtn.classList.add('connected');
          voiceInfo.style.display = 'block';
          voiceInfo.innerHTML = `
            <p><strong>💡 Try saying:</strong></p>
            <p>• "Can you test the database?"</p>
            <p>• "What can you help me with?"</p>
            <p>• "Tell me about this application"</p>
          `;
          if (transcriptContainer) transcriptContainer.style.display = 'block';
        } else {
          voiceBtn.classList.remove('connected');
          voiceInfo.style.display = 'none';
          if (transcriptContainer) transcriptContainer.style.display = 'none';
        }
        voiceBtn.disabled = false;
      },
      onTranscript: (speaker, text) => {
        if (transcriptLog) {
          const entry = formatTranscriptEntry(speaker, text);
          addTranscriptEntry(transcriptLog, entry);
        }
      },
    });

    // Check availability
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        voiceBadge.textContent = 'Disabled';
        return;
      }

      const { available, configured } = await this.voiceManager.checkAvailability(userEmail);

      if (!configured) {
        // LiveKit not configured
        voiceStatusCard.classList.remove('status-enabled');
        voiceStatusCard.classList.add('status-disabled');
        voiceBadge.classList.remove('enabled');
        voiceBadge.classList.add('disabled');
        voiceBadge.textContent = 'Disabled';

        const voiceHeader = voiceStatusCard.querySelector('h4');
        voiceHeader.textContent = '⏸️ Voice Interface (LiveKit)';
      } else if (available) {
        // LiveKit configured - enable it
        voiceStatusCard.classList.remove('status-disabled');
        voiceStatusCard.classList.add('status-enabled');
        voiceBadge.classList.remove('disabled');
        voiceBadge.classList.add('enabled');
        voiceBadge.textContent = 'Enabled';

        const voiceHeader = voiceStatusCard.querySelector('h4');
        voiceHeader.textContent = '✅ Voice Interface (LiveKit)';

        // Show voice controls section
        if (voiceSection) {
          voiceSection.style.display = 'block';
        }

        // Load SDK
        await this.voiceManager.loadSDK();
      }
    } catch (error) {
      console.error('Error checking voice availability:', error);
      voiceBadge.textContent = 'Disabled';
    }
  }

  async toggleVoice() {
    const voiceBtn = this.shadowRoot.getElementById('voice-button');
    const audioContainer = this.shadowRoot.getElementById('remote-audio-container');

    try {
      voiceBtn.disabled = true;
      const userEmail = localStorage.getItem('userEmail');
      await this.voiceManager.toggle(userEmail, audioContainer);
    } catch (error) {
      console.error('Error toggling voice:', error);
      this.updateVoiceStatus(error.message || 'Connection failed', true);
      voiceBtn.disabled = false;
    }
  }


  updateVoiceStatus(message, isError = false) {
    const statusEl = this.shadowRoot.getElementById('voice-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.classList.remove('connected', 'error');
      if (isError) {
        statusEl.classList.add('error');
      } else if (this.isVoiceConnected) {
        statusEl.classList.add('connected');
      }
    }
  }
}

// Register the custom element
customElements.define('main-app', MainApp);
