chrome.runtime.onStartup.addListener( () => {
    chrome.windows.create({url: "/run.html", type: 'popup', state: 'minimized'})
});
chrome.runtime.onInstalled.addListener( (i) => {
    if (i.reason == 'install') {
        chrome.windows.create({url: '/option.html', type: 'popup', height: 221, width: 230})
}})
