import plugin from '../plugin.json';

let alert, prompt, confirm, select, terminal, toast;

interface AcodeAlert {
  (title: string, message: string): void;
}
interface AcodePrompt {
  (title: string, message: string): Promise<string | null>;
}
interface AcodeConfirm {
  (title: string, message: string): Promise<boolean>;
}
interface AcodeSelect {
  (title: string, options: string[]): Promise<string | null>;
}
interface Terminal { id: string; }
interface TerminalModule {
  create(options: { name: string }): Promise<Terminal>;
  write(id: string, content: string): Promise<void>;
}
interface AcodeCommand {
  name: string;
  description: string;
  exec: () => void | Promise<void>;
}
interface CommandsModule {
  addCommand?: (cmd: AcodeCommand) => void;
  removeCommand?: (name: string) => void;
  registry?: { add: (cmd: AcodeCommand) => void; remove: (name: string) => void };
}
interface AcodeModule {
  require: (module: string) => unknown;
  addCommand?: (cmd: AcodeCommand) => void;
  removeCommand?: (name: string) => void;
  toast?: (message: string, duration?: number) => void;
  setPluginInit: (id: string, initFn: (baseUrl: string, $page: unknown, ctx: { cacheFileUrl: string; cacheFile: unknown; firstInit: boolean }) => Promise<void>) => void;
  setPluginUnmount: (id: string, unmountFn: () => void) => void;
}
declare const acode: AcodeModule;
declare const editorManager: { isCodeMirror: boolean; editor?: { commands: { addCommand: (cmd: AcodeCommand) => void; removeCommand: (name: string) => void } } };

class NgrokPlugin {
  private sideBtn: { show: () => void; hide: () => void } | null = null;
  private autoInstalled = false;

  async init(firstInit = false): Promise<void> {
    alert = acode.require('alert') as AcodeAlert;
    prompt = acode.require('prompt') as AcodePrompt;
    confirm = acode.require('confirm') as AcodeConfirm;
    select = acode.require('select') as AcodeSelect;
    terminal = acode.require('terminal') as TerminalModule;
    toast = acode.require('toast') as ((message: string, duration?: number) => void) | undefined;

    this.registerCommands();

    if (firstInit) {
      await this.autoInstall();
    }
  }

  registerCommands(): void {
    if (!editorManager) return;

    const self = this;
    const commands: AcodeCommand[] = [
      { name: 'ngrok-install', description: 'Ngrok: Install', exec: () => self.installNgrok() },
      { name: 'ngrok-run', description: 'Ngrok: Run Tunnel', exec: () => self.runNgrok() },
      { name: 'ngrok-version', description: 'Ngrok: Check Version', exec: () => self.checkVersion() },
      { name: 'ngrok-config', description: 'Ngrok: Configure Authtoken', exec: () => self.configureNgrok() },
      { name: 'ngrok-uninstall', description: 'Ngrok: Uninstall', exec: () => self.uninstallNgrok() },
      { name: 'ngrok-update', description: 'Ngrok: Update Ngrok', exec: () => self.updateNgrok() },
      { name: 'ngrok-menu', description: 'Ngrok: Show Menu', exec: () => self.showNgrokMenu() },
    ];

    // Modern Acode (CodeMirror): acode.require('commands').addCommand({name, description, exec})
    try {
      const cmds = acode.require('commands') as CommandsModule | null | undefined;
      if (cmds && typeof cmds.addCommand === 'function') {
        commands.forEach(cmd => cmds.addCommand!(cmd));
        return;
      }
      if (cmds && cmds.registry && typeof cmds.registry.add === 'function') {
        commands.forEach(cmd => cmds.registry!.add(cmd));
        return;
      }
    } catch { /* fall through */ }

    try {
      if (typeof acode.addCommand === 'function') {
        commands.forEach(cmd => acode.addCommand!(cmd));
        return;
      }
    } catch { /* fall through */ }

    try {
      const editorCommands = editorManager.editor?.commands;
      if (editorCommands && typeof editorCommands.addCommand === 'function') {
        commands.forEach(cmd => editorCommands.addCommand({ name: cmd.name, description: cmd.description, exec: cmd.exec }));
      }
    } catch (e) { console.error('Ngrok: command registration failed', e); }
  }

  async showNgrokMenu() {
    const options = ['Install ngrok', 'Run ngrok', 'Check version', 'Configure authtoken', 'Update ngrok', 'Uninstall ngrok'];
    try {
      const action = await select('Ngrok Menu', options);
      if (!action) return;
      switch (action) {
        case 'Install ngrok': await this.installNgrok(); break;
        case 'Run ngrok': await this.runNgrok(); break;
        case 'Check version': await this.checkVersion(); break;
        case 'Configure authtoken': await this.configureNgrok(); break;
        case 'Update ngrok': await this.updateNgrok(); break;
        case 'Uninstall ngrok': await this.uninstallNgrok(); break;
      }
    } catch (e) { console.error('Menu error:', e); }
  }

  /** Auto-install on first plugin download (ask user first). */
  private async autoInstall(): Promise<void> {
    if (this.autoInstalled) return;
    try {
      const confirmed = await confirm('Welcome!', 'Ngrok is not installed. Install it now?');
      if (!confirmed) {
        toast?.('Ngrok install skipped. Use Ngrok: Install anytime.');
        return;
      }
      const term = await terminal.create({ name: 'Install Ngrok' });
      await terminal.write(term.id, "apk update && apk add wget && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz -O ngrok.tgz && tar xvzf ngrok.tgz && mv ngrok /usr/local/bin/ngrok && rm ngrok.tgz\r\n");
      await terminal.write(term.id, "ngrok version\r\n");
      await terminal.write(term.id, 'exit \r\n');
      this.autoInstalled = true;
      toast?.('Ngrok installed!');
    } catch (e) {
      toast?.('Auto-install failed. Use Ngrok: Install manually.');
    }
  }

  async installNgrok(): Promise<void> {
    try {
      const term = await terminal.create({ name: 'Install Ngrok' });
      await terminal.write(term.id, "apk update && apk add wget && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz -O ngrok.tgz && tar xvzf ngrok.tgz && mv ngrok /usr/local/bin/ngrok && rm ngrok.tgz\r\n");
      await terminal.write(term.id, "ngrok version\r\n");
      await terminal.write(term.id, 'exit \r\n');
      toast?.('Installing ngrok...');
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async runNgrok(): Promise<void> {
    let port;
    try { port = await prompt('Enter port number e.g 8000, 5500'); }
    catch (e) { return; }
    if (!port) return;
    try {
      const term = await terminal.create({ name: 'Run Ngrok' });
      await terminal.write(term.id, `ngrok http ${port} \r\n`);
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async checkVersion(): Promise<void> {
    try {
      const term = await terminal.create({ name: 'Check Version' });
      await terminal.write(term.id, "ngrok version \r\n");
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async configureNgrok(): Promise<void> {
    let token;
    try { token = await prompt('Enter your ngrok authtoken'); }
    catch (e) { return; }
    if (!token) return;
    try {
      const term = await terminal.create({ name: 'Configure Ngrok' });
      await terminal.write(term.id, `ngrok config add-authtoken ${token} \r\n`);
      await terminal.write(term.id, 'exit \r\n');
      toast?.('Authtoken configured!');
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async updateNgrok(): Promise<void> {
    try {
      const term = await terminal.create({ name: 'Update Ngrok' });
      await terminal.write(term.id, 'ngrok update \r\n');
      await terminal.write(term.id, 'exit \r\n');
      toast?.('Updating ngrok...');
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async uninstallNgrok(): Promise<void> {
    let confirmed;
    try { confirmed = await confirm('Uninstall ngrok?', 'Are you sure?'); }
    catch (e) { return; }
    if (!confirmed) return;
    try {
      const term = await terminal.create({ name: 'Uninstall Ngrok' });
      await terminal.write(term.id, 'rm /usr/local/bin/ngrok && echo "Ngrok uninstalled" \r\n');
      await terminal.write(term.id, 'exit \r\n');
      toast?.('Ngrok uninstalled.');
    } catch (error) { toast?.('Error: ' + String(error)); }
  }

  async destroy(): Promise<void> {
    if (this.sideBtn) {
      this.sideBtn.hide();
      this.sideBtn = null;
    }

    if (!editorManager) return;

    const commandNames = ['ngrok-install', 'ngrok-run', 'ngrok-version', 'ngrok-config', 'ngrok-uninstall', 'ngrok-menu', 'ngrok-update'];

    try {
      const cmds = acode.require('commands') as CommandsModule | null | undefined;
      if (cmds && typeof cmds.removeCommand === 'function') {
        commandNames.forEach(name => cmds.removeCommand!(name));
        return;
      }
      if (cmds && cmds.registry && typeof cmds.registry.remove === 'function') {
        commandNames.forEach(name => cmds.registry!.remove(name));
        return;
      }
    } catch { /* fall through */ }

    try {
      if (typeof acode.removeCommand === 'function') {
        commandNames.forEach(name => acode.removeCommand!(name));
        return;
      }
    } catch { /* fall through */ }

    try {
      const editorCommands = editorManager.editor?.commands;
      if (editorCommands && typeof editorCommands.removeCommand === 'function') {
        commandNames.forEach(name => editorCommands.removeCommand(name));
      }
    } catch (e) { console.error('Ngrok: command removal failed', e); }
  }
}

if (window.acode) {
  const ngrokPlugin = new NgrokPlugin();
  acode.setPluginInit(plugin.id, async (_baseUrl: string, $page: unknown, { cacheFileUrl, cacheFile, firstInit }: { cacheFileUrl: string; cacheFile: unknown; firstInit: boolean }) => {
    ngrokPlugin.init(firstInit);
  });
  acode.setPluginUnmount(plugin.id, () => ngrokPlugin.destroy());
}
