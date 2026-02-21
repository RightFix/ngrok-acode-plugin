import plugin from '../plugin.json';

const NGROK_URL = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.zip';
const NGROK_BIN = '/data/data/com.foxdebug.acode/files/alpine/usr/local/bin/ngrok';
const TEMP_ZIP = '/tmp/ngrok.zip';

class NgrokPlugin {
  baseUrl = '';

  async init($page, cacheFile, cacheFileUrl) {
    this.$page = $page;
    this.cacheFile = cacheFile;
    this.cacheFileUrl = cacheFileUrl;

    this.registerCommands();
  }

  registerCommands() {
    const { commands } = editorManager.editor;

    commands.addCommand({
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

      const checkResult = await Executor.execute('which ngrok', true);
      if (checkResult.includes('ngrok')) {
        loader.hide();
        acode.alert('Ngrok is already installed!', 'Use "Check version" to verify.');
        return;
      }

      await Executor.execute('apk update', true);
      await Executor.execute('apk add wget unzip', true);

      await Executor.execute(`wget ${NGROK_URL} -O ${TEMP_ZIP}`, true);
      await Executor.execute(`unzip -o ${TEMP_ZIP} -d /tmp/`, true);
      await Executor.execute(`mv /tmp/ngrok ${NGROK_BIN}`, true);
      await Executor.execute(`chmod +x ${NGROK_BIN}`, true);
      await Executor.execute(`rm ${TEMP_ZIP}`, true);

      loader.hide();
      acode.alert('Success!', 'Ngrok installed successfully!\n\nConfigure with: ngrok config add-authtoken <token>');
    } catch (error) {
      loader.hide();
      acode.alert('Installation Failed', error.message || error || 'An error occurred during installation.');
    }
  }

  async runNgrok(port = '80') {
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first.');
        return;
      }

      const customPort = await acode.prompt('Enter port number', port, 'text');
      if (!customPort) return;

      acode.exec('new-terminal');
      
      setTimeout(() => {
        const terminal = acode.require('terminal');
        if (terminal && terminal.write) {
          terminal.write(`ngrok http ${customPort}\r`);
        }
      }, 500);
    } catch (error) {
      acode.alert('Error', error.message || error || 'Failed to run ngrok');
    }
  }

  async checkVersion() {
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first.');
        return;
      }

      const version = await Executor.execute('ngrok version', true);
      acode.alert('Ngrok Version', version || 'Unable to get version');
    } catch (error) {
      acode.alert('Error', error.message || error || 'Failed to check version');
    }
  }

  async configureNgrok() {
    try {
      const checkResult = await Executor.execute('which ngrok', true);
      if (!checkResult.includes('ngrok')) {
        acode.alert('Ngrok not found', 'Please install ngrok first.');
        return;
      }

      const token = await acode.prompt('Enter your ngrok authtoken', '', 'text', {
        match: /^[\w-]+$/,
        placeholder: 'Your authtoken from ngrok.com',
      });

      if (!token) return;

      const result = await Executor.execute(`ngrok config add-authtoken ${token}`, true);
      acode.alert('Configuration Result', result || 'Authtoken configured successfully!');
    } catch (error) {
      acode.alert('Error', error.message || error || 'Failed to configure authtoken');
    }
  }

  async uninstallNgrok() {
    try {
      const confirm = await acode.confirm('Uninstall ngrok?', 'Are you sure you want to uninstall ngrok?');
      if (!confirm) return;

      const loader = acode.loader('Uninstalling ngrok...', 'Please wait');
      loader.show();

      await Executor.execute(`rm -f ${NGROK_BIN}`, true);
      
      loader.hide();
      acode.alert('Success', 'Ngrok has been uninstalled.');
    } catch (error) {
      loader.hide();
      acode.alert('Error', error.message || error || 'Failed to uninstall ngrok');
    }
  }

  destroy() {
    const { commands } = editorManager.editor;
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
