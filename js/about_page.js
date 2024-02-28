const manifest       = chrome.runtime.getManifest(),
      verText        = document.getElementById('ver'),
      changelogBox   = document.getElementById('changelog_textbox'),
      pageBtn        = document.getElementById('pageBtn'),
      checkUpdateBtn = document.getElementById('checkUpdateBtn');

pageBtn.onclick        = () => chrome.tabs.create({ url: manifest.homepage_url });
checkUpdateBtn.onclick = () => {
  chrome.windows.create({
    url:    '/html/check_update.html',
    type:   'popup',
    height: 250,
    width:  450
  });
}

window.onload = async () => {
  const verInfo   = await fetch('/update.json').then(r => r.json()),
        changelog = await fetch('/changelog.md').then(r => r.text());

  verText.innerText  = `Version ${manifest.version} (${verInfo.release_date})`;
  changelogBox.value = changelog;
};