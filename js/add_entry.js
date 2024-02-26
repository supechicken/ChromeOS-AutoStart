const url_params    = new URLSearchParams(location.search),
      cancelBtn     = document.getElementById('cancelBtn'),
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
    vmName.value        = 'termina';
    containerName.value = 'penguin';

    vmName.disabled = containerName.disabled = !(e.checked && e.value == 'vmshell');
  };
});

// close the window if user cancelled
cancelBtn.onclick = () => window.close();

// save entry to local storage
saveBtn.onclick = async () => {
  const localStorage     = await new Promise(r => chrome.storage.local.get(['autostartEntries'], c => r(c))),
        autostartEntries = localStorage.autostartEntries || [],
        autostart_type   = document.querySelector('input[name="autostart_type"]:checked')?.value;

  if (url_params.get('edit') === '1') {
    const entry_index = parseInt(url_params.get('entry'));
    let   newEntries  = localStorage.autostartEntries;

    newEntries[entry_index] = {
      type:          autostart_type,
      vmName:        (autostart_type === 'vmshell') ? vmName.value : null,
      containerName: (autostart_type === 'vmshell') ? containerName.value : null,
      cmd:           cmdBox.value
    }

    // close window when completed
    chrome.storage.local.set({ autostartEntries: newEntries }, () => window.close());
  } else {
    chrome.storage.local.set({
      autostartEntries: autostartEntries.concat([{
        type:          autostart_type,
        vmName:        (autostart_type === 'vmshell') ? vmName.value : null,
        containerName: (autostart_type === 'vmshell') ? containerName.value : null,
        cmd:           cmdBox.value
      }])
    }, () => window.close()); // close window when completed
  }
};

window.onload = async () => {
  if (url_params.get('edit') === '1') {
    const localStorage  = await new Promise(r => chrome.storage.local.get(['autostartEntries'], c => r(c))),
          entry_index   = parseInt(url_params.get('entry')),
          entry_to_edit = localStorage.autostartEntries[entry_index],
          radioBtn      = document.getElementById(entry_to_edit.type);

    document.title   = 'Edit existing entry';
    radioBtn.checked = true;
    cmdBox.value     = entry_to_edit.cmd;

    radioBtn.onchange();

    if (entry_to_edit.type === 'vmshell') {
      vmName.value        = entry_to_edit.vmName;
      containerName.value = entry_to_edit.containerName;
    }
  }
}