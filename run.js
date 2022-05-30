// run.js: execute command set in option page

const magic_word = '\x00__ext_close__\x00',  // a string for telling the extension all commands were run successfully
      decoder = new TextDecoder('utf-8'); // for decoding ArrayBuffer output on Chrome OS 100+

let crosh_pid;

chrome.storage.local.get(['debug', 'start'], (localStorage) => {
  const debug = localStorage.debug,
        cmd = localStorage.start;

  chrome.terminalPrivate.onProcessOutput.addListener((pid, type, data) => {
    if (pid != crosh_pid) return false // only print output of the crosh process we have started

    // on Chrome OS 100+, the onProcessOutput function will return an ArrayBuffer object instead of a string,
    // we need to convert it to string if an ArrayBuffer is returned.
    //
    // For more info, see https://chromium-review.googlesource.com/c/apps/libapps/+/3470612/
    const output = (data instanceof ArrayBuffer) ? decoder.decode(data) : data;

    // print terminal output in console
    if (output.match(new RegExp(magic_word)) && !debug) {
      // close terminal process
      chrome.terminalPrivate.closeTerminalProcess(pid);

      // close self after sending commands to terminal
      chrome.windows.getCurrent(window => chrome.windows.remove(window.id));
    }

    // print process output with all special char escaped (except ${cmd} as all output of 
    // ${cmd} are redirected to `/tmp/ChromeOS-AutoStart.log`)
    console.log('[process output]:', JSON.stringify(output));
  });

  // open a terminal process, run specific command
  chrome.terminalPrivate.openTerminalProcess('crosh', pid => {
    if (pid < 0) alert('Error: cannot open crosh!');

    crosh_pid = pid; // store pid for sendInput and onProcessOutput
    console.log('[debug]:', `Process ${pid} started`);

    chrome.terminalPrivate.sendInput(pid, `
      shell                                            # enter system shell
      set +o history                                   # disable history log

      nohup ${cmd} > /tmp/ChromeOS-AutoStart.log       # run specific command in background, redirect output to a file
                                                       # (/tmp/ChromeOS-AutoStart.log)

      echo -e "\\x00${magic_word}\\x00"                # tell extension to close this process
      exit 0                                           # exit system shell
    `)
  });
});