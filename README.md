# PrairieTest Slot Monitor 🎯

An automated tool to monitor [PrairieTest](https://us.prairietest.com/) for available exam slots and send email notifications when spots become available.

## Features

- 🔐 **SSO Authentication**: Handles school SSO login automatically
- 🔍 **Smart Monitoring**: Checks for available slots at configurable intervals
- 📧 **Email Notifications**: Sends immediate alerts when slots become available
- ⚙️ **Flexible Configuration**: Customize dates, times, and locations
- 🛡️ **Secure**: Keeps credentials in environment variables
- 📊 **Logging**: Detailed logs for monitoring and debugging

## Prerequisites

- Python 3.7+
- Chrome browser installed
- School email credentials
- Gmail account for notifications (with App Password)

## Quick Start

1. **Clone and setup**:

   ```bash
   git clone <your-repo>
   cd prairietestscheduler
   python setup.py
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure your settings**:

   ```bash
   # Edit the .env file with your credentials
   nano .env
   ```

4. **Run the monitor**:
   ```bash
   python prairie_monitor.py
   ```

## Configuration

Edit the `.env` file with your settings:

```env
# PrairieTest Configuration
PRAIRIE_TEST_URL=https://us.prairietest.com/
SCHOOL_EMAIL=your.email@school.edu
SCHOOL_PASSWORD=your_password

# Email Configuration (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
NOTIFICATION_EMAIL=your.email@school.edu
EMAIL_PASSWORD=your_app_password

# Monitoring Configuration
CHECK_INTERVAL_MINUTES=5
DESIRED_DATE=2024-01-15
DESIRED_TIME=21:00
DESIRED_LOCATION=Main Testing Center

# Selenium Configuration
HEADLESS_MODE=true
BROWSER_TIMEOUT=30
```

### Gmail App Password Setup

For email notifications, you'll need to create a Gmail App Password:

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** → **App passwords**
3. Generate a password for "Mail"
4. Use this password in the `EMAIL_PASSWORD` field

## How It Works

1. **Authentication**: The script logs into PrairieTest using your school credentials
2. **Monitoring**: Checks the scheduling page at regular intervals (default: every 5 minutes)
3. **Slot Detection**: Parses the page for available exam slots
4. **Filtering**: Matches slots against your desired criteria (date, time, location)
5. **Notification**: Sends email alerts when matching slots are found

## Customization

### Monitoring Specific Slots

Set your desired criteria in the `.env` file:

```env
DESIRED_DATE=2024-01-15    # Leave empty to accept any date
DESIRED_TIME=21:00         # Leave empty to accept any time
DESIRED_LOCATION=Main Testing Center  # Leave empty to accept any location
```

### Check Frequency

Adjust how often to check for slots:

```env
CHECK_INTERVAL_MINUTES=5  # Check every 5 minutes
```

### Browser Settings

```env
HEADLESS_MODE=true        # Run browser in background
BROWSER_TIMEOUT=30        # Timeout for page loading (seconds)
```

## Troubleshooting

### Common Issues

1. **Login fails**:

   - Verify your school credentials
   - Check if SSO requires additional steps
   - Try running with `HEADLESS_MODE=false` to see what's happening

2. **No slots found**:

   - The script may need selector adjustments for your specific PrairieTest instance
   - Check the logs for parsing errors
   - Verify the scheduling page URL

3. **Email not sending**:
   - Verify Gmail App Password is correct
   - Check if 2FA is enabled on your Gmail account
   - Ensure SMTP settings are correct

### Debug Mode

Run with visible browser to debug:

```env
HEADLESS_MODE=false
```

### Logs

Check the log file for detailed information:

```bash
tail -f prairie_monitor.log
```

## Security Notes

- ⚠️ **Never commit your `.env` file** - it contains sensitive credentials
- 🔒 Keep your school credentials secure
- 📧 Use a dedicated Gmail account for notifications
- 🛡️ The script runs locally on your machine

## File Structure

```
prairietestscheduler/
├── prairie_monitor.py      # Main monitoring script
├── setup.py               # Setup and configuration helper
├── requirements.txt        # Python dependencies
├── config.env.example     # Configuration template
├── .env                   # Your actual configuration (create this)
├── prairie_monitor.log    # Log file (created when running)
└── README.md             # This file
```

## Contributing

If you need to adjust the script for your specific PrairieTest instance:

1. **Login selectors**: Modify the `login_selectors` in `_login()` method
2. **Slot parsing**: Update `_extract_slot_info()` for your HTML structure
3. **Page navigation**: Adjust URLs in `_check_available_slots()`

## License

This project is for educational use. Please respect your school's terms of service.

---

**Need that 9pm spot asap** 🎯

_This tool will help you get it!_
