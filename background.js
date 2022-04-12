// dark mode icon handler
chrome.runtime.onMessage.addListener( (e) => {
  if (request.scheme == 'dark') {
      chrome.browserAction.setIcon({
        path: { '170': 'icon-dark.png' }
      });
  }
});

// open run.html (used to execute command via terminalPrivate API) at login
chrome.runtime.onStartup.addListener( () => {
    chrome.windows.create({url: "run.html", type: 'popup', state: 'minimized', height: 200, width: 200})
});

// prompt user to enter a command after install
chrome.runtime.onInstalled.addListener( (i) => {
    if (i.reason == 'install') {
        chrome.windows.create({url: 'option.html', type: 'popup', height: 300, width: 310})
    }
});
