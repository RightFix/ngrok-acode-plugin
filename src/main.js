import plugin from '../plugin.json';

const NGROK_URL = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip';
const NGROK_BIN = '/usr/bin/ngrok';
const TEMP_ZIP = '/tmp/ngrok.zip';

class NgrokPlugin {
  baseUrl = '';

  async init($page, cacheFile, cacheFileUrl) {
    this.$page = $page;
    this.cacheFile = cacheFile;
    this.cacheFileUrl = cacheFileUrl;

    this.registerCommands();
    this.addMenuItems();
  }

  registerCommands() {
    const { commands } = editorManager.editor;

    commands.addCommand({
      name: 'install-ngrok',
      description: 'Install ngrok on your device',
      exec: () => this.installNgrok(),
    });

    commands.addCommand({
      name: 'run-ngrok',
      description: 'Run ngrok http server',
      exec: () => this.runNgrok(),
    });

    commands.addCommand({
      name: 'ngrok-version',
      description: 'Check ngrok version',
      exec: () => this.checkVersion(),
    });

    commands.addCommand({
      name: 'configure-ngrok',
      description: 'Configure ngrok authtoken',
      exec: () => this.configureNgrok(),
    });
  }

  addMenuItems() {
    const item = {
      name: 'Ngrok',
      icon: 'icon-network',
      action: () => this.showNgrokMenu(),
    };
    
    editorManager.editor.commands.addCommand({
      name: 'ngrok-menu',
      description: 'Open Ngrok menu',
      exec: () => this.showNgrokMenu(),
    });
  }

  async showNgrokMenu() {
    const options = [
      'Install ngrok',
      'Run ngrok http 80',
      'Check version',
      'Configure authtoken',
      'Uninstall ngrok',
    ];

    const action = await acode.prompt('Ngrok Options', '', 'select', options);
    
    if (action === 'Install ngrok') {
      await this.installNgrok();
    } else if (action === 'Run ngrok http 80') {
      await this.runNgrok('80');
    } else if (action === 'Check version') {
      await this.checkVersion();
    } else if (action === 'Configure authtoken') {
      await this.configureNgrok();
    } else if (action === 'Uninstall ngrok') {
      await this.uninstallNgrok();
    }
  }

  async installNgrok() {
    const loader = acode.loader('Installing ngrok...', 'Please wait');
    
    try {
      loader.show();

      const checkResult = await Executor.execute('which ngrok');
      if (checkResult.includes('/usr/bin/ngrok') || checkResult.includes('ngrok')) {
        loader.hide();
        acode.alert('Ngrok is already installed!', 'Use "ngrok version" to check the installed version.');
        return;
      }

      await Executor.execute('apk update && apk upgrade');
      await Executor.execute('apk add wget unzip');

      await Executor.execute(`wget ${NGROK_URL} -O ${TEMP_ZIP}`);
      
      await Executor.execute(`unzip -o ${TEMP_ZIP} -d /tmp/`);
      await Executor.execute(`mv /tmp/ngrok ${NGROK_BIN}`);
      await Executor.execute(`chmod +x ${NGROK_BIN}`);
      await Executor.execute(`rm ${TEMP_ZIP}`);

      loader.hide();
      acode.alert('Success!', 'Ngrok installed successfully!\n\nRun "ngrok version" to verify.\nConfigure with: ngrok config add-authtoken <token>');
    } catch (error) {
      loader.hide();
      acode.alert('Installation Failed', error.message || 'An error occurred during installation.');
    }
  }

  async runNgrok(port = '80') {
    try {
      const checkResult = await Executor.execute('which ngrok');
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first using the Install ngrok option.');
        return;
      }

      const customPort = await acode.prompt('Enter port number', port, 'text');
      if (!customPort) return;

      acode.exec('new-terminal');
      
      setTimeout(async () => {
        const terminal = acode.require('acode.terminal');
        if (terminal && terminal.write) {
          terminal.write(`ngrok http ${customPort}\r`);
        }
      }, 500);
    } catch (error) {
      acode.alert('Error', error.message || 'Failed to run ngrok');
    }
  }

  async checkVersion() {
    try {
      const checkResult = await Executor.execute('which ngrok');
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first.');
        return;
      }

      const version = await Executor.execute('ngrok version');
      acode.alert('Ngrok Version', version || 'Unable to get version');
    } catch (error) {
      acode.alert('Error', error.message || 'Failed to check version');
    }
  }

  async configureNgrok() {
    try {
      const checkResult = await Executor.execute('which ngrok');
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first.');
        return;
      }

      const token = await acode.prompt('Enter your ngrok authtoken', '', 'text', {
        match: /^[\w-]+$/,
        placeholder: 'Your authtoken from ngrok.com',
      });

      if (!token) return;

      const result = await Executor.execute(`ngrok config add-authtoken ${token}`);
      acode.alert('Configuration Result', result || 'Authtoken configured successfully!');
    } catch (error) {
      acode.alert('Error', error.message || 'Failed to configure authtoken');
    }
  }

  async uninstallNgrok() {
    try {
      const confirm = await acode.confirm('Uninstall ngrok?', 'Are you sure you want to uninstall ngrok?');
      if (!confirm) return;

      const loader = acode.loader('Uninstalling ngrok...', 'Please wait');
      loader.show();

      await Executor.execute(`rm -f ${NGROK_BIN}`);
      
      loader.hide();
      acode.alert('Success', 'Ngrok has been uninstalled.');
    } catch (error) {
      acode.alert('Error', error.message || 'Failed to uninstall ngrok');
    }
  }

  destroy() {
    const { commands } = editorManager.editor;
    commands.removeCommand('install-ngrok');
    commands.removeCommand('run-ngrok');
    commands.removeCommand('ngrok-version');
    commands.removeCommand('configure-ngrok');
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
