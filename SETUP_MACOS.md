# macOS Setup Guide

This guide helps you set up all required tools on a fresh macOS installation.

## Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the instructions to add Homebrew to your PATH.

### 2. Install Required Tools

```bash
# Install Node.js (includes npm)
brew install node

# Install Supabase CLI
brew install supabase/tap/supabase

# Install Cloudflare Wrangler
npm install -g wrangler

# Install Git (if not already installed)
brew install git
```

### 3. Verify Installations

```bash
# Check Node.js
node --version  # Should show v18 or higher

# Check npm
npm --version

# Check Supabase CLI
supabase --version

# Check Wrangler
wrangler --version

# Check Git
git --version
```

## Common Issues and Solutions

### Homebrew Path Issues
If commands aren't found after installation, add Homebrew to your PATH:

**For Apple Silicon Macs (M1/M2/M3):**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

**For Intel Macs:**
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Permission Issues with npm
If you get permission errors with npm global installs:
```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Wrangler Login Issues
If `wrangler login` opens the wrong browser or doesn't work:
```bash
# Use API token instead
wrangler login --api-key
# Then enter your Cloudflare API token
```

## Next Steps

Once all tools are installed:

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. Copy and configure environment:
   ```bash
   cp env.config.template env.config
   # Edit env.config with your credentials
   ```

3. Set up the environment:
   ```bash
   source setup-env.sh
   ```

4. Continue with the deployment steps in README.md

## Alternative Installation Methods

If you prefer not to use Homebrew:

### Node.js
- Download from: https://nodejs.org/
- Choose the LTS version

### Supabase CLI
```bash
# Using npm (after installing Node.js)
npm install -g supabase
```

### Manual Downloads
- Git: https://git-scm.com/download/mac
- All tools have manual installation options on their respective websites