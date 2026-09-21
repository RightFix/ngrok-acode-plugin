# Changelogs

## [2.0.1] - Auto-install on download

- Auto-install on plugin download via `firstInit` flag in `setPluginInit`.
- `autoInstall()` prompts user before installing ngrok.
- `autoInstalled` flag prevents duplicate runs on reload.
- Toast feedback on success, skip, or failure fallback.
- License updated to AGPL-3.0.

## [2.0.0] - Command API fix

- Fix `t.add is not a function` crash in command registration.
- Use Commands API `addCommand({ name, description, exec })` / `removeCommand(name)` with fallbacks (`commands` -> `registry` -> `acode.addCommand/removeCommand` -> legacy `editor.commands`).
- Harden `registerCommands` / `destroy` with `try/catch` so init can't abort before setup.
- Fix `destroy()`: removed accidental `rm /usr/local/bin/ngrok` and terminal spawn on unload; destroy now only hides UI and unregisters commands.
- Fix stray quote in `ngrok update"`.
- Align `init()` signature with `setPluginInit(baseUrl, $page, {cacheFileUrl, cacheFile, firstInit})`.
- Add `acode.require('toast')` feedback for install/update/uninstall/errors.
- Switch install/uninstall paths to `/usr/local/bin/ngrok`.
- Package `changelog.md` + `LICENSE` into `dist.zip`.

## [1.1.0] - Update Ngrok

- Users can now update ngrok from the command menu.

## [1.0.1] - Terminal issues

- Terminal closes after installing, uninstalling or configuration of ngrok.

## [1.0.0] - Initial Release

- Install ngrok v3 stable for ARM64 Linux
- Run ngrok HTTP tunnels with custom ports
- Configure ngrok authtoken
- Check ngrok version
- Uninstall ngrok
- Integration with Acode's built-in terminal
