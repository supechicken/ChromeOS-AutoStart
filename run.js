// run.js: execute command set in option page

chrome.storage.local.get('debug', (debug) => {
    chrome.storage.local.get('start', (cmd) => {
        chrome.terminalPrivate.onProcessOutput.addListener( (pid, type, output) => {
          // print terminal output in console
          if (output.split("\n").includes("__ext_close__\r") && !debug.debug) {
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
