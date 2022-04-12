chrome.runtime.onStartup.addListener( () => {
    chrome.windows.create({url: "run.html", type: 'popup', state: 'minimized', height: 200, width: 200})
});

chrome.runtime.onInstalled.addListener( (i) => {
    if (i.reason == 'install') {
        chrome.windows.create({url: 'option.html', type: 'popup', height: 300, width: 310})
    }
});