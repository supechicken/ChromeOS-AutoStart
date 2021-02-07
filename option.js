chrome.storage.local.get('start', function(data) {
    if (data.start) {
        window.alert(`Current startup command: ${data.start}`)
    }
});

document.getElementById('button1').onclick = function onPressed() {
    const autostart=document.getElementById('autostart_1').value;
    chrome.storage.local.set({'start': autostart}, function () { window.alert(`Command set: ${autostart}`) });
};

document.getElementById('button2').onclick = function() {
    chrome.storage.local.clear(function() { console.log('Clear') })
}