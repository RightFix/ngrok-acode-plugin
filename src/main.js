import plugin from '../plugin.json';

const NGROK_URL = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip';
const NGROK_BIN = '/usr/local/bin/ngrok';
const TEMP_ZIP = '/tmp/ngrok.zip';

let alert, prompt, confirm, select;

class NgrokPlugin {
  baseUrl = '';
  terminal = null;

  async init($page, cacheFile, cacheFileUrl) {
    this.$page = $page;
    this.cacheFile = cacheFile;
    this.cacheFileUrl = cacheFileUrl;

    alert = acode.require('alert');
    prompt = acode.require('prompt');
    confirm = acode.require('confirm');
    select = acode.require('select');
    this.terminal = acode.require('terminal');

    this.registerCommands();
  }

  registerCommands() {
    const { commands } = editorManager.editor;

    commands.addCommand({
      name: 'ngrok-install',
      description: 'Ngrok: Install',
      exec: () => this.installNgrok(),
    });

    commands.addCommand({
      name: 'ngrok-run',
      description: 'Ngrok: Run HTTP Tunnel',
      exec: () => this.runNgrok(),
    });

    commands.addCommand({
      name: 'ngrok-version',
      description: 'Ngrok: Check Version',
      exec: () => this.checkVersion(),
    });

    commands.addCommand({
      name: 'ngrok-config',
      description: 'Ngrok: Configure Authtoken',
      exec: () => this.configureNgrok(),
    });

    commands.addCommand({
      name: 'ngrok-uninstall',
      description: 'Ngrok: Uninstall',
      exec: () => this.uninstallNgrok(),
    });

    commands.addCommand({
      name: 'ngrok-menu',
      description: 'Ngrok: Show Menu',
      exec: () => this.showNgrokMenu(),
    });
  }

  async showNgrokMenu() {
    const options = [
      'Install ngrok',
      'Run ngrok http',
      'Check version',
      'Configure authtoken',
      'Uninstall ngrok',
    ];

    const action = await select('Ngrok Menu', options);
    
    if (!action) return;

    switch (action) {
      case 'Install ngrok':
        await this.installNgrok();
        break;
      case 'Run ngrok http':
        await this.runNgrok();
        break;
      case 'Check version':
        await this.checkVersion();
        break;
      case 'Configure authtoken':
        await this.configureNgrok();
        break;
      case 'Uninstall ngrok':
        await this.uninstallNgrok();
        break;
    }
  }

  openTerminal() {
    if (!this.terminal) {
      this.terminal = acode.require('terminal');
    }
    return this.terminal.create();
  }

  async installNgrok() {
    const term = this.openTerminal();
    
    const installCmd = `echo "Installing ngrok..." && \
wget ${NGROK_URL} -O ${TEMP_ZIP} && \
unzip -o ${TEMP_ZIP} -d /tmp/ && \
mv /tmp/ngrok ${NGROK_BIN} && \
chmod +x ${NGROK_BIN} && \
rm ${TEMP_ZIP} && \
echo "Done! Ngrok installed to ${NGROK_BIN}" && \
ngrok version`;

    setTimeout(() => {
      this.terminal.write(term.id, installCmd + '\n');
    }, 800);
  }

  async runNgrok() {
    const port = await prompt('Enter port number');
    if (!port) return;

    const term = this.openTerminal();
    
    setTimeout(() => {
      this.terminal.write(term.id, `ngrok http ${port}\n`);
    }, 800);
  }

  async checkVersion() {
    const term = this.openTerminal();
    
    setTimeout(() => {
      this.terminal.write(term.id, 'ngrok version\n');
    }, 800);
  }

  async configureNgrok() {
    const token = await prompt('Enter your ngrok authtoken');
    if (!token) return;

    const term = this.openTerminal();
    
    setTimeout(() => {
      this.terminal.write(term.id, `ngrok config add-authtoken ${token}\n`);
    }, 800);
  }

  async uninstallNgrok() {
    const confirmed = await confirm('Uninstall ngrok?', 'Are you sure you want to uninstall ngrok?');
    if (!confirmed) return;

    const term = this.openTerminal();
    
    setTimeout(() => {
      this.terminal.write(term.id, `rm -f ${NGROK_BIN} && echo "Ngrok uninstalled"\n`);
    }, 800);
  }

  destroy() {
    const { commands } = editorManager.editor;
    commands.removeCommand('ngrok-install');
    commands.removeCommand('ngrok-run');
    commands.removeCommand('ngrok-version');
    commands.removeCommand('ngrok-config');
    commands.removeCommand('ngrok-uninstall');
    commands.removeCommand('ngrok-menu');
  }
}

if (window.acode) {
  const ngrokPlugin = new NgrokPlugin();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    ngrokPlugin.baseUrl = baseUrl;
    await ngrokPlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    ngrokPlugin.destroy();
  });
}
