const manageBtn        = document.getElementById('manageBtn'),
      checkUpdateBtn   = document.getElementById('checkUpdateBtn'),
      aboutBtn         = document.getElementById('aboutBtn'),
      autoClose        = document.getElementById('autoClose'),
      showNotification = document.getElementById('showNotification'),
      totalEntries     = document.getElementById('totalEntries');

// autostart options
showNotification.onchange = () => chrome.storage.local.set({ showNotification: showNotification.checked });
autoClose.onchange        = () => chrome.storage.local.set({ autoClose: autoClose.checked });

manageBtn.onclick = () => {
  chrome.windows.create({
    url:    '/html/list_entries.html',
    type:   'popup',
    height: 600,
    width:  700
  });
};

checkUpdateBtn.onclick = () => {
  chrome.windows.create({
    url:    '/html/check_update.html',
    type:   'popup',
    height: 250,
    width:  450
  });
};

aboutBtn.onclick = () => {
  chrome.windows.create({
    url:    '/html/about_page.html',
    type:   'popup',
    height: 550,
    width:  500
  });
};

window.onload = async () => {
  const localStorage = await chrome.storage.local.get(['showNotification', 'autoClose']);

  // show options
  showNotification.checked = localStorage.showNotification;
  autoClose.checked        = localStorage.autoClose;
};
