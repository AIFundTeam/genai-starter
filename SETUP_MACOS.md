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

# Install Deno (runtime for Edge Functions and testing)
curl -fsSL https://deno.land/install.sh | sh

# Add Deno to PATH (add this line to ~/.zshrc or ~/.bashrc)
export PATH="$HOME/.deno/bin:$PATH"

# Reload shell configuration
source ~/.zshrc  # or source ~/.bashrc if using bash

# Install Supabase CLI
brew install supabase/tap/supabase

# Install Cloudflare Wrangler
npm install -g wrangler

# Install Git (if not already installed)
brew install git

# Install LiveKit CLI (optional - for voice features)
brew install livekit
```


**💡 Having issues?** Ask ChatGPT or Claude with your specific error message - they're much better at troubleshooting than static docs!

## Next Steps

✅ **Tools installed!** Continue with the [Quick Start guide in README.md](./README.md#quick-start)