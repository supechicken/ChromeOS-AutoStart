import { printLog } from './shared/functions.js';

const github_repo = 'supechicken/ChromeOS-AutoStart',
      update_url  = `https://raw.githubusercontent.com/${github_repo}/main/update.json`,
      release_url = `https://github.com/${github_repo}/releases/latest`,
      url_params  = new URLSearchParams(location.search),
      manifest    = chrome.runtime.getManifest(),
      statusText  = document.getElementById('statusText'),
      description = document.getElementById('description'),
      btnList     = document.getElementById('btnList'),
      askBtnList  = document.getElementById('askBtnList'),
      rejectBtn   = document.getElementById('rejectBtn'),
      agreeBtn    = document.getElementById('agreeBtn'),
      closeBtn    = document.getElementById('closeBtn'),
      latestBtn   = document.getElementById('latestBtn');

rejectBtn.onclick = () => chrome.storage.local.set({ autoCheckUpdate: false }, () => window.close());
agreeBtn.onclick  = () => chrome.storage.local.set({ autoCheckUpdate: true }, () => window.close());

closeBtn.onclick  = () => window.close();
latestBtn.onclick = () => chrome.tabs.create({ url: release_url }, () => window.close());

window.onload = async () => {
  // ask for enabling update check instead of check update
  if (url_params.get('askUpdateCheck') === '1') {
    statusText.innerText     = `Auto update check`;
    description.innerText    = `Check update automatically at startup?`;
    askBtnList.style.display = 'initial';
    btnList.style.display    = 'none';
    return;
  }

  // fetch latest version info
  const latest = await fetch(update_url).then(response => response.json()).catch(err => {
    statusText.innerText  = `Failed to check update`;
    description.innerText = `Failed to fetch release infomation from GitHub.`;

    if (url_params.get('autoclose') === '1') {
      window.close();
    } else {
      throw new Error(err);
    }
  });

  if (url_params.get('forceAvailableUpdate') != '1' && latest.latest_version === manifest.version) {
    statusText.innerText  = `No update found`;
    description.innerText = `You are using the latest version of ChromeOS AutoStart.`;

    // close this page if no update available
    if (url_params.get('autoclose') === '1') window.close();
  } else {
    // update available
    // unminimize this window
    chrome.windows.getCurrent(currentWindow => chrome.windows.update(currentWindow.id, {
      height:  250,
      width:   450,
      focused: true
    }));

    statusText.innerText  = 'Update available!';
    description.innerText = `ChromeOS AutoStart version ${latest.latest_version} is available now.`
    printLog(`Update available: version ${latest.latest_version}`);
  }
};
