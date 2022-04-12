// run.js: execute command set in option page

chrome.storage.local.get('debug', (debug) => {
    chrome.storage.local.get('start', (cmd) => {
        chrome.terminalPrivate.onProcessOutput.addListener( (pid, type, data) => {
          let output
          // on Chrome OS 100+, the onProcessOutput function will return an ArrayBuffer object instead of a string,
          // we need to convert it to string if an ArrayBuffer is returned.
          //
          // For more info, see https://chromium-review.googlesource.com/c/apps/libapps/+/3470612/
          if (data instanceof ArrayBuffer) {
            let dec = new TextDecoder('utf-8')
            output = dec.decode(data)
          } else {
            output = data
          }

          // print terminal output in console
          if (output.match(/[^"]__ext_close__/) && !debug.debug) {
            // close terminal process
            chrome.terminalPrivate.closeTerminalProcess(pid);

            // close self after sending commands to terminal
            chrome.windows.getCurrent( (window) => {
              chrome.windows.remove(window.id);
            });
          }
          console.log(output);
        });

        // open a terminal process
        chrome.terminalPrivate.openTerminalProcess('crosh', (pid) => {
            if (pid < 0) { alert('Error: cannot open crosh!'); }
            chrome.terminalPrivate.sendInput(pid, 'shell\n');
            chrome.terminalPrivate.sendInput(pid, `nohup bash <<_CMD_&\n${cmd.start}\n_CMD_\n`); // prevent unexpected newline
            chrome.terminalPrivate.sendInput(pid, 'echo "__ext_close__"\n');
        });
    });
});
