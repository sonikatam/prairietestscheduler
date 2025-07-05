# Installing the PrairieTest Monitor Extension

## Method 1: Load Unpacked Extension (Development)

1. **Download the extension files**

   - Download all files from the `extension/` folder
   - Keep the folder structure intact

2. **Open Chrome Extensions**

   - Go to `chrome://extensions/`
   - Or navigate: Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top right

4. **Load the Extension**

   - Click "Load unpacked"
   - Select the `extension/` folder containing all the files
   - The extension should appear in your extensions list

5. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "PrairieTest Monitor" and click the pin icon

## Method 2: Create Icons (Required)

Before the extension will work properly, you need to create icon files:

1. **Create icon files** in the `extension/icons/` folder:

   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. **Quick icon creation:**
   - Use any image editor (Canva, Figma, GIMP)
   - Create a simple design with "PT" text
   - Save in PNG format at the required sizes
   - Place in the `icons/` folder

## Method 3: Chrome Web Store (Future)

Once the extension is polished, you can publish it to the Chrome Web Store:

1. **Create a developer account** at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Package the extension** as a .zip file
3. **Upload and submit** for review
4. **Users can then install** directly from the store

## Using the Extension

1. **Navigate to PrairieTest**

   - Go to https://us.prairietest.com/
   - Log in with your school credentials

2. **Open the Extension**

   - Click the extension icon in your toolbar
   - Configure your desired slot criteria

3. **Start Monitoring**

   - Enter your notification email
   - Set your preferred date/time/location
   - Click "Start Monitoring"

4. **Get Notifications**
   - The extension will check for slots every few minutes
   - You'll get browser notifications when slots are found
   - Click notifications to go directly to PrairieTest

## Troubleshooting

### Extension Not Loading

- Make sure all files are in the correct folder structure
- Check that `manifest.json` is in the root of the extension folder
- Verify all required files are present

### Icons Not Showing

- Create the required icon files in the `icons/` folder
- Make sure they're PNG format
- Check file names match exactly

### Extension Not Working

- Ensure you're on a PrairieTest page
- Check that you're logged into PrairieTest
- Look at the extension popup for error messages
- Check Chrome's developer console for errors

### Notifications Not Working

- Check Chrome's notification permissions
- Go to Chrome Settings → Privacy and Security → Site Settings → Notifications
- Ensure PrairieTest Monitor is allowed

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── background.js          # Background service worker
├── content.js            # Content script for PrairieTest pages
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── INSTALL.md            # This file
```

## Development Notes

- The extension uses Manifest V3 (latest Chrome extension standard)
- Background script runs as a service worker
- Content script injects into PrairieTest pages
- Settings are stored in Chrome's sync storage
- Notifications use Chrome's native notification API

## Security

- The extension only accesses PrairieTest domains
- No personal data is collected or transmitted
- All processing happens locally in your browser
- Settings are stored securely in Chrome's storage
