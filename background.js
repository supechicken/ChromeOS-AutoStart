// dark mode icon handler
chrome.runtime.onMessage.addListener( (e) => {
  if (e.scheme == 'dark') {
    chrome.browserAction.setIcon({ path: '/icon-dark_38x38.png' });
  }
});

// open run.html (used to execute command via terminalPrivate API) at login
chrome.runtime.onStartup.addListener( () => {
    chrome.windows.create({url: "run.html", type: 'popup', state: 'minimized'})
});

// prompt user to enter a command after install
chrome.runtime.onInstalled.addListener( (i) => {
    if (i.reason == 'install') {
        chrome.windows.create({url: 'option.html', type: 'popup', height: 300, width: 310})
    }
});
