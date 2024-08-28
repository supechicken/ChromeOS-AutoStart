const url_params       = new URLSearchParams(location.search),
      cancelBtn        = document.getElementById('cancelBtn'),
      saveBtn          = document.getElementById('saveBtn'),
      cmdBox           = document.getElementById('cmdBox'),
      cmdBox_prompt    = document.getElementById('cmdBox_prompt'),
      options_fieldset = document.getElementById('options_fieldset'),
      userName         = document.getElementById('userName'),
      crosvm_fieldset  = document.getElementById('crosvm_fieldset'),
      vmName           = document.getElementById('vmName'),
      containerName    = document.getElementById('containerName');

document.querySelectorAll('input[name="autostart_type"]').forEach(e => {
  e.onchange = () => {
    // only crosh does not support bash syntax
    cmdBox_prompt.innerText = (e.checked && e.value == 'crosh') ? 'Commands' : 'Commands (Bash syntax supported)';

    // enable VM/container name input box only when vmshell is selected
    vmName.value        = 'termina';
    containerName.value = 'penguin';

    if (e.checked && e.value == 'vmshell') {
      crosvm_fieldset.classList.remove('disabled_fieldset');
      vmName.disabled = containerName.disabled = false;
    } else {
      crosvm_fieldset.classList.add('disabled_fieldset');
      vmName.disabled = containerName.disabled = true;
    }

    // enable user name input box only when crosh is NOT selected
    if (e.checked && e.value == 'crosh') {
      options_fieldset.classList.add('disabled_fieldset');
      userName.disabled = true;
    } else {
      options_fieldset.classList.remove('disabled_fieldset');
      userName.disabled = false;
    }
  };
});

// close the window if user cancelled
cancelBtn.onclick = () => window.close();

// save entry to local storage
saveBtn.onclick = async () => {
  const localStorage     = await chrome.storage.local.get(['autostartEntries']),
        autostartEntries = localStorage.autostartEntries || [],
        autostart_type   = document.querySelector('input[name="autostart_type"]:checked')?.value;

  if (url_params.get('edit') === '1') {
    const entry_index = parseInt(url_params.get('entry'));
    let   newEntries  = localStorage.autostartEntries;

    newEntries[entry_index] = {
      type:          autostart_type,
      userName:      (userName.value.trim() === '') ? null : userName.value,
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
        userName:      (userName.value.trim() === '') ? null : userName.value,
        vmName:        (autostart_type === 'vmshell') ? vmName.value : null,
        containerName: (autostart_type === 'vmshell') ? containerName.value : null,
        cmd:           cmdBox.value
      }])
    }, () => window.close()); // close window when completed
  }
};

window.onload = async () => {
  if (url_params.get('edit') === '1') {
    const localStorage  = await chrome.storage.local.get(['autostartEntries']),
          entry_index   = parseInt(url_params.get('entry')),
          entry_to_edit = localStorage.autostartEntries[entry_index],
          radioBtn      = document.getElementById(entry_to_edit.type);

    document.title   = 'Edit existing entry';
    radioBtn.checked = true;
    userName.value   = entry_to_edit.userName;
    cmdBox.value     = entry_to_edit.cmd;

    radioBtn.onchange();

    if (entry_to_edit.type === 'vmshell') {
      vmName.value        = entry_to_edit.vmName;
      containerName.value = entry_to_edit.containerName;
    }
  }
}
