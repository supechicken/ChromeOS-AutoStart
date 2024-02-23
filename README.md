<div align="center">
  <img src="/img/icon.svg" alt="logo" />
  <h1>ChromeOS Autostart</h1>
  <p>A Chrome extension for running crosh commands at ChromeOS startup, without the need of developer mode</p>
</div>

## What can it do?
#### If you are using Crostini, you can...
- Run Linux commands in Crostini when ChromeOS boots
- Start `termina` (the underlying VM of Crostini) with custom kernel and kernel parameters

#### If you are in ChromeOS developer mode, you can...
- Run shell commands on ChromeOS boots
- Enter your crouton chroot right after logging in

## Installation
> [!IMPORTANT]
> This extension conflicts with [Secure Shell extension](https://chrome.google.com/webstore/detail/iodihamcpbpeioajjeobimgagajmlibd). (as this extension [used its ID](#How-does-it-works))
>
> Please remove it before installing this extension (if installed), otherwise this extension might not work as expected

- Download [archive](https://github.com/supechicken/ChromeOS-AutoStart/archive/refs/tags/v3.0.1.zip) of this repository and unzip it
- Go to `chrome://extensions` and enable Developer Mode
- Click `Load unpacked extension` and select the `ChromeOS-AutoStart-main` unzipped folder
- A new window will appear and type the command you want to run it at startup
- Optional: Click the `Test` button to test it out after setting a command

<em>* Please do not delete the unzipped folder after loading the extension, otherwise the extension will get deleted after reboot</em>

## How does it works?

There is a Chrome extension API called `chrome.terminalPrivate` which can be used to interact with the `crosh` shell, and it is only available on some extensions that are
made by Google (Secure Shell, Chromebook Recovery Utility, etc). However, we can use one of those extension's ID keys to get access to that API. (key from Secure Shell is used in this extension)

The `chrome.runtime.onStartup` listener is used to start the terminal API above automatically when ChromeOS UI starts.
