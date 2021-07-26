<p align="center"><img src="/icon.png" alt="logo" /></p>
<h1 align="center">ChromeOS Autostart</h1>

## An extension for running shell command at ChromeOS startup automatically without remounting root filesystem as read/write.

## Installation
### This extension may conflict with dev version of Secure Shell extension, you may need to remove dev version of Secure Shell (if installed)

- Download [archive](https://github.com/supechicken/ChromeOS-AutoStart/archive/main.zip) of this repository and unzip it
- Unpack the zip file by:
  - Double click the zip file in the file manager. The zip file will show contents in what looks like a flash drive
  - Drag the folder within the zip file into the Downloads folder
  - Optionally delete the zip file
- Go to [chrome://extensions](chrome://extensions) and enable Developer Mode
- Click "Pack Extension", click "Browse" under "Extension Root Directory", then click on the folder named `ChromeOS-AutoStart-main`, and click "Open"
- Click "Pack Extension", then click "Okay"
- Open the file manager, go to Downloads and drag the `.crx` file into the chrome://extensions window.
- Click "Add Extension"
- Optionally delete the generated `.crx` packaged file and `.pem` key file
