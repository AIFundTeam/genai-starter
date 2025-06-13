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


**💡 Having issues?** Ask ChatGPT or Claude with your specific error message - they're much better at troubleshooting than static docs!

## Next Steps

✅ **Tools installed!** Continue with the [Quick Start guide in README.md](./README.md#quick-start)