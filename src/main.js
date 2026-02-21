import plugin from '../plugin.json';

const NGROK_URL = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip';
const NGROK_BIN = '/usr/local/bin/ngrok';
const TEMP_ZIP = '/tmp/ngrok.zip';

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

  async installNgrok() {    
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (checkResult && checkResult.includes('/ngrok')) {
        alert('Already Installed', 'Ngrok is already installed! Use "Check version" to verify.');
        return;
      }

      const loader = acode.loader('Installing ngrok...', 'Please wait');
      loader.show();

      await Executor.execute('apk update && apk add wget unzip', true);
      await Executor.execute(`wget ${NGROK_URL} -O ${TEMP_ZIP}`, true);
      await Executor.execute(`unzip -o ${TEMP_ZIP} -d /tmp/`, true);
      await Executor.execute(`mv /tmp/ngrok ${NGROK_BIN}`, true);
      await Executor.execute(`chmod +x ${NGROK_BIN}`, true);
      await Executor.execute(`rm ${TEMP_ZIP}`, true);

      loader.hide();
      alert('Success!', 'Ngrok installed successfully!\n\nConfigure with: ngrok config add-authtoken <token>');
    } catch (error) {
      alert('Installation Failed', String(error) || 'An error occurred during installation.');
    }
  }

  async runNgrok() {
    const port = await prompt('Enter port number');
    if (!port) return;

    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult || !checkResult.includes('/ngrok')) {
        alert('Not Found', 'Please install ngrok first.');
        return;
      }

      const terminal = acode.require('terminal');
      const term = terminal.create();
      
      setTimeout(() => {
        terminal.write(term.id, `ngrok http ${port}\n`);
      }, 1000);
    } catch (error) {
      alert('Error', String(error));
    }
  }

  async checkVersion() {
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult || !checkResult.includes('/ngrok')) {
        alert('Not Found', 'Please install ngrok first.');
        return;
      }

      const version = await Executor.execute('ngrok version', true);
      alert('Ngrok Version', version || 'Unable to get version');
    } catch (error) {
      alert('Error', String(error) || 'Failed to check version');
    }
  }

  async configureNgrok() {
    const token = await prompt('Enter your ngrok authtoken');
    if (!token) return;

    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult || !checkResult.includes('/ngrok')) {
        alert('Not Found', 'Please install ngrok first.');
        return;
      }

      const result = await Executor.execute(`ngrok config add-authtoken ${token}`, true);
      alert('Configuration Result', result || 'Authtoken configured successfully!');
    } catch (error) {
      alert('Error', String(error) || 'Failed to configure authtoken');
    }
  }

  async uninstallNgrok() {
    const confirmed = await confirm('Uninstall ngrok?', 'Are you sure you want to uninstall ngrok?');
    if (!confirmed) return;

    try {
      await Executor.execute(`rm -f ${NGROK_BIN}`, true);
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
