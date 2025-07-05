# PrairieTest Monitor - Chrome Extension 🎯

A Chrome extension that automatically monitors [PrairieTest](https://us.prairietest.com/) for available exam slots and sends notifications when spots become available.

## ✨ Features

- 🔐 **Automatic Detection**: Works with your existing PrairieTest login
- 🔍 **Smart Monitoring**: Detects available slots in real-time
- 📧 **Email Notifications**: Sends alerts when slots match your criteria
- ⚙️ **Easy Configuration**: Simple popup interface to set preferences
- 🛡️ **Privacy First**: All processing happens locally in your browser
- 📱 **Browser Notifications**: Instant alerts even when browsing other sites

## 🚀 Quick Start

### 1. Install the Extension

**Option A: Load Unpacked (Development)**

1. Download all files from the `extension/` folder
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Pin the extension to your toolbar

**Option B: Chrome Web Store (Coming Soon)**

- Install directly from the Chrome Web Store (when published)

### 2. Create Icons (Required)

Before using, create icon files in `extension/icons/`:

- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Quick icon creation:

- Use [Canva](https://canva.com) or [Figma](https://figma.com)
- Create a simple design with "PT" text
- Save as PNG at the required sizes

### 3. Configure and Use

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

## 🎛️ Configuration Options

### Slot Criteria

- **Date**: Specific date (leave empty for any date)
- **Time**: Specific time (leave empty for any time)
- **Location**: Specific testing center (optional)

### Monitoring Settings

- **Check Interval**: How often to check (1-15 minutes)
- **Notification Email**: Email for alerts
- **Auto-stop**: Optionally stop monitoring after finding a slot

## 🔧 How It Works

1. **Authentication**: Uses your existing PrairieTest login session
2. **Page Monitoring**: Watches for changes on PrairieTest pages
3. **Slot Detection**: Automatically detects available exam slots
4. **Filtering**: Matches slots against your criteria
5. **Notifications**: Sends browser and email alerts when slots are found

## 📱 Notifications

The extension provides two types of notifications:

### Browser Notifications

- Appear even when browsing other sites
- Click to go directly to PrairieTest
- Show slot details (date, time, location)

### Email Notifications

- Sent to your configured email address
- Include direct link to PrairieTest
- Detailed slot information

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background processing
- **Content Script**: Page monitoring and slot detection
- **Popup Interface**: User configuration and status

### Security

- **Local Processing**: All data stays in your browser
- **Minimal Permissions**: Only accesses PrairieTest domains
- **No Data Collection**: No personal information is transmitted
- **Secure Storage**: Settings stored in Chrome's sync storage

### Compatibility

- **Chrome**: Full support
- **Edge**: Full support (Chromium-based)
- **Firefox**: Requires adaptation (different manifest format)
- **Safari**: Requires adaptation (different API)

## 🐛 Troubleshooting

### Extension Not Loading

```
Error: Extension could not be loaded
```

**Solution:**

- Check that all files are in the correct folder structure
- Verify `manifest.json` is in the extension root
- Ensure all required files are present

### Icons Not Showing

```
Error: Extension icon appears as default
```

**Solution:**

- Create the required icon files in `icons/` folder
- Use PNG format
- Check file names match exactly

### Notifications Not Working

```
Error: No notifications received
```

**Solution:**

- Check Chrome notification permissions
- Go to Chrome Settings → Privacy and Security → Site Settings → Notifications
- Ensure PrairieTest Monitor is allowed

### Slots Not Detected

```
Error: Extension not finding available slots
```

**Solution:**

- Ensure you're logged into PrairieTest
- Check that you're on a page with slot information
- The extension may need selector adjustments for your specific PrairieTest instance

## 🔄 Customization

### Adjusting Slot Detection

If the extension isn't detecting slots properly, you may need to adjust the selectors in `content.js`:

```javascript
// In content.js, modify these selectors:
const slotSelectors = [
  ".slot:not(.booked)",
  ".time-slot:not(.occupied)",
  ".available-slot",
  // Add your specific selectors here
];
```

### Adding Email Integration

To enable email notifications, integrate with an email service:

```javascript
// In background.js, replace the webhook with your email service
const emailService = "https://your-email-service.com/send";
```

## 📈 Future Enhancements

### Planned Features

- **Multiple Slot Monitoring**: Monitor multiple dates/times simultaneously
- **Advanced Filtering**: More granular slot criteria
- **Statistics Dashboard**: Track monitoring history and success rates
- **Mobile Support**: Companion mobile app or PWA
- **Push Notifications**: Real-time push notifications via service worker

### Integration Options

- **Email Services**: Gmail API, SendGrid, Mailgun
- **Notification Services**: Pushbullet, IFTTT, Zapier
- **Calendar Integration**: Google Calendar, Outlook
- **Slack/Discord**: Team notifications

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Load the extension in Chrome
3. Make changes to the code
4. Reload the extension to test
5. Submit a pull request

### Testing

- Test on different PrairieTest instances
- Verify slot detection accuracy
- Check notification delivery
- Test with various browser configurations

## 📄 License

This project is for educational use. Please respect your school's terms of service and PrairieTest's usage policies.

## 🙏 Acknowledgments

- Built for students struggling to get exam slots
- Inspired by the need for automated monitoring solutions
- Uses modern web technologies for reliability and performance

---

**Need that 9pm spot asap** 🎯

_This extension will help you get it!_
