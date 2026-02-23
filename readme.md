# Ngrok Installer for Acode

A plugin to install and manage [ngrok](https://ngrok.com) on Acode mobile editor.

## Features

- One-click ngrok installation
- Run ngrok HTTP tunnels
- Configure authtoken
- Check ngrok version
- Uninstall ngrok

## Requirements

- Acode editor (v290+)
- Acode's built-in terminal (Alpine Linux environment)

## Installation

### Option 1: Download Pre-built Plugin

1. Download `dist.zip` from the [releases](https://github.com/RightFix/ngrok-acode-plugin/releases) or repository
2. Open Acode
3. Go to **Settings > Plugins**
4. Click the **+** icon
5. Select **LOCAL** and choose the downloaded `dist.zip` file

### Option 2: Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/RightFix/ngrok-acode-plugin.git
   cd ngrok-acode-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. The `dist.zip` file will be created in the project directory

5. Transfer `dist.zip` to your phone and install in Acode

## Usage

After installation, access the plugin via:

1. **Command Palette** (Ctrl+Shift+P) - Search for "ngrok"

2. **Commands available:**
   - `Ngrok: Install` - Downloads and installs ngrok for ARM64
   - `Ngrok: Run Tunnel` - Starts an HTTP tunnel (prompts for port)
   - `Ngrok: Check Version` - Shows installed ngrok version
   - `Ngrok: Configure Authtoken` - Sets your ngrok authtoken
   - `Ngrok: Uninstall` - Removes ngrok from your device
   - `Ngrok: Show Menu` - Opens interactive menu with all options

## Getting Started

1. Install ngrok using the **"Ngrok: Install"** command
2. Get your authtoken from [ngrok.com dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Configure using **"Ngrok: Configure Authtoken"**
4. Run a tunnel: **"Ngrok: Run Tunnel"** and enter your port (e.g., 8080)

## Architecture Support

This plugin installs the ARM64 version of ngrok, which is compatible with most Android devices.

## Troubleshooting

- If installation fails, ensure you have an active internet connection
- Make sure Acode's terminal is properly configured
- Try running `apk update` in the terminal before installing
- Check the terminal output for any error messages

## Development

### Project Structure

```
ngrok-acode/
├── src/
│   └── main.js       # Plugin source code
├── plugin.json       # Plugin configuration
├── package.json      # NPM dependencies
├── esbuild.config.mjs # Build configuration
├── icon.png          # Plugin icon
├── readme.md         # Documentation
└── dist.zip          # Built plugin (for distribution)
```

### Build Commands

- `npm run build` - Build the plugin and create dist.zip
- `npm run dev` - Development mode with file watching

## Credits

- Original concept: [JesusChapman](https://github.com/JesusChapman)
- Plugin developed for [Acode](https://acode.app)

## License

MIT
