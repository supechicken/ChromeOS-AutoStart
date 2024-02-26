import { printLog } from './shared/functions.js';
import * as terminal from './shared/terminal_api.js';

const url_params  = new URLSearchParams(location.search),
      manifest    = chrome.runtime.getManifest(),
      bash_prompt = '\\e]0;ChromeOS AutoStart\\a\\e[1;34mdevshell> \\e[0m',
      hterm_ver   = lib.resource.getData('hterm/changelog/version'),
      hterm_date  = lib.resource.getData('hterm/changelog/date');


async function autostartEntries(io) {
  // read autostart entries from storage
  const sw_registration = await navigator.serviceWorker.getRegistration(),
        localStorage    = await new Promise(r => chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose'], c => r(c))),
        totalTimestamp  = Date.now();

  // show notification if requested
  if (localStorage.showNotification) {
    await sw_registration.getNotifications({ tag: 'autostart' }).then(notifications => notifications[0]?.close());

    sw_registration.showNotification('ChromeOS AutoStart', {
      tag:  'autostart',
      icon: '/img/icon.svg',
      body: `${localStorage.autostartEntries.length} autostart entries pending`
    });
  }

  printLog(`${manifest.name} (version ${manifest.version})`, io);
  printLog(`Terminal: hterm ${hterm_ver} (${hterm_date})`, io);

  for (const entry of localStorage.autostartEntries) {
    const entryTimestamp           = Date.now();
    let   terminal_id, processType = entry.type;

    if (entry.type == 'vmshell') {
      // for VM, wrap commands with "bash -c" and pass them to vsh
      terminal_id = await terminal.spawnProcess(processType, {
        vmName: entry.vmName,
        containerName: entry.containerName,
        cmd: ['/bin/bash', '-c', entry.cmd]
      }, io);
    } else {
      // for crosh/dev_shell, "type" commands to terminal with chrome.terminalPrivate.sendInput()
      let text_to_inject = '\r# === start of command(s) === #\r';

      // replace newlines with carriage return as chrome.terminalPrivate does not work well with newlines
      if (entry.type == 'devshell') {
        processType     = 'crosh';
        text_to_inject += `shell\r`;                        // enter bash shell
        text_to_inject += `set +o history\r`;               // do not save commands to .bash_history
        text_to_inject += `PS1="${bash_prompt}"\r\r`;       // set prompt text
        text_to_inject += entry.cmd.replaceAll('\n', '\r'); // inject user specific commands
        text_to_inject += `\rexit\r`;                       // exit bash shell after completed
      } else {
        text_to_inject += entry.cmd.replaceAll('\n', '\r') + '\r';
      }

      // exit the shell once command completed
      text_to_inject += 'exit\r# === end of command(s) === #\r\r';
      terminal_id     = await terminal.spawnProcess(processType, {}, io);

      printLog('Injecting commands...', io);
      chrome.terminalPrivate.sendInput(terminal_id, text_to_inject, () => printLog('Injection completed'));
    }

    // connect process's IO with hterm
    io.onVTKeystroke = input => chrome.terminalPrivate.sendInput(terminal_id, input);

    await terminal.registerOutputListenerAndWait(terminal_id, io);

    chrome.terminalPrivate.closeTerminalProcess(terminal_id);
    printLog(`Completed in ${(Date.now() - entryTimestamp) / 1000} seconds`, io);
  };

  const elapsed = (Date.now() - totalTimestamp) / 1000;

  // print elapsed time
  printLog('', io);
  printLog('========================================', io);
  printLog(`All tasks completed in ${elapsed} seconds`, io);
  printLog('========================================', io);

  // show notification if requested
  if (localStorage.showNotification) {
    await sw_registration.getNotifications({ tag: 'autostart' }).then(notifications => notifications[0]?.close());

    sw_registration.showNotification('Autostart completed', {
      tag:  'autostart',
      icon: '/img/icon.svg',
      body: `All tasks completed in ${elapsed} seconds`
    });
  }
}

window.onload = async () => {
  // initialize hterm
  await lib.init();

  const localStorage = await new Promise(r => chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose'], c => r(c))),
        term         = new hterm.Terminal();

  // attach hterm
  term.decorate(document.querySelector('#terminal'));
  term.installKeyboard();

  // useful for console
  window.autostartEntries = autostartEntries;
  window.terminal         = term;

  term.onTerminalReady = async () => {
    const io = term.io.push();
    term.setCursorVisible(true);

    await autostartEntries(io);

    // do not close automatically if requested
    if (url_params.get('noclose') === '1' || !localStorage.autoClose) {
      printLog('', io);
      printLog('Press any key to close this window...', io, false);

      io.onVTKeystroke = () => window.close();
    } else {
      setTimeout(() => window.close(), 500);
    }
  };
}