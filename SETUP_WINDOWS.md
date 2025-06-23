# Windows Setup Guide

This guide helps you set up all required tools on Windows for development with Claude Code. Don't worry if you're new to coding - we'll walk through each step together! 🎯

## Before You Start
- **Time needed**: About 30 minutes
- **What we're doing**: Setting up Linux tools on Windows (this makes coding easier!)
- **Tip**: Keep this guide open on your phone or another screen

## Step 1: Install WSL (Windows Subsystem for Linux)

### What is WSL?
Think of WSL as a special app that lets Windows run Linux programs. It's like having two computers in one! Most coding tools work better with Linux, so this makes your life easier.

### Enable WSL
1. **Open PowerShell as Administrator**
   - Click the Start button (Windows logo)
   - Type `powershell`
   - You'll see "Windows PowerShell" appear - RIGHT-CLICK on it
   - Click "Run as administrator"
   - If Windows asks "Do you want to allow this app to make changes?", click "Yes"

2. **Install WSL**
   - Copy and paste this command exactly:
   ```powershell
   wsl --install
   ```
   - Press Enter
   - You'll see text scrolling by - this is normal! It's downloading Ubuntu Linux
   - This might take 5-10 minutes depending on your internet speed

3. **Restart your computer**
   - Save any open work first!
   - When WSL finishes installing, it will ask you to restart
   - Click "Restart now" or restart manually

4. **Set up Ubuntu (After Restart)**
   - Ubuntu will open automatically (black window with white text)
   - If it doesn't open, search "Ubuntu" in the Start menu and click it
   - It will ask you to create a username:
     - Type a simple username (lowercase letters only, no spaces)
     - Good examples: `john`, `mary`, `dev`
     - Press Enter
   - It will ask for a password:
     - **IMPORTANT**: When you type your password, nothing will appear on screen - not even dots!
     - This is a security feature - just type your password and press Enter
     - Type it again when asked
   - Write down your username and password somewhere safe!

## Step 2: Install Required Tools (in WSL)

Now we'll install the coding tools. Don't worry about understanding what each tool does - just follow along!

**📌 Important**: Make sure you're in the Ubuntu window (black background) for all these steps, NOT PowerShell!

### First, Update Ubuntu
This makes sure Ubuntu has the latest security updates:
```bash
sudo apt update && sudo apt upgrade -y
```
- When you type `sudo`, it will ask for your password
- Remember: nothing appears when you type your password!
- This might take a few minutes

### Install Node.js (JavaScript Tool)
We'll use the easier method that works best in 2024:

```bash
# First, install Node.js from Ubuntu's repository
sudo apt install nodejs npm -y
```

This installs an older but stable version of Node.js, which is perfect for getting started.

### Install Supabase CLI (Database Tool)
Supabase helps manage your app's data. Let's install it:

```bash
# Install using npm (now that we have Node.js)
npm install -g supabase
```

If you see warnings about permissions, that's okay - the tool should still work!

### Install Cloudflare Wrangler (Website Publishing Tool)
This tool helps put your website on the internet:

```bash
npm install -g wrangler
```

### Install Git (Code History Tool)
Git helps you save your work and collaborate:
```bash
sudo apt install git -y
```

## Step 3: Verify Everything Works

Let's check that all tools installed correctly. Copy and paste each command:

```bash
node --version
```
✅ You should see something like `v18.x.x` or higher

```bash
npm --version
```
✅ You should see a version number like `9.x.x` or higher

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
1. Close the Ubuntu window
2. Open it again
3. Try the command again

If it still doesn't work, that's okay! Claude Code can help you troubleshoot.

## Step 4: Working with Your Files

### Understanding File Locations
When using WSL, you have two places to store files:

1. **Linux Home Folder** (Recommended) ✅
   - Location: `/home/yourusername/`
   - This is where you should work on your code
   - It's faster and more reliable

2. **Windows Files** (If needed)
   - Location: `/mnt/c/Users/YourWindowsUsername/`
   - Use this to access files from your Windows desktop or documents

### Ready for Claude Code!

Now that you have WSL set up, you're ready to use Claude Code - Anthropic's AI coding assistant that runs right in your terminal!

**What's Claude Code?**
- It's an AI assistant that helps you write code
- It runs in your Ubuntu terminal
- It can create entire applications, fix bugs, and explain code
- Learn more at [anthropic.com/claude-code](https://www.anthropic.com/claude-code)

**Next Steps:**
1. Make sure you're in the Ubuntu terminal
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

#### ❌ "wsl --install" doesn't work
**Solution:**
1. Make sure you're running PowerShell as Administrator (right-click → Run as administrator)
2. Check your Windows version:
   - Press `Windows + R`
   - Type `winver` and press Enter
   - You need Windows 10 version 2004 or higher, or Windows 11
3. If you have an older Windows version, you'll need to update Windows first

#### ❌ Ubuntu doesn't open after restart
**Solution:**
- Click the Start button and search for "Ubuntu"
- Click on the Ubuntu app when it appears
- If that doesn't work, open PowerShell and type `wsl`

#### ❌ "Command not found" errors
**What to check:**
- Make sure you're in Ubuntu (black window), NOT PowerShell (blue window)
- The Ubuntu prompt looks like: `yourname@computer:~$`
- The PowerShell prompt looks like: `PS C:\>`

#### ❌ Password not working
**Remember:**
- When typing your password in Ubuntu, nothing appears on screen (not even dots!)
- Just type your password carefully and press Enter
- If you forgot your password, you'll need to reset WSL (ask Claude Code for help)

#### ❌ Permission denied errors
**Solution:**
- Add `sudo` before the command
- Example: If `apt update` fails, try `sudo apt update`
- It will ask for your password

### Getting More Help

**🚀 The best way to get help:**
1. Copy the exact error message you see
2. Ask Claude Code: "I got this error while setting up Windows: [paste your error]"
3. Claude Code can provide specific solutions for your exact problem!

**Alternative help options:**
- Search your error message on Google (often someone else had the same issue!)
- The friendly folks at [r/bashonubuntuonwindows](https://reddit.com/r/bashonubuntuonwindows) on Reddit
- Microsoft's official [WSL documentation](https://docs.microsoft.com/windows/wsl/)

## Next Steps

### 🎉 Congratulations!
You've successfully set up your Windows computer for development! Here's what you accomplished:
- ✅ Installed WSL (Linux on Windows)
- ✅ Set up Ubuntu with your own username and password
- ✅ Installed all the development tools
- ✅ Got VS Code ready for coding

### 📍 What's Next?
Now you're ready to build your app! Continue with the [Quick Start guide in README.md](./README.md#quick-start)

### 🔑 Key Things to Remember:
1. **Always use Ubuntu terminal** for running commands (not PowerShell)
2. **Your password is invisible** when typing in Ubuntu (security feature)
3. **Claude Code runs in your terminal** - no need for a separate editor
4. **Keep your username and password** written down somewhere safe

### 💪 You Did It!
Setting up a development environment is often the hardest part - and you just completed it! From here on, Claude Code will help you build amazing things.

**Happy coding!** 🚀