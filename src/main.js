import plugin from '../plugin.json';

let alert, prompt, confirm, select, terminal;

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
    terminal = acode.require('terminal');

    this.registerCommands();
  }

  registerCommands() {
    const self = this;
    const commands = [
      {
        name: 'ngrok-install',
        description: 'Ngrok: Install',
        exec: () => self.installNgrok(),
      },
      {
        name: 'ngrok-run',
        description: 'Ngrok: Run Tunnel',
        exec: () => self.runNgrok(),
      },
      {
        name: 'ngrok-version',
        description: 'Ngrok: Check Version',
        exec: () => self.checkVersion(),
      },
      {
        name: 'ngrok-config',
        description: 'Ngrok: Configure Authtoken',
        exec: () => self.configureNgrok(),
      },
      {
        name: 'ngrok-uninstall',
        description: 'Ngrok: Uninstall',
        exec: () => self.uninstallNgrok(),
      },
      {
        name: 'ngrok-menu',
        description: 'Ngrok: Show Menu',
        exec: () => self.showNgrokMenu(),
      },
    ];

    if (editorManager.isCodeMirror) {
      const cmds = acode.require('commands');
      commands.forEach(cmd => {
        cmds.add(cmd.name, cmd.description, cmd.exec);
      });
    } else {
      const { commands: editorCommands } = editorManager.editor;
      commands.forEach(cmd => {
        editorCommands.addCommand({
          name: cmd.name,
          description: cmd.description,
          exec: cmd.exec,
        });
      });
    }
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
      const term = await terminal.create({ name: 'Install Ngrok' });
      await terminal.write(term.id, 'rm -f /usr/bin/ngrok && apk update && apk add wget unzip && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip -O /tmp/ngrok.zip && unzip -o /tmp/ngrok.zip -d /tmp/ && rm /tmp/ngrok.zip && mv /tmp/ngrok /usr/bin/ngrok && chmod +x /usr/bin/ngrok && echo "Ngrok installed!"\n');
      alert('Installing ngrok...', 'Terminal opened. Wait for installation to complete.');
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async runNgrok() {
    let port;
    try {
      port = await prompt('Enter port number e.g 8000, 5500');
    } catch (e) {
      return;
    }
    
    if (!port) return;

    try {
      const term = await terminal.create({ name: 'Run Ngrok' });
      await terminal.write(term.id, `ngrok http ${port}\n`);
      alert('Success', 'Ngrok running.');
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async checkVersion() {
    try {
      const term = await terminal.create({ name: 'Check Version' });
      await terminal.write(term.id, 'ngrok version\n');
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
      const term = await terminal.create({ name: 'Configure Ngrok' });
      await terminal.write(term.id, `ngrok config add-authtoken ${token}\n`);
      alert('Authtoken configured successfully!');
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
      const term = await terminal.create({ name: 'Uninstall Ngrok' });
      await terminal.write(term.id, 'rm -f /usr/bin/ngrok && echo "Ngrok uninstalled"\n');
      alert('Success', 'Ngrok has been uninstalled.');
    } catch (error) {
      alert('Error', String(error) || 'Failed to uninstall ngrok');
    }
  }

  destroy() {
    const commandNames = [
      'ngrok-install',
      'ngrok-run',
      'ngrok-version',
      'ngrok-config',
      'ngrok-uninstall',
      'ngrok-menu',
    ];

    if (editorManager.isCodeMirror) {
      const cmds = acode.require('commands');
      commandNames.forEach(name => {
        cmds.remove(name);
      });
    } else {
      const { commands } = editorManager.editor;
      commandNames.forEach(name => {
        commands.removeCommand(name);
      });
    }
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
