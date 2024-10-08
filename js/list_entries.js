const testBtn          = document.getElementById('testBtn'),
      addEntryBtn      = document.getElementById('addEntryBtn'),
      autoClose        = document.getElementById('autoClose'),
      showNotification = document.getElementById('showNotification'),
      totalEntries     = document.getElementById('totalEntries'),
      entryNode        = new DOMParser().parseFromString(`
        <div class="entry">
          <div class="btnList">
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
          </div>
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
            <tr class="user_name_tr" style="display: none;">
              <td>Run as user: </td>
              <td class="user_name monospace"></td>
            </tr>
          </table>

          <br/>
          <details>
            <summary>Command list</summary>
            <textarea class="cmdBox" spellcheck="false" readonly></textarea>
          </details>
        </div>`, "text/html").body.firstChild;

async function removeEntry(entry) {
  // removeEntry(): remove specific autostart entry from storage
  const localStorage = await chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose']),
        newEntries   = localStorage.autostartEntries.filter(e => JSON.stringify(e) !== JSON.stringify(entry));

  chrome.storage.local.set({ autostartEntries: newEntries });
}

// autostart options
showNotification.onchange = () => chrome.storage.local.set({ showNotification: showNotification.checked });
autoClose.onchange        = () => chrome.storage.local.set({ autoClose: autoClose.checked });

// button actions
testBtn.onclick     = () => chrome.windows.create({ url: '/html/autostart.html?noclose=1', type: 'popup', width: 940, height: 700 });
addEntryBtn.onclick = () => {
  chrome.windows.create({ url: '/html/add_entry.html', type: 'popup', height: 535, width: 640 }, window => {
    // reload after add_entry.html closed
    const listener = windowId => {
      if (windowId === window.id) {
        chrome.windows.onRemoved.removeListener(listener);
        location.reload();
      }
    };

    chrome.windows.onRemoved.addListener(listener);
  });
};

window.onload = async () => {
  const localStorage = await chrome.storage.local.get(['autostartEntries', 'showNotification', 'autoClose']);
  let   friendly_type;

  // show options
  showNotification.checked = localStorage.showNotification;
  autoClose.checked        = localStorage.autoClose;

  // show total entries
  totalEntries.innerText = `${localStorage.autostartEntries.length} entries added`;

  localStorage.autostartEntries.forEach((entry, i) => {
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

    newDiv.querySelector('.type').innerText = friendly_type;
    newDiv.querySelector('.cmdbox').value   = entry.cmd;

    newDiv.querySelector('.editBtn').onclick = () => {
      chrome.windows.create({ url: `/html/add_entry.html?edit=1&entry=${i}`, type: 'popup', height: 535, width: 640 }, window => {
        // reload after add_entry.html closed
        const listener = windowId => {
          if (windowId === window.id) {
            chrome.windows.onRemoved.removeListener(listener);
            location.reload();
          }
        };

        chrome.windows.onRemoved.addListener(listener);
      });
    };

    newDiv.querySelector('.deleteBtn').onclick = () => {
      // remove an entry
      if (confirm("Delete this entry?")) {
        removeEntry(entry);
        location.reload();
      }
    };

    switch (entry.type) {
      case 'vmshell':
        // show VM and container name for crosvm
        newDiv.querySelector('.vm_name_tr').style.display        = 'table-row';
        newDiv.querySelector('.container_name_tr').style.display = 'table-row';
        newDiv.querySelector('.vm_name').innerText               = entry.vmName;
        newDiv.querySelector('.container_name').innerText        = entry.containerName;
      case 'devshell':
      case 'vmshell':
        // show run as user
        newDiv.querySelector('.user_name_tr').style.display = 'table-row';
        newDiv.querySelector('.user_name').innerText        = (entry.userName) ? entry.userName : '<default user>';
    }

    document.getElementById('entryList').appendChild(newDiv);
  });
};
