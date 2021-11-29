// run.js: execute command set in option page

chrome.storage.local.get('debug', (debug) => {
    chrome.storage.local.get('start', (cmd) => {
        chrome.terminalPrivate.onProcessOutput.addListener(processListener);
        // open a terminal
        chrome.terminalPrivate.openTerminalProcess('crosh', (pid) => {
            if (pid < 0) { alert('Error: cannot open crosh!') }

            chrome.terminalPrivate.sendInput(pid, 'shell\n');
            chrome.terminalPrivate.sendInput(pid,
                // prevent unexpected newline
                `exec nohup bash <<_CMD_\n${cmd.start}\n_CMD_\n`
            );
        });
        
        function processListener(pid, type, output) {
            // print terminal output in console
            console.log(output);
        }

        // close self after sending commands to terminal
        if (!debug.debug) {
            setTimeout( () => {
                chrome.windows.getCurrent( (window) => {
                    chrome.windows.remove(window.id)
                } ) 
            }, 1000);
        }
    });
});
