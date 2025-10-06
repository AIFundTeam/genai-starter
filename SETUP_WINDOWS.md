# Windows Setup Guide

This guide helps you set up all required tools on Windows for development with Claude Code. Don't worry if you're new to coding - we'll walk through each step together! 🎯

## Before You Start
- **Time needed**: About 15 minutes
- **What we're doing**: Setting up Git Bash for Claude Code (simple and fast!)
- **Tip**: Keep this guide open on your phone or another screen

## Step 1: Install Git for Windows

### What is Git for Windows?
Git for Windows includes Git Bash, which gives you a Unix-like terminal on Windows. This is perfect for running Claude Code and development tools.

### Download and Install Git for Windows
1. **Download Git for Windows**
   - Go to [git-scm.com/downloads/win](https://git-scm.com/downloads/win)
   - Click "Download for Windows"
   - The download will start automatically

2. **Run the Installer**
   - Find the downloaded file (usually in your Downloads folder)
   - Double-click to run it
   - If Windows asks "Do you want to allow this app to make changes?", click "Yes"

3. **Installation Options**
   - **Important**: Use the default settings for everything
   - Just keep clicking "Next" through all the screens
   - The defaults are perfect for Claude Code!
   - Click "Install" when you reach the final screen
   - This will take 2-3 minutes

4. **Verify Installation**
   - After installation completes, click "Finish"
   - You should see "Git Bash" in your Start menu

## Step 2: Set Up Git Bash Path (If Needed)

Most users won't need this step, but if you have a portable Git installation or Claude Code can't find Git Bash:

1. **Open PowerShell**
   - Press `Windows + R`
   - Type `powershell` and press Enter

2. **Set the Git Bash Path**
   - Copy and paste this command:
   ```powershell
   $env:CLAUDE_CODE_GIT_BASH_PATH="C:\Program Files\Git\bin\bash.exe"
   ```
   - Press Enter

## Step 3: Install Required Tools

Now we'll install the coding tools using Git Bash. 

### Open Git Bash
1. Click the Start button (Windows logo)
2. Type `git bash`
3. Click on "Git Bash" when it appears
4. You'll see a black window with a command prompt

**📌 Important**: Use Git Bash (not PowerShell or Command Prompt) for all the following steps!

### Install Node.js
We'll use the Windows installer for Node.js:

1. **Download Node.js**
   - Go to [nodejs.org](https://nodejs.org)
   - Click "Download Node.js (LTS)" - this gets the stable version
   - Run the downloaded installer
   - Use all default settings (just click "Next" through everything)

2. **Verify Node.js Installation**
   - Close and reopen Git Bash (important!)
   - Type this command:
   ```bash
   node --version
   ```
   - You should see something like `v20.x.x` or higher

### Install Deno
Deno is the runtime for Edge Functions and testing:

```bash
# Install Deno using PowerShell (open PowerShell and run this)
irm https://deno.land/install.ps1 | iex
```

After installation:
1. Close PowerShell
2. Close and reopen Git Bash
3. Verify Deno installed:
```bash
deno --version
```

### Install Supabase CLI
Supabase helps manage your app's data:

```bash
npm install -g supabase
```

### Install Cloudflare Wrangler
This tool helps put your website on the internet:

```bash
npm install -g wrangler
```

## Step 4: Verify Everything Works

Let's check that all tools installed correctly. Copy and paste each command in Git Bash:

```bash
node --version
```
✅ You should see something like `v20.x.x` or higher

```bash
npm --version
```
✅ You should see a version number like `10.x.x` or higher

```bash
deno --version
```
✅ You should see Deno version info

```bash
supabase --version
```
✅ You should see a version number (any number is fine!)

```bash
wrangler --version
```
✅ You should see a version number starting with `3.` or `4.`

```bash
git --version
```
✅ You should see `git version 2.x.x`

**Having issues?** If any command shows "command not found", try:
1. Close Git Bash
2. Open it again
3. Try the command again

If it still doesn't work, that's okay! Claude Code can help you troubleshoot.

## Step 5: Ready for Claude Code!

Now that you have Git Bash set up, you're ready to use Claude Code - Anthropic's AI coding assistant that runs right in your terminal!

**What's Claude Code?**
- It's an AI assistant that helps you write code
- It runs in your Git Bash terminal
- It can create entire applications, fix bugs, and explain code
- Learn more at [anthropic.com/claude-code](https://www.anthropic.com/claude-code)

**Next Steps:**
1. Make sure you're in Git Bash
2. Navigate to where you want to create your project:
   ```bash
   cd ~  # This goes to your home folder
   mkdir my-projects  # Creates a folder for your projects
   cd my-projects     # Enters that folder
   ```
3. Now you can use Claude Code to build your app!

💡 **Pro tip**: Claude Code works best when you describe what you want to build clearly. For example: "Help me create a todo list app" or "Build a simple website for my bakery"

## Troubleshooting

### Common Issues and Solutions

#### ❌ "Command not found" errors
**What to check:**
- Make sure you're in Git Bash (black window), NOT PowerShell (blue window) or Command Prompt
- The Git Bash prompt looks like: `MINGW64 /c/Users/YourName`
- Close and reopen Git Bash after installing Node.js

#### ❌ Git Bash won't open
**Solution:**
- Search for "Git Bash" in the Start menu
- If you can't find it, reinstall Git for Windows
- Make sure you didn't skip the installation

#### ❌ Node.js commands don't work
**Solution:**
- Make sure you installed Node.js from nodejs.org
- Close and reopen Git Bash after installing Node.js
- Try running the installer again if needed

#### ❌ Claude Code can't find Git Bash
**Solution:**
- Set the environment variable in PowerShell:
  ```powershell
  $env:CLAUDE_CODE_GIT_BASH_PATH="C:\Program Files\Git\bin\bash.exe"
  ```
- If Git is installed elsewhere, adjust the path accordingly

### Getting More Help

**🚀 The best way to get help:**
1. Copy the exact error message you see
2. Ask Claude Code: "I got this error while setting up Windows: [paste your error]"
3. Claude Code can provide specific solutions for your exact problem!

**Alternative help options:**
- Search your error message on Google
- Git for Windows documentation: [git-scm.com/doc](https://git-scm.com/doc)

## Next Steps

### 🎉 Congratulations!
You've successfully set up your Windows computer for development! Here's what you accomplished:
- ✅ Installed Git for Windows with Git Bash
- ✅ Installed Node.js and npm
- ✅ Installed development tools (Supabase CLI, Wrangler)
- ✅ Got everything ready for Claude Code

### 📍 What's Next?
Now you're ready to build your app! Continue with the [Quick Start guide in README.md](./README.md#quick-start)

### 🔑 Key Things to Remember:
1. **Always use Git Bash** for running commands (not PowerShell or Command Prompt)
2. **Claude Code runs in your terminal** - no need for a separate editor
3. **Git Bash is your friend** - it's where all the magic happens

### 💪 You Did It!
Setting up a development environment is often the hardest part - and you just completed it! From here on, Claude Code will help you build amazing things.

**Happy coding!** 🚀