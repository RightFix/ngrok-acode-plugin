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
      { name: 'ngrok-install', description: 'Ngrok: Install', exec: () => self.installNgrok() },
      { name: 'ngrok-run', description: 'Ngrok: Run Tunnel', exec: () => self.runNgrok() },
      { name: 'ngrok-version', description: 'Ngrok: Check Version', exec: () => self.checkVersion() },
      { name: 'ngrok-config', description: 'Ngrok: Configure Authtoken', exec: () => self.configureNgrok() },
      { name: 'ngrok-uninstall', description: 'Ngrok: Uninstall', exec: () => self.uninstallNgrok() },
      { name: 'ngrok-menu', description: 'Ngrok: Show Menu', exec: () => self.showNgrokMenu() },
    ];

    if (editorManager.isCodeMirror) {
      const cmds = acode.require('commands');
      commands.forEach(cmd => cmds.add(cmd.name, cmd.description, cmd.exec));
    } else {
      const { commands: editorCommands } = editorManager.editor;
      commands.forEach(cmd => editorCommands.addCommand({ name: cmd.name, description: cmd.description, exec: cmd.exec }));
    }
  }

  async showNgrokMenu() {
    const options = ['Install ngrok', 'Run ngrok', 'Check version', 'Configure authtoken', 'Uninstall ngrok'];
    try {
      const action = await select('Ngrok Menu', options);
      if (!action) return;
      switch (action) {
        case 'Install ngrok': await this.installNgrok(); break;
        case 'Run ngrok': await this.runNgrok(); break;
        case 'Check version': await this.checkVersion(); break;
        case 'Configure authtoken': await this.configureNgrok(); break;
        case 'Uninstall ngrok': await this.uninstallNgrok(); break;
      }
    } catch (e) { console.error('Menu error:', e); }
  }
  
  async installNgrok() {
    try {
      const term = await terminal.create({ name: 'Install Ngrok' });
      await terminal.write(term.id, "(cd && rm ../usr/bin/ngrok || cd ) && apk update && apk upgrade && apk add wget && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz -O ngrok.tgz && tar xvzf ngrok.tgz && rm ngrok.tgz\n");
      await terminal.write(term.id, "mv ngrok ../usr/bin && echo 'Ngrok installed!'\n");
      await terminal.close(term.id);
      alert('Installing ngrok...', 'Wait for installation to complete.');
    } catch (error) { alert('Error', String(error)); }
  }

  async runNgrok() {
    let port;
    try { port = await prompt('Enter port number e.g 8000, 5500'); }
    catch (e) { return; }
    if (!port) return;
    try {
      const term = await terminal.create({ name: 'Run Ngrok' });
      await terminal.write(term.id, `ngrok http ${port}\n`);
    } catch (error) { alert('Error', String(error)); }
  }

  async checkVersion() {
    try {
      const term = await terminal.create({ name: 'Check Version' });
      await terminal.write(term.id, "ngrok version\n");
    } catch (error) { alert('Error', String(error)); }
  }

  async configureNgrok() {
    let token;
    try { token = await prompt('Enter your ngrok authtoken'); }
    catch (e) { return; }
    if (!token) return;
    try {
      const term = await terminal.create({ name: 'Configure Ngrok' });
      await terminal.write(term.id, `ngrok config add-authtoken ${token}\n`);
      await terminal.close(term.id)
      alert('Authtoken configured!');
    } catch (error) { alert('Error', String(error)); }
  }

  async uninstallNgrok() {
    let confirmed;
    try { confirmed = await confirm('Uninstall ngrok?', 'Are you sure?'); }
    catch (e) { return; }
    if (!confirmed) return;
    try {
      const term = await terminal.create({ name: 'Uninstall Ngrok' });
      await terminal.write(term.id, 'rm ../usr/bin/ngrok && echo "Ngrok uninstalled"\n');
      await  terminal.close(term.id)
      alert('Success', 'Ngrok uninstalled.');
    } catch (error) { alert('Error', String(error)); }
  }

  async destroy() {
      const term = await terminal.create({ name: 'Uninstall Ngrok' });
      await terminal.write(term.id, 'rm ../usr/bin/ngrok && echo "Ngrok uninstalled"\n');
      await  terminal.close(term.id)

    const commandNames = ['ngrok-install', 'ngrok-run', 'ngrok-version', 'ngrok-config', 'ngrok-uninstall', 'ngrok-menu'];
    if (editorManager.isCodeMirror) {
      const cmds = acode.require('commands');
      commandNames.forEach(name => cmds.remove(name));
    } else {
      const { commands } = editorManager.editor;
      commandNames.forEach(name => commands.removeCommand(name));
    }
  }
}

if (window.acode) {
  const ngrokPlugin = new NgrokPlugin();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    ngrokPlugin.baseUrl = baseUrl;
    await ngrokPlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => ngrokPlugin.destroy());
}
