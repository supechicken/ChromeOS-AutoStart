import { printLog } from "./functions.js";

const clearSequences        = '\e[H\e[2J\e[3J',
      clearSequencesInBytes = Uint8Array.from([27, 91, 72, 27, 91, 50, 74, 27, 91, 51, 74]);

export async function spawnProcess(processType, vmshell_options = {}, io = null) {
  const vsh_args = [`--vm_name=${vmshell_options.vmName}`,
                    `--target_container=${vmshell_options.containerName}`,
                    '--'].concat(vmshell_options.cmd);

  let terminal_id;

  switch (processType) {
    case 'crosh':
      // spawn a crosh process with chrome.terminalPrivate.openTerminalProcess()
      printLog('Spawning crosh...', io);

      terminal_id = await new Promise(resolve => {
        chrome.terminalPrivate.openTerminalProcess('crosh', id => resolve(id));
      });

      printLog([
        `Process ${terminal_id} spawned:`,
        '',
        '  /usr/bin/crosh',
        ''
      ], io);

      break;
    case 'vmshell':
      // spawn a vsh process with chrome.terminalPrivate.openVmshellProcess()
      printLog('Spawning VM shell...', io);

      terminal_id = await new Promise(resolve => {
        chrome.terminalPrivate.openVmshellProcess(vsh_args, id => resolve(id));
      });

      printLog([
        `Process ${terminal_id} spawned:`,
        '',
        `  /usr/bin/vsh ${vsh_args.slice(0, -4).join(' ')} ...`,
        ''
      ], io);

      break;
  }

  return terminal_id;
}

export function registerOutputListenerAndWait(terminal_id, io = null) {
  const decoder = new TextDecoder('utf-8');

  // registerOutputListenerAndWait: register command output listener and wait for command exit
  return new Promise(resolve => {
    const listener = (id, type, data) => {
      // only handle output from ${terminal_id}
      if (id !== terminal_id) return;

      switch (type) {
        case chrome.terminalPrivate.OutputType.EXIT:
          // remove this listener and resolve the promise
          printLog(`Process ${terminal_id} exited`, io);
          chrome.terminalPrivate.onProcessOutput.removeListener(listener);
          resolve();
          break;
        case chrome.terminalPrivate.OutputType.STDOUT:
        case chrome.terminalPrivate.OutputType.STDERR:
          // on Chrome OS 100+, the onProcessOutput function will return an ArrayBuffer object instead of a string
          //
          // For more info, see https://chromium-review.googlesource.com/c/apps/libapps/+/3470612/
          if (data instanceof ArrayBuffer) {
            if (io) {
              const data_view = new Uint8Array(data);

              // ignore terminal erase sequences for debugging
              if (data_view.length === clearSequencesInBytes.length && data_view.every((v, i) => v === clearSequencesInBytes[i])) {
                printLog('Terminal erase sequences ignored', io);
              } else {
                io.writeUTF8(data);
              }
            } else {
              // print to console if hterm not available
              console.log(decoder.decode(data));
            }
          } else {
            if (io) {
              // ignore terminal erase sequences for debugging
              if (data == clearSequences) {
                printLog('Terminal erase sequences ignored', io);
              } else {
                io.print(data);
              }
            } else {
              // print to console if hterm not available
              console.log(data);
            }
          }

          break;
      }
    };

    // attach listener
    chrome.terminalPrivate.onProcessOutput.addListener(listener);
  });
}