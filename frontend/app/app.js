// Main app page application logic with Shadow DOM
import { styles } from './css.js';

class MainApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.voiceRoom = null;
    this.isVoiceConnected = false;
    this.remoteAudioElement = null;
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
    this.initializeUserManagement();
    this.checkVoiceAvailability();
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
            <p>• "Can you call the backend LLM and say hello?"</p>
            <p>• "What can you help me with?"</p>
            <p>• "Tell me about this application"</p>
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

  async checkVoiceAvailability() {
    const voiceStatusCard = this.shadowRoot.getElementById('voice-status-card');
    const voiceBadge = this.shadowRoot.getElementById('voice-badge');
    const voiceSection = this.shadowRoot.querySelector('.voice-section');

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        voiceBadge.textContent = 'Disabled';
        return;
      }

      const supabaseUrl = window.SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/livekit-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
        }),
      });

      if (response.status === 501) {
        // LiveKit not configured
        voiceStatusCard.classList.remove('status-enabled');
        voiceStatusCard.classList.add('status-disabled');
        voiceBadge.classList.remove('enabled');
        voiceBadge.classList.add('disabled');
        voiceBadge.textContent = 'Disabled';

        const voiceHeader = voiceStatusCard.querySelector('h4');
        voiceHeader.textContent = '⏸️ Voice Interface (LiveKit)';
      } else if (response.ok) {
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
        this.loadLiveKitSDK();
      }
    } catch (error) {
      console.error('Error checking voice availability:', error);
      voiceBadge.textContent = 'Disabled';
    }
  }

  loadLiveKitSDK() {
    // Check if LiveKit SDK is already loaded
    if (window.LivekitClient) {
      return;
    }

    // Load LiveKit client SDK
    const clientScript = document.createElement('script');
    clientScript.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
    clientScript.onload = () => {};
    clientScript.onerror = () => {
      console.error('Failed to load LiveKit SDK');
      this.updateVoiceStatus('Failed to load voice SDK', true);
    };
    document.head.appendChild(clientScript);
  }

  async toggleVoice() {
    if (this.isVoiceConnected) {
      await this.disconnectVoice();
    } else {
      await this.connectVoice();
    }
  }

  async connectVoice() {
    const voiceBtn = this.shadowRoot.getElementById('voice-button');
    const voiceInfo = this.shadowRoot.getElementById('voice-info');

    try {
      voiceBtn.disabled = true;
      this.updateVoiceStatus('Connecting...');

      // Check if LiveKit SDK is loaded
      if (!window.LivekitClient) {
        throw new Error('LiveKit SDK not loaded');
      }

      // Get user email
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User not logged in');
      }

      // Request access token from backend
      const supabaseUrl = window.SUPABASE_URL;
      const tokenResponse = await fetch(`${supabaseUrl}/functions/v1/livekit-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        if (tokenResponse.status === 501) {
          // LiveKit not configured
          this.updateVoiceStatus('Voice not configured', true);
          voiceInfo.innerHTML = `
            <p><strong>⚙️ Voice interface not configured</strong></p>
            <p>To enable voice features:</p>
            <ol style="padding-left: 1.5rem; margin: 0.5rem 0;">
              <li>Sign up at <a href="https://cloud.livekit.io/" target="_blank">LiveKit Cloud</a></li>
              <li>Add credentials to env.config</li>
              <li>Deploy backend with ./deploy_backend.sh</li>
              <li>Deploy agent: cd livekit-agent && lk agent deploy</li>
            </ol>
          `;
          voiceInfo.style.display = 'block';
          voiceBtn.disabled = false;
          return;
        }
        throw new Error(errorData.error || 'Failed to get token');
      }

      const { token, url, room_name } = await tokenResponse.json();

      // Create LiveKit room
      this.voiceRoom = new window.LivekitClient.Room();
      const { RoomEvent, RemoteParticipant } = window.LivekitClient;

      // Set up event listeners
      this.voiceRoom.on(RoomEvent.Disconnected, () => {
        this.isVoiceConnected = false;
        voiceBtn.classList.remove('connected');
        voiceBtn.disabled = false;
        this.updateVoiceStatus('Disconnected');
        voiceInfo.style.display = 'none';
        if (this.remoteAudioElement) {
          this.remoteAudioElement.remove();
          this.remoteAudioElement = null;
        }
      });

      this.voiceRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'audio' && participant instanceof RemoteParticipant) {
          const audioElement = track.attach();
          audioElement.autoplay = true;
          const container = this.shadowRoot.getElementById('remote-audio-container');
          if (container && !container.contains(audioElement)) {
            container.appendChild(audioElement);
          }
          const playPromise = audioElement.play();
          if (playPromise) {
            playPromise.catch((err) => {
              console.warn('Voice playback blocked by browser policy', err);
            });
          }
          this.remoteAudioElement = audioElement;
        }
      });

      this.voiceRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === 'audio') {
          track.detach();
          if (this.remoteAudioElement) {
            this.remoteAudioElement.remove();
            this.remoteAudioElement = null;
          }
        }
      });

      // Connect to room
      await this.voiceRoom.connect(url, token);

      // Enable audio playback (required by some browsers)
      try {
        await this.voiceRoom.startAudio();
      } catch (err) {
        console.warn('Audio playback requires user interaction:', err);
      }

      // Wait for room to be fully ready and agent to connect
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure already subscribed audio tracks attach
      this.voiceRoom.remoteParticipants.forEach((participant) => {
        if (!participant?.audioTracks) return;
        participant.audioTracks.forEach((publication) => {
          const track = publication?.track;
          if (!track) return;
          const audioElement = track.attach();
          audioElement.autoplay = true;
          const container = this.shadowRoot.getElementById('remote-audio-container');
          if (container && !container.contains(audioElement)) {
            container.appendChild(audioElement);
          }
          const playPromise = audioElement.play();
          if (playPromise) {
            playPromise.catch((err) => console.warn('Voice playback blocked by browser policy', err));
          }
          this.remoteAudioElement = audioElement;
        });
      });

      // Create and publish microphone track with agent-friendly settings
      const micTrack = await window.LivekitClient.createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      // Publish the track with explicit source
      await this.voiceRoom.localParticipant.publishTrack(micTrack, {
        source: window.LivekitClient.Track.Source.Microphone,
        name: 'microphone',
      });

      // Update UI
      this.isVoiceConnected = true;
      voiceBtn.classList.add('connected');
      voiceBtn.disabled = false;
      this.updateVoiceStatus('Connected - Speak now', false);
      voiceInfo.style.display = 'block';
      voiceInfo.innerHTML = `
        <p><strong>💡 Try saying:</strong></p>
        <p>• "Can you test the database?"</p>
        <p>• "What can you help me with?"</p>
        <p>• "Tell me about this application"</p>
      `;
    } catch (error) {
      console.error('Error connecting to voice:', error);
      this.updateVoiceStatus(error.message || 'Connection failed', true);
      voiceBtn.disabled = false;
    }
  }

  async disconnectVoice() {
    const voiceBtn = this.shadowRoot.getElementById('voice-button');
    const voiceInfo = this.shadowRoot.getElementById('voice-info');

    try {
      this.updateVoiceStatus('Disconnecting...');

      if (this.voiceRoom) {
        if (this.remoteAudioElement) {
          this.remoteAudioElement.remove();
          this.remoteAudioElement = null;
        }
        await this.voiceRoom.disconnect();
        this.voiceRoom = null;
      }

      this.isVoiceConnected = false;
      voiceBtn.classList.remove('connected');
      this.updateVoiceStatus('Disconnected');
      voiceInfo.style.display = 'none';
    } catch (error) {
      console.error('Error disconnecting:', error);
      this.updateVoiceStatus('Error disconnecting', true);
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
