import plugin from '../plugin.json';

const NGROK_BIN = '$HOME/bin/ngrok';

let alert, prompt, confirm, select;

class NgrokPlugin {
  baseUrl = '';

  async init($page, cacheFile, cacheFileUrl) {
    this.$page = $page;
    this.cacheFile = cacheFile;
    this.cacheFileUrl = cacheFileUrl;

    alert = acode.require('alert');
    prompt = acode.require('prompt');
    confirm = acode.require('confirm');
    select = acode.require('select');

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
      description: 'Ngrok: Run Tunnel',
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
      'Run ngrok',
      'Check version',
      'Configure authtoken',
      'Uninstall ngrok',
    ];

    try {
      const action = await select('Ngrok Menu', options);
      
      if (!action) return;

      switch (action) {
        case 'Install ngrok':
          await this.installNgrok();
          break;
        case 'Run ngrok':
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
    } catch (e) {
      console.error('Menu error:', e);
    }
  }

  async installNgrok() {
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (checkResult && checkResult.includes('ngrok')) {
        alert('Already Installed', 'Ngrok is already installed! Use "Check version" to verify.');
        return;
      }

      const terminal = acode.require('terminal');
      if (!terminal || !terminal.create) {
        alert('Error', 'Terminal not available');
        return;
      }

      const term = terminal.create();
      
      const installCmd = 'mkdir -p $HOME/bin && apk update && apk add wget unzip && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip -O /tmp/ngrok.zip && unzip -o /tmp/ngrok.zip -d /tmp/ && rm /tmp/ngrok.zip && mv /tmp/ngrok $HOME/bin/ngrok && chmod +x $HOME/bin/ngrok && export PATH=$HOME/bin:$PATH && echo "Ngrok installed to $HOME/bin/ngrok"';
      
      setTimeout(() => {
        terminal.write(term.id, installCmd + '\n');
      }, 1000);
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async runNgrok() {
    let port;
    try {
      port = await prompt('Enter port number');
    } catch (e) {
      return;
    }
    
    if (!port) return;

    try {
      const terminal = acode.require('terminal');
      if (!terminal || !terminal.create) {
        alert('Error', 'Terminal not available');
        return;
      }

      const term = terminal.create();
      
      setTimeout(() => {
        terminal.write(term.id, `export PATH=$HOME/bin:$PATH && ngrok ${port}\n`);
      }, 1000);
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async checkVersion() {
    try {
      const version = await Executor.execute('export PATH=$HOME/bin:$PATH && ngrok version', true);
      alert('Ngrok Version', version || 'Unable to get version');
    } catch (error) {
      alert('Error', String(error) || 'Failed to check version. Is ngrok installed?');
    }
  }

  async configureNgrok() {
    let token;
    try {
      token = await prompt('Enter your ngrok authtoken');
    } catch (e) {
      return;
    }
    
    if (!token) return;

    try {
      const result = await Executor.execute(`export PATH=$HOME/bin:$PATH && ngrok config add-authtoken ${token}`, true);
      alert('Configuration Result', result || 'Authtoken configured successfully!');
    } catch (error) {
      alert('Error', String(error) || 'Failed to configure authtoken');
    }
  }

  async uninstallNgrok() {
    let confirmed;
    try {
      confirmed = await confirm('Uninstall ngrok?', 'Are you sure you want to uninstall ngrok?');
    } catch (e) {
      return;
    }
    
    if (!confirmed) return;

    try {
      await Executor.execute('rm -f $HOME/bin/ngrok', true);
      alert('Success', 'Ngrok has been uninstalled.');
    } catch (error) {
      alert('Error', String(error) || 'Failed to uninstall ngrok');
    }
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
