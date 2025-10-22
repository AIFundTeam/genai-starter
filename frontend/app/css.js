// Main app page styles using Shadow DOM
export const styles = `
  /* Reset and Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :host {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    --secondary-color: #64748b;
    --secondary-hover: #475569;
    --danger-color: #dc2626;
    --danger-hover: #b91c1c;
    --success-color: #16a34a;
    --background: #f8fafc;
    --surface: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--background);
    display: block;
    min-height: 100vh;
  }

  /* Layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Header */
  header {
    background-color: var(--surface);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow);
  }

  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 20px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
  }

  header nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .user-info strong {
    color: var(--text-primary);
  }

  /* Main Content */
  main {
    min-height: calc(100vh - 120px);
    padding: 2rem 0;
  }

  /* Welcome Section */
  .welcome-section {
    text-align: center;
    padding: 3rem 0;
    max-width: 600px;
    margin: 0 auto;
  }

  .welcome-section h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .welcome-section p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  /* Feature Cards */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .feature-card {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
  }

  .feature-card h4 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
    font-size: 1.125rem;
  }

  .feature-card p {
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }

  /* Status Grid */
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .status-card {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 8px;
    border: 2px solid var(--border-color);
    box-shadow: var(--shadow);
    transition: all 0.2s;
  }

  .status-card:hover {
    box-shadow: var(--shadow-lg);
  }

  .status-card.status-enabled {
    border-color: #10b981;
    background: linear-gradient(to bottom, #f0fdf4 0%, var(--surface) 20%);
  }

  .status-card.status-disabled {
    border-color: #cbd5e1;
    background: linear-gradient(to bottom, #f8fafc 0%, var(--surface) 20%);
    opacity: 0.85;
  }

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }

  .status-header h4 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--text-primary);
    flex: 1;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    white-space: nowrap;
  }

  .status-badge.enabled {
    background-color: #d1fae5;
    color: #065f46;
  }

  .status-badge.disabled {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .status-card > p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .status-details {
    margin: 0;
    padding-left: 1.25rem;
    list-style: disc;
  }

  .status-details li {
    color: var(--text-secondary);
    margin: 0.375rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .status-details code {
    background: var(--background);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.8125rem;
  }

  /* Buttons */
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--primary-hover);
  }

  .btn-secondary {
    background-color: var(--secondary-color);
    color: white;
  }

  .btn-secondary:hover {
    background-color: var(--secondary-hover);
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Getting Started */
  .getting-started {
    background: var(--surface);
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
    border: 1px solid var(--border-color);
  }

  .getting-started h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .getting-started code {
    background: var(--background);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    display: inline-block;
    margin: 0.25rem 0;
    font-size: 0.875rem;
  }

  .getting-started ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .getting-started li {
    margin: 0.5rem 0;
  }

  /* Voice Interface */
  .voice-section {
    background: var(--surface);
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
    border: 1px solid var(--border-color);
  }

  .voice-section h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .voice-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .voice-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    background-color: var(--primary-color);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: var(--shadow-lg);
  }

  .voice-button:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: scale(1.05);
  }

  .voice-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .voice-button.connected {
    background-color: var(--danger-color);
    animation: pulse 2s infinite;
  }

  .voice-button.connected:hover {
    background-color: var(--danger-hover);
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
    }
  }

  .voice-status {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
    min-height: 20px;
  }

  .voice-status.connected {
    color: var(--success-color);
    font-weight: 500;
  }

  .voice-status.error {
    color: var(--danger-color);
  }

  .voice-info {
    background: var(--background);
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .voice-info p {
    margin: 0.5rem 0;
  }

  .voice-info a {
    color: var(--primary-color);
    text-decoration: none;
  }

  .voice-info a:hover {
    text-decoration: underline;
  }

  /* Transcript Styles */
  .transcript-container {
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-top: 1.5rem;
    overflow: hidden;
  }

  .transcript-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--background);
  }

  .transcript-header h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
  }

  .transcript-log {
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .transcript-entry {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }

  .transcript-user {
    background: #eff6ff;
    border-left: 3px solid var(--primary-color);
  }

  .transcript-agent {
    background: #f1f5f9;
    border-left: 3px solid var(--secondary-color);
  }

  .transcript-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }

  .transcript-speaker {
    font-weight: 600;
    color: var(--text-primary);
  }

  .transcript-time {
    color: var(--text-secondary);
  }

  .transcript-text {
    color: var(--text-primary);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .welcome-section h2 {
      font-size: 2rem;
    }

    .welcome-section p {
      font-size: 1.125rem;
    }

    .features-grid,
    .status-grid {
      grid-template-columns: 1fr;
    }

    .status-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
`;