const cancelBtn     = document.getElementById('cancelBtn'),
      saveBtn       = document.getElementById('saveBtn'),
      cmdBox        = document.getElementById('cmdBox'),
      cmdBox_prompt = document.getElementById('cmdBox_prompt'),
      vmName        = document.getElementById('vmName'),
      containerName = document.getElementById('containerName');

document.querySelectorAll('input[name="autostart_type"]').forEach(e => {
  e.onchange = () => {
    // only crosh does not support bash syntax
    cmdBox_prompt.innerText = (e.checked && e.value == 'crosh') ? 'Commands' : 'Commands (Bash syntax supported)';

    // enable VM/container name input box only when vmshell is selected
    vmName.disabled = containerName.disabled = !(e.checked && e.value == 'vmshell');
  };
});

// close the window if user cancelled
cancelBtn.onclick = () => window.close();

// save entry to local storage
saveBtn.onclick = async () => {
  const localStorage      = await new Promise(resolve => chrome.storage.local.get(['autostart_entries'], callback => resolve(callback))),
        autostart_entries = localStorage.autostart_entries || [],
        autostart_type    = document.querySelector('input[name="autostart_type"]:checked')?.value;

  chrome.storage.local.set({
    autostart_entries: autostart_entries.concat([{
      type:          autostart_type,
      vmName:        (autostart_type === 'vmshell') ? vmName.value : null,
      containerName: (autostart_type === 'vmshell') ? containerName.value : null,
      cmd:           cmdBox.value
    }])
  }, () => window.close()); // close window when completed
};