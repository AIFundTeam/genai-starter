// Test page styles using Shadow DOM
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

  /* Test Results */
  .test-results {
    margin-top: 2rem;
  }

  /* Test Setup Styles */
  .test-setup {
    background: var(--surface);
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
    border: 1px solid var(--border-color);
  }

  .test-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .test-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .test-card h4 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
  }

  .test-card p {
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }

  .test-card button {
    margin-top: 0.5rem;
    width: 100%;
  }

  .llm-test {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .llm-test input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }

  .test-success {
    background: #10b981;
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
    text-align: center;
    display: none;
  }

  .test-success h4 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  .claude-code-guide {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: left;
  }

  .claude-code-guide code {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    display: inline-block;
    margin: 0.25rem 0;
  }

  .claude-code-guide ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .claude-code-guide li {
    margin: 0.5rem 0;
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

  /* Alerts */
  .alert {
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }

  .alert-success {
    background-color: #dcfce7;
    color: #14532d;
    border: 1px solid #86efac;
  }

  .alert-error {
    background-color: #fee2e2;
    color: #7f1d1d;
    border: 1px solid #fca5a5;
  }

  .alert-info {
    background-color: #dbeafe;
    color: #1e3a8a;
    border: 1px solid #93c5fd;
  }

  /* Test Card Elements */
  .test-note {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .welcome-section h2 {
      font-size: 2rem;
    }
    
    .welcome-section p {
      font-size: 1.125rem;
    }
    
    .test-grid {
      grid-template-columns: 1fr;
    }
  }
`;