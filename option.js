chrome.storage.local.get('start', data => {
  // print current startup command if set
  if (data.start) {
    document.getElementById('current_cmd').innerText = `Current startup command: '${data.start}'`
  }
});

document.getElementById('enter').onclick = () => {
  const autostart = document.getElementById('new_cmd').value,
            debug = document.getElementById('debug').checked;

  chrome.storage.local.set(
    { 'start': autostart, 'debug': debug },
    () => alert(`Command set: ${autostart}`)
  );
};

document.getElementById('clear').onclick = () => {
  // reset settings
  chrome.storage.local.clear(() => alert('Clear'))
}

document.getElementById('test').onclick = () => {
  chrome.windows.create({ url: '/run.html', type: 'popup', height: 200, width: 200 });
};