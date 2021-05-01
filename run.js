// run.js: execute command set in option page

chrome.storage.local.get('debug', (debug) => {
    chrome.storage.local.get('start', (cmd) => {
        chrome.terminalPrivate.onProcessOutput.addListener(processListener);
        // open a terminal
        chrome.terminalPrivate.openTerminalProcess('crosh', (pid) => {
            if (pid < 0) { alert("error!") }

            chrome.terminalPrivate.sendInput(pid, '\n\nshell\n\nexport PS1="$ "\n\n');
            chrome.terminalPrivate.sendInput(pid,
                // prevent unexpected newline
                `\n\nsh -c "$(tr -d '\n' <<< '${cmd.start}')"\n`
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