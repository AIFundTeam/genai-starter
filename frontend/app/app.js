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
    this.loadLiveKitSDK();
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

        <div class="voice-section">
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
