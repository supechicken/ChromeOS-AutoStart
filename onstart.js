chrome.runtime.onStartup.addListener(function() {
    chrome.windows.create({url: "/run.html", type: 'popup', state: 'minimized'})
});
chrome.runtime.onInstalled.addListener(function(i) {
    if (i.reason == 'install') {
        chrome.windows.create({url: '/option.html', type: 'popup'})
}})
