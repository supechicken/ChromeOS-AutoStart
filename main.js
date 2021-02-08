chrome.storage.local.get('start', function(data) {
    chrome.terminalPrivate.onProcessOutput.addListener(processListener);
    chrome.terminalPrivate.openTerminalProcess('crosh', (pid) => {
        const cmd1 = '\n\nshell\n',
              cmd2 = `\n\n$(${data.start})\n`;
    
        if (pid < 0) {
            window.alert("error!");
        }

        chrome.terminalPrivate.sendInput(pid, cmd1);
        chrome.terminalPrivate.sendInput(pid, cmd2);
        window.alert(data.start);
    });
    function processListener(pid, type, text){
        console.log(text);
    }

    setTimeout(() => {  chrome.tabs.getCurrent( (tab) => { chrome.tabs.remove(tab.id) }) }, 10000);
});
