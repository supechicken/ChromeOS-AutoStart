<p align="center"><img src="/icon.png" alt="logo" /></p>
<h1 align="center">ChromeOS Autostart</h1>

## An extension for running shell command at ChromeOS startup automatically without removing RootFS verification.

## Installation
#### This extension may conflict with dev version of Secure Shell extension, you may need to remove dev version of Secure Shell (if installed)

- Download [archive](https://github.com/supechicken/ChromeOS-AutoStart/archive/refs/tags/v2.2.1.zip) of this repository and unzip it
- Go to chrome://extensions/ and enable Developer Mode
- Click `Load unpacked extension` and select the `ChromeOS-AutoStart-main` unzipped folder
- A new window will appear and type the command you want to run it at startup
- Optional: Click the `Test` button to test it out after setting a command

## How does it works?

There is a Chrome extension API called `chrome.terminalPrivate` which can be used to execute crosh commands (and shell commands), and it is only available on some extensions that made by Google (Secure Shell, Chromebook Recovery Utility, etc). However, we can use one of those extension's ID key to get the access of that API. (this extension used the key from Secure Shell)

The `chrome.runtime.onStartup` function is used to start the terminal API above automatically when Chrome UI start.
