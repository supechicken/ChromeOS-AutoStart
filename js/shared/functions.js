export function printLog(message, io = null, newline = true) {
  // printLog(): print to both browser console and hterm
  if (message instanceof Array) {
    message.forEach(m => {
      console.log('[ChromeOS-AutoStart]:', m);
      if (io) io.println('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + m + '\x1b[0m');
    });
  } else {
    console.log('[ChromeOS-AutoStart]:', message);
    if (io) {
      if (newline) {
        io.println('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + message + '\x1b[0m');
      } else {
        io.print('\x1b[0;93m' + '[ChromeOS-AutoStart]: ' + message + '\x1b[0m');
      }
    }
  }
}