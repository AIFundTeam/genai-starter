/**
 * Voice Agent Utilities
 *
 * This file provides a complete voice interface module for LiveKit agents.
 * VoiceManager handles all voice logic: SDK loading, connection, events, and UI updates.
 */

/**
 * Create and publish microphone track to LiveKit room
 *
 * Handles microphone track creation and publishing with proper audio settings.
 * Data Flow: Browser Mic → LiveKit Track → Agent STT
 *
 * @param {Room} room - LiveKit room instance
 * @param {object} LivekitClient - LiveKit client library (window.LivekitClient)
 * @returns {Promise<LocalAudioTrack>} The published microphone track
 * @throws {Error} If microphone access fails or publishing fails
 */
export async function publishMicrophoneTrack(room, LivekitClient) {
  // Create local audio track with echo cancellation
  const micTrack = await LivekitClient.createLocalAudioTrack({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });

  // Publish the track with explicit source
  await room.localParticipant.publishTrack(micTrack, {
    source: LivekitClient.Track.Source.Microphone,
    name: 'microphone',
  });

  return micTrack;
}

/**
 * Format a transcript entry for display
 *
 * @param {string} speaker - 'user' or 'agent'
 * @param {string} text - The transcribed text
 * @returns {object} Formatted entry with timestamp
 */
export function formatTranscriptEntry(speaker, text) {
  return {
    speaker,
    text,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Create transcript HTML element
 *
 * @param {object} entry - Transcript entry from formatTranscriptEntry
 * @returns {string} HTML string for the entry
 */
export function createTranscriptHTML(entry) {
  const speakerClass = entry.speaker === 'user' ? 'transcript-user' : 'transcript-agent';
  const speakerLabel = entry.speaker === 'user' ? 'You' : 'Agent';
  return `
    <div class="transcript-entry ${speakerClass}">
      <div class="transcript-meta">
        <span class="transcript-speaker">${speakerLabel}</span>
        <span class="transcript-time">${entry.timestamp}</span>
      </div>
      <div class="transcript-text">${entry.text}</div>
    </div>
  `;
}

/**
 * Add transcript entry to display
 *
 * @param {HTMLElement} container - Transcript container element
 * @param {object} entry - Transcript entry
 */
export function addTranscriptEntry(container, entry) {
  const html = createTranscriptHTML(entry);
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const element = temp.firstElementChild;
  container.appendChild(element);

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/**
 * Data channel message handler
 *
 * Data Flow: Agent → LiveKit Data Channel → Frontend
 * Use for low-latency structured messages (faster than database polling)
 *
 * Example agent code:
 *   await room.local_participant.publish_data(
 *     json.dumps({"type": "status", "data": "..."}).encode(),
 *     reliable=True
 *   )
 *
 * @param {Uint8Array} payload - Raw data from LiveKit
 * @param {RemoteParticipant} participant - Sender
 * @returns {object|null} Parsed message or null if invalid
 */
export function handleDataChannelMessage(payload, participant) {
  try {
    const decoder = new TextDecoder();
    const message = decoder.decode(payload);
    const data = JSON.parse(message);
    return data;
  } catch (err) {
    console.error('Failed to parse data channel message:', err);
    return null;
  }
}

/**
 * VoiceManager - Complete voice interface manager for LiveKit agents
 *
 * Handles all voice functionality:
 * - SDK loading
 * - Availability checking
 * - Room connection/disconnection
 * - Event handling
 * - UI callbacks
 */
export class VoiceManager {
  constructor(options = {}) {
    this.room = null;
    this.isConnected = false;
    this.remoteAudioElement = null;
    this.supabaseUrl = options.supabaseUrl || window.SUPABASE_URL;

    // Callback functions for UI updates
    this.onStatusUpdate = options.onStatusUpdate || (() => {});
    this.onConnectionChange = options.onConnectionChange || (() => {});
    this.onTranscript = options.onTranscript || (() => {});
    this.onDataMessage = options.onDataMessage || (() => {});
  }

  /**
   * Check if voice features are available
   * @param {string} userEmail - Current user email
   * @returns {Promise<{available: boolean, configured: boolean}>}
   */
  async checkAvailability(userEmail) {
    if (!userEmail) {
      return { available: false, configured: false };
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/livekit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail }),
      });

      if (response.status === 501) {
        return { available: false, configured: false };
      }

      return { available: response.ok, configured: true };
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return { available: false, configured: false };
    }
  }

  /**
   * Load LiveKit SDK if not already loaded
   * @returns {Promise<void>}
   */
  async loadSDK() {
    if (window.LivekitClient) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load LiveKit SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Connect to voice room
   * @param {string} userEmail - Current user email
   * @param {HTMLElement} audioContainer - Container for remote audio elements
   * @returns {Promise<void>}
   */
  async connect(userEmail, audioContainer) {
    if (this.isConnected) {
      throw new Error('Already connected');
    }

    this.onStatusUpdate('Connecting...');

    // Check SDK
    if (!window.LivekitClient) {
      throw new Error('LiveKit SDK not loaded');
    }

    if (!userEmail) {
      throw new Error('User not logged in');
    }

    // Get access token
    const tokenResponse = await fetch(`${this.supabaseUrl}/functions/v1/livekit-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error || 'Failed to get token');
    }

    const { token, url } = await tokenResponse.json();

    // Create and configure room
    this.room = new window.LivekitClient.Room();
    this._setupEventListeners(audioContainer);

    // Connect to room
    await this.room.connect(url, token);

    // Enable audio playback
    try {
      await this.room.startAudio();
    } catch (err) {
      console.warn('Audio playback requires user interaction:', err);
    }

    // Wait for room initialization
    await new Promise(resolve => setTimeout(resolve, 500));

    // Attach any already-subscribed audio tracks
    this._attachExistingAudioTracks(audioContainer);

    // Publish microphone
    await publishMicrophoneTrack(this.room, window.LivekitClient);

    // Update state
    this.isConnected = true;
    this.onConnectionChange(true);
    this.onStatusUpdate('Connected - Speak now');
  }

  /**
   * Disconnect from voice room
   * @returns {Promise<void>}
   */
  async disconnect() {
    this.onStatusUpdate('Disconnecting...');

    if (this.room) {
      if (this.remoteAudioElement) {
        this.remoteAudioElement.remove();
        this.remoteAudioElement = null;
      }
      await this.room.disconnect();
      this.room = null;
    }

    this.isConnected = false;
    this.onConnectionChange(false);
    this.onStatusUpdate('Disconnected');
  }

  /**
   * Toggle connection state
   * @param {string} userEmail - Current user email
   * @param {HTMLElement} audioContainer - Container for remote audio elements
   * @returns {Promise<void>}
   */
  async toggle(userEmail, audioContainer) {
    if (this.isConnected) {
      await this.disconnect();
    } else {
      await this.connect(userEmail, audioContainer);
    }
  }

  /**
   * Setup room event listeners
   * @private
   */
  _setupEventListeners(audioContainer) {
    const { RoomEvent, RemoteParticipant } = window.LivekitClient;

    // Handle disconnection
    this.room.on(RoomEvent.Disconnected, () => {
      this.isConnected = false;
      this.onConnectionChange(false);
      this.onStatusUpdate('Disconnected');
      if (this.remoteAudioElement) {
        this.remoteAudioElement.remove();
        this.remoteAudioElement = null;
      }
    });

    // Handle audio tracks
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'audio' && participant instanceof RemoteParticipant) {
        this._attachAudioTrack(track, audioContainer);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === 'audio') {
        track.detach();
        if (this.remoteAudioElement) {
          this.remoteAudioElement.remove();
          this.remoteAudioElement = null;
        }
      }
    });

    // Handle data channel messages
    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      const data = handleDataChannelMessage(payload, participant);

      if (data) {
        console.log('📥 Data channel message:', data);

        if (data.type === 'transcript') {
          this.onTranscript(data.speaker, data.text);
        } else {
          this.onDataMessage(data);
        }
      }
    });
  }

  /**
   * Attach audio track to DOM
   * @private
   */
  _attachAudioTrack(track, container) {
    const audioElement = track.attach();
    audioElement.autoplay = true;

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

  /**
   * Attach existing audio tracks (for late joins)
   * @private
   */
  _attachExistingAudioTracks(container) {
    this.room.remoteParticipants.forEach((participant) => {
      if (!participant?.audioTracks) return;

      participant.audioTracks.forEach((publication) => {
        const track = publication?.track;
        if (track) {
          this._attachAudioTrack(track, container);
        }
      });
    });
  }
}
