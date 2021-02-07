chrome.runtime.onStartup.addListener(function() {
  chrome.windows.create({url: "/start.html", type: 'normal', state: 'minimized'})
})