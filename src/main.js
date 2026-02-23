import plugin from '../plugin.json';

const NGROK_BIN = '$HOME/bin/ngrok';

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
    terminal = acode.require("terminal")
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
      
      const term = await terminal.create({name: "Install Ngrok"})
      await terminal.write(term.id, "(rm ../usr/bin/ngrok && cd || cd )&& apk update && apk upgrade  && apk add wget && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz -O ngrok.tgz &&  tar xvzf ngrok.tgz && rm ngrok.tgz && cd && mv ngrok ../usr/bin \r\n")
      await terminal.write(term.id, "mv ngrok ../usr/bin \r\n")
      alert("Ngrok installing.")
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
      const term = await terminal.create({name: "Run Ngrok"})
      await terminal.write(term.id,`ngrok http ${port} \r\n`)
      alert('Success', 'Ngrok running succesfully.');
      
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async checkVersion() {
    try {
      const term = await terminal.create({name: "Check Version"})
      await terminal.write(term.id,`ngrok version \r\n`)
      
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
      const term = await terminal.create({name: "Configure Ngrok"})
      await terminal.write(term.id,`ngrok config add-authtoken ${token} \r\n`)
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
      const term = await terminal.create({name: "Uninstall Ngrok"})
      await terminal.write(term.id, 'cd && rm  ../usr/bin/ngrok \r\n')
      alert('Success', 'Ngrok has been uninstalled.');
    } catch (error) {
      alert('Error', String(error) || 'Failed to uninstall ngrok');
    }
  }

  async destroy() {
    const term = await terminal.create({name: "Uninstall Ngrok"})
    await terminal.write(term.id, 'cd && rm  ../usr/bin/ngrok \r\n')
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
