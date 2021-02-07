chrome.runtime.onStartup.addListener(function() {
    chrome.windows.create({url: "/start.html", type: 'normal', state: 'minimized'})
});
chrome.runtime.onInstalled.addListener(function(i) {
    if (i.reason == 'install') {
        chrome.tabs.create({url: "/option.html"})
}})
