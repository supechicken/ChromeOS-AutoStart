const url_params  = new URLSearchParams(location.search),
      manifest    = chrome.runtime.getManifest(),
      hterm_ver   = lib.resource.getData('hterm/changelog/version'),
      hterm_date  = lib.resource.getData('hterm/changelog/date'),
      bash_prompt = '\\e]0;ChromeOS AutoStart\\a\\e[1;34mdevshell> \\e[0m';

// console clear sequences used by crosh
const clearSequences        = '\e[H\e[2J\e[3J',
      clearSequencesInBytes = Uint8Array.from([27, 91, 72, 27, 91, 50, 74, 27, 91, 51, 74]);

function printLog(io, message, newline = true) {
  // printLog(): print to both browser console and hterm
  if (message instanceof Array) {
    message.forEach(m => {
      console.log('[ChromeOS-AutoStart]:', m);
      io.println('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + m + '\x1b[0m');
    });
  } else {
    console.log('[ChromeOS-AutoStart]:', message);
    if (newline) {
      io.println('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + message + '\x1b[0m');
    } else {
      io.print('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + message + '\x1b[0m');
    }
  }
}

async function spwanProcess(processType, io, vmshell_options = {}) {
  const vsh_args = [`--vm_name=${vmshell_options.vmName}`,
                    `--target_container=${vmshell_options.containerName}`,
                    '--'].concat(vmshell_options.cmd);

  let terminal_id;

  switch (processType) {
    case 'crosh':
      // spawn a crosh process with chrome.terminalPrivate.openTerminalProcess()
      printLog(io, 'Spawning crosh...');

      terminal_id = await new Promise(resolve => {
        chrome.terminalPrivate.openTerminalProcess('crosh', id => resolve(id));
      });

      printLog(io, [
        `Process ${terminal_id} spawned:`,
        '',
        '  /usr/bin/crosh',
        ''
      ]);

      break;
    case 'vmshell':
      // spawn a vsh process with chrome.terminalPrivate.openVmshellProcess()
      printLog(io, 'Spawning VM shell...');

      terminal_id = await new Promise(resolve => {
        chrome.terminalPrivate.openVmshellProcess(vsh_args, id => resolve(id));
      });

      printLog(io, [
        `Process ${terminal_id} spawned:`,
        '',
        `  /usr/bin/vsh ${vsh_args.slice(0, -4).join(' ')} ...`,
        ''
      ]);

      break;
  }

  return terminal_id;
}

function registerOutputListenerAndWait(terminal_id, io) {
  // registerOutputListenerAndWait: register command output listener and wait for command exit
  return new Promise(resolve => {
    const listener = (id, type, data) => {
      // only handle output from ${terminal_id}
      if (id !== terminal_id) return;

      switch (type) {
        case chrome.terminalPrivate.OutputType.EXIT:
          // remove this listener and resolve the promise
          printLog(io, `Process ${terminal_id} exited`);
          chrome.terminalPrivate.onProcessOutput.removeListener(listener);
          resolve();
          break;
        case chrome.terminalPrivate.OutputType.STDOUT:
        case chrome.terminalPrivate.OutputType.STDERR:
          // on Chrome OS 100+, the onProcessOutput function will return an ArrayBuffer object instead of a string
          //
          // For more info, see https://chromium-review.googlesource.com/c/apps/libapps/+/3470612/
          if (data instanceof ArrayBuffer) {
            const data_view = new Uint8Array(data);

            // ignore terminal erase sequences for debugging
            if (data_view.length === clearSequencesInBytes.length && data_view.every((v, i) => v === clearSequencesInBytes[i])) {
              printLog(io, 'Terminal erase sequences ignored');
            } else {
              io.writeUTF8(data);
            }
          } else {
            // ignore terminal erase sequences for debugging
            if (data == clearSequences) {
              printLog(io, 'Terminal erase sequences ignored');
            } else {
              io.print(data);
            }
          }

          break;
      }
    };

    // attach listener
    chrome.terminalPrivate.onProcessOutput.addListener(listener);
  });
}

window.onload = async () => {
  // read autostart entries from storage
  const localStorage   = await new Promise(resolve => chrome.storage.local.get(['autostart_entries'], callback => resolve(callback))),
        totalTimestamp = Date.now();

  // initialize hterm
  await lib.init();

  const term = new hterm.Terminal();

  // attach hterm
  term.decorate(document.querySelector('#terminal'));
  term.installKeyboard();

  // useful for console debugging
  window.term_ = term;

  term.onTerminalReady = async () => {
    const io = term.io.push();
    term.setCursorVisible(true);

    printLog(io, `${manifest.name} (version ${manifest.version})`);
    printLog(io, `Terminal: hterm ${hterm_ver} (${hterm_date})`);

    for (entry of localStorage.autostart_entries) {
      const entryTimestamp = Date.now();
      let terminal_id, processType = entry.type;

      if (entry.type == 'vmshell') {
        // for VM, wrap commands with "bash -c" and pass them to vsh
        terminal_id = await spwanProcess(processType, io, {vmName: 'termina', containerName: 'penguin', cmd: ['/bin/bash', '-c', entry.cmd]});
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
        terminal_id     = await spwanProcess(processType, io);

        printLog(io, 'Injecting commands...');
        chrome.terminalPrivate.sendInput(terminal_id, text_to_inject, () => printLog(io, 'Injection completed'));
      }

      // connect process's IO with hterm
      io.onVTKeystroke = input => chrome.terminalPrivate.sendInput(terminal_id, input);
      await registerOutputListenerAndWait(terminal_id, io);

      chrome.terminalPrivate.closeTerminalProcess(terminal_id);
      printLog(io, `Completed in ${(Date.now() - entryTimestamp) / 1000} seconds`);
    };

    // print elapsed time
    printLog(io, '');
    printLog(io, '========================================');
    printLog(io, `All tasks completed in ${(Date.now() - totalTimestamp) / 1000} seconds`);
    printLog(io, '========================================');

    // do not close automatically if requested
    if (url_params.get('noClose') === '1') {
      printLog(io, '');
      printLog(io, 'Press any key to close this window...', false);

      io.onVTKeystroke = () => window.close();
    } else {
      setTimeout(() => window.close(), 500);
    }
  };
}