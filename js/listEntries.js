const testBtn      = document.getElementById('testBtn'),
      addEntryBtn  = document.getElementById('addEntryBtn'),
      totalEntries = document.getElementById('totalEntries'),
      entryNode    = new DOMParser().parseFromString(`
        <div class="entry">
          <button class="deleteBtn">Delete</button>
          <table>
            <tr>
              <td>Type: </td>
              <td class="type"></td>
            </tr>
            <tr class="vm_name_tr" style="display: none;">
              <td>VM name: </td>
              <td class="vm_name monospace"></td>
            </tr>
            <tr class="container_name_tr" style="display: none;">
              <td>Container name: </td>
              <td class="container_name monospace"></td>
            </tr>
          </table>

          <br/>
          <details>
            <summary>Command list</summary>
            <textarea class="cmdBox" readonly></textarea>
          </details>
        </div>`, "text/html").body.firstChild;

async function removeEntry(entry) {
  // removeEntry(): remove specific autostart entry from storage
  const localStorage = await new Promise(resolve => chrome.storage.local.get(['autostart_entries'], callback => resolve(callback))),
        newEntries   = localStorage.autostart_entries.filter(e => JSON.stringify(e) !== JSON.stringify(entry));

  chrome.storage.local.set({ autostart_entries: newEntries });
}

// button actions
testBtn.onclick     = () => chrome.windows.create({ url: '/html/autoStart.html?noClose=1', type: 'popup' });
addEntryBtn.onclick = () => {
  chrome.windows.create({ url: '/html/addEntry.html', type: 'popup', height: 465, width: 640 }, window => {
    // reload after addEntry.html closed
    const listener = windowId => {
      if (windowId === window.id) {
        chrome.windows.onRemoved.removeListener(listener);
        location.reload();
      }
    };

    chrome.windows.onRemoved.addListener(listener);
  })
};

window.onload = async () => {
  const localStorage = await new Promise(resolve => chrome.storage.local.get(['autostart_entries'], callback => resolve(callback)));
  let   friendly_type;

  // show total entries
  totalEntries.innerText = `${localStorage.autostart_entries.length} entries added`;

  localStorage.autostart_entries.forEach(entry => {
    const newDiv = entryNode.cloneNode(true);

    // set friendly description based on the saved type
    switch (entry.type) {
      case 'crosh':
        friendly_type = 'ChromeOS shell (crosh)';
        break;
      case 'devshell':
        friendly_type = 'Developer mode shell';
        break;
      case 'vmshell':
        friendly_type = 'ChromeOS VM (crosvm)';
        break;
    }

    newDiv.querySelector('.type').innerText    = friendly_type;
    newDiv.querySelector('.cmdbox').value      = entry.cmd;
    newDiv.querySelector('.deleteBtn').onclick = () => {
      // remove an entry
      if (confirm("Delete this entry?")) {
        removeEntry(entry);
        location.reload();
      }
    }

    // show VM and container name for crosvm
    if (entry.type === 'vmshell') {
      newDiv.querySelector('.vm_name_tr').style.display        = 'table-row';
      newDiv.querySelector('.container_name_tr').style.display = 'table-row';
      newDiv.querySelector('.vm_name').innerText               = entry.vmName;
      newDiv.querySelector('.container_name').innerText        = entry.containerName;
    }

    document.body.appendChild(newDiv);
  });
};