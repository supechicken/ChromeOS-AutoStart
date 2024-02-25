// open html/autoStart.html (used to execute command via terminalPrivate API) at login
chrome.runtime.onStartup.addListener(() => {
  chrome.windows.create({ url: "/html/autoStart.html", type: 'popup', state: 'minimized' });
});

// prompt user to enter a command after install
chrome.runtime.onInstalled.addListener(i => {
  if (i.reason == 'install') {
    chrome.storage.local.set({ autostart_entries: [] });
    chrome.windows.create({ url: '/html/listEntries.html', type: 'popup', height: 600, width: 700 });
  }
});
