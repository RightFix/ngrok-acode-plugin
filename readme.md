# Ngrok Installer for Acode

A plugin to install and manage [ngrok](https://ngrok.com) on Acode mobile editor.

## Features

- One-click ngrok installation
- Run ngrok http tunnels
- Configure authtoken
- Check ngrok version
- Uninstall ngrok

## Requirements

- Acode editor (v290+)
- Acode's built-in terminal (Alpine Linux environment)

## Installation

1. Download the plugin zip file
2. Open Acode
3. Go to Settings > Plugins
4. Click the '+' icon
5. Select "LOCAL" and choose the downloaded zip file

## Usage

After installation, access the plugin via:

1. **Command Palette** (Ctrl+Shift+P) - Search for "ngrok"
2. **Commands available:**
   - `Install ngrok` - Downloads and installs ngrok for ARM64
   - `Run ngrok http [port]` - Starts an HTTP tunnel
   - `Check version` - Shows installed ngrok version
   - `Configure authtoken` - Sets your ngrok authtoken
   - `Uninstall ngrok` - Removes ngrok from your device

## Getting Started

1. Install ngrok using the "Install ngrok" command
2. Get your authtoken from [ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Configure using "Configure authtoken"
4. Run a tunnel: `ngrok http 80`

## Architecture Support

This plugin installs the ARM64 version of ngrok, which is compatible with most Android devices.

## Troubleshooting

- If installation fails, ensure you have an active internet connection
- Make sure Acode's terminal is properly configured
- Try running `apk update` in the terminal before installing

## Credits

- Original concept: [JesusChapman](https://github.com/JesusChapman)
- Plugin developed for [Acode](https://acode.app)

## License

MIT
