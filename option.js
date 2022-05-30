window.onload = () => {
  chrome.storage.local.get(['start', 'debug'], localStorage => {
    // print current startup command if set
    document.getElementById('current_cmd').innerText = `Current startup command: ${localStorage.start || 'not set'}`;

    // restore checkbox value
    document.getElementById('debug').checked = localStorage.debug;
  });
}

function storeCmdToStorage () {
  const autostart = document.getElementById('new_cmd').value;
  chrome.storage.local.set( { start: autostart }, () => alert(`Command set: ${autostart}`) );
}

document.getElementById('new_cmd').onkeyup = (e) => {
  if (e.key == 'Enter') storeCmdToStorage();
}

document.getElementById('enter').onclick = () => storeCmdToStorage();

document.getElementById('clear').onclick = () => {
  // reset settings
  chrome.storage.local.clear(() => alert('Clear'));
}

document.getElementById('test').onclick = () => {
  chrome.windows.create({ url: '/run.html', type: 'popup', height: 200, width: 200 });
}

document.getElementById('debug').onchange = (e) => {
  const element = e.currentTarget;
  chrome.storage.local.set({ debug: element.checked });
}