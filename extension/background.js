// Background service worker for PrairieTest Monitor extension
class PrairieTestBackground {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.settings = {};
    this.setupMessageListeners();
    this.loadSettings();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case "startMonitoring":
          this.startMonitoring(message.settings);
          sendResponse({ success: true });
          break;
        case "stopMonitoring":
          this.stopMonitoring();
          sendResponse({ success: true });
          break;
        case "getStatus":
          sendResponse({ isMonitoring: this.isMonitoring });
          break;
        case "slotFound":
          this.handleSlotFound(message.slot);
          sendResponse({ success: true });
          break;
        case "logActivity":
          this.logActivity(message.message, message.type);
          sendResponse({ success: true });
          break;
      }
      return true; // Keep message channel open for async response
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        "desiredDate",
        "desiredTime",
        "desiredLocation",
        "checkInterval",
        "notificationEmail",
        "isMonitoring",
      ]);

      this.settings = settings;

      // Restart monitoring if it was active
      if (settings.isMonitoring) {
        this.startMonitoring(settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async startMonitoring(settings) {
    try {
      this.settings = settings;
      this.isMonitoring = true;

      // Clear any existing interval
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // Set up monitoring interval
      const intervalMinutes = settings.checkInterval || 5;
      this.monitoringInterval = setInterval(() => {
        this.checkForSlots();
      }, intervalMinutes * 60 * 1000);

      // Initial check
      this.checkForSlots();

      await chrome.storage.sync.set({ isMonitoring: true });
      this.logActivity("Monitoring started", "info");
    } catch (error) {
      console.error("Error starting monitoring:", error);
      this.logActivity("Failed to start monitoring", "error");
    }
  }

  stopMonitoring() {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    chrome.storage.sync.set({ isMonitoring: false });
    this.logActivity("Monitoring stopped", "info");
  }

  async checkForSlots() {
    try {
      // Check if user is on PrairieTest
      const tabs = await chrome.tabs.query({
        url: ["https://us.prairietest.com/*", "https://*.prairietest.com/*"],
      });

      if (tabs.length === 0) {
        this.logActivity("Not on PrairieTest - skipping check", "info");
        return;
      }

      // Send message to content script to check for slots
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: "checkForSlots",
            settings: this.settings,
          });
        } catch (error) {
          console.error("Error sending message to tab:", error);
        }
      }
    } catch (error) {
      console.error("Error checking for slots:", error);
      this.logActivity("Error checking for slots", "error");
    }
  }

  async handleSlotFound(slot) {
    try {
      // Send notification
      await this.sendNotification(slot);

      // Log the find
      this.logActivity(`Slot found: ${slot.date} at ${slot.time}`, "success");

      // Optionally stop monitoring after finding a slot
      // this.stopMonitoring();
    } catch (error) {
      console.error("Error handling slot found:", error);
      this.logActivity("Error handling slot found", "error");
    }
  }

  async sendNotification(slot) {
    try {
      // Create notification
      const notificationId = `prairie-slot-${Date.now()}`;

      await chrome.notifications.create(notificationId, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "🎉 PrairieTest Slot Available!",
        message: `Found slot on ${slot.date} at ${slot.time}${
          slot.location ? ` (${slot.location})` : ""
        }`,
        priority: 2,
      });

      // Send email notification if configured
      if (this.settings.notificationEmail) {
        await this.sendEmailNotification(slot);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  async sendEmailNotification(slot) {
    try {
      // Use a simple email service or webhook
      // For now, we'll use a simple approach with a webhook service
      const webhookUrl = "https://webhook.site/your-webhook-url"; // Replace with actual service

      const emailData = {
        to: this.settings.notificationEmail,
        subject: "🎉 PrairieTest Slot Available!",
        body: `
                    Good news! A PrairieTest slot is available:
                    
                    Date: ${slot.date}
                    Time: ${slot.time}
                    Location: ${slot.location || "Not specified"}
                    
                    Click here to book: https://us.prairietest.com/
                    
                    This notification was sent by your PrairieTest Monitor extension.
                `,
      };

      // You can integrate with services like:
      // - EmailJS
      // - Formspree
      // - Netlify Functions
      // - Your own email server

      console.log("Email notification data:", emailData);
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  logActivity(message, type = "info") {
    console.log(`[PrairieTest Monitor] ${message}`);

    // Store in extension storage for popup to display
    chrome.storage.local.get(["activityLog"], (result) => {
      const log = result.activityLog || [];
      log.unshift({
        message,
        type,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 50 entries
      if (log.length > 50) {
        log.splice(50);
      }

      chrome.storage.local.set({ activityLog: log });
    });
  }
}

// Initialize background service worker
const background = new PrairieTestBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("PrairieTest Monitor extension installed");
    background.logActivity("Extension installed successfully", "info");
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open PrairieTest when notification is clicked
  chrome.tabs.create({ url: "https://us.prairietest.com/" });
});
