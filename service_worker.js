chrome.runtime.onStartup.addListener(async () => {
  const localStorage = await chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose', 'autoCheckUpdate']);

  // check for extension update
  if (localStorage.autoCheckUpdate) {
    chrome.windows.create({
      url:    '/html/check_update.html?autoclose=1',
      type:   'popup',
      state:  'minimized'
    });
  }

  // open html/autoStart.html (used to execute command via terminalPrivate API) at login
  chrome.windows.create({
    url:   '/html/autostart.html',
    type:  'popup',
    state: 'minimized'
  });
});

chrome.runtime.onInstalled.addListener(async i => {
  const localStorage = await chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose', 'autoCheckUpdate']);

  if (localStorage.autoCheckUpdate === undefined) {
    // ask user for enabling auto update check
    await new Promise(resolve => {
      chrome.windows.create({
        url:    '/html/check_update.html?askUpdateCheck=1',
        type:   'popup',
        height:  250,
        width:   450
      }, window => {
        // wait for user selection
        const listener = windowId => {
          if (windowId === window.id) {
            chrome.windows.onRemoved.removeListener(listener);
            resolve();
          }
        };

        chrome.windows.onRemoved.addListener(listener);
      });
    });
  }

  switch (i.reason) {
    case 'update':
      if (i.previousVersion.localeCompare("5.0.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0) {
        chrome.storage.local.set({ showNotification: true, autoClose: true });
      } else {
        chrome.storage.local.set({ autostartEntries: [], showNotification: true, autoClose: true });
        chrome.windows.create({ url: '/html/list_entries.html', type: 'popup', height: 600, width: 700 });
      }
      break;
    case 'install':
      // prompt user to enter a command after install
      chrome.storage.local.set({ autostartEntries: [], showNotification: true, autoClose: true });
      chrome.windows.create({ url: '/html/list_entries.html', type: 'popup', height: 600, width: 700 });
      break;
  }
});
