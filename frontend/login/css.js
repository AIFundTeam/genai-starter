// Login page styles using Shadow DOM
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

  /* Main Content */
  main {
    min-height: calc(100vh - 120px);
    padding: 2rem 0;
  }

  /* Auth Container */
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .auth-card {
    background-color: var(--surface);
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 400px;
  }

  .auth-card h2 {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .auth-card p {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .auth-footer {
    margin-top: 1.5rem;
    text-align: center;
  }

  .auth-footer p {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  /* Forms */
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input[type="text"],
  .form-group input[type="email"],
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-group input:disabled {
    background-color: var(--background);
    cursor: not-allowed;
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

  .btn-block {
    width: 100%;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Footer */
  footer {
    background-color: var(--surface);
    border-top: 1px solid var(--border-color);
    padding: 1rem 0;
    margin-top: auto;
  }

  footer .container {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .auth-card {
      margin: 1rem;
    }
  }
`;