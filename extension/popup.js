// Popup script for PrairieTest Monitor extension
class PrairieTestPopup {
  constructor() {
    this.initializeElements();
    this.loadSettings();
    this.setupEventListeners();
    this.updateStatus();
  }

  initializeElements() {
    this.statusDot = document.getElementById("statusDot");
    this.statusText = document.getElementById("statusText");
    this.startBtn = document.getElementById("startMonitoring");
    this.stopBtn = document.getElementById("stopMonitoring");
    this.activityLog = document.getElementById("activityLog");

    // Form elements
    this.desiredDate = document.getElementById("desiredDate");
    this.desiredTime = document.getElementById("desiredTime");
    this.desiredLocation = document.getElementById("desiredLocation");
    this.checkInterval = document.getElementById("checkInterval");
    this.notificationEmail = document.getElementById("notificationEmail");
  }

  setupEventListeners() {
    this.startBtn.addEventListener("click", () => this.startMonitoring());
    this.stopBtn.addEventListener("click", () => this.stopMonitoring());

    // Save settings on change
    [
      this.desiredDate,
      this.desiredTime,
      this.desiredLocation,
      this.checkInterval,
      this.notificationEmail,
    ].forEach((element) => {
      element.addEventListener("change", () => this.saveSettings());
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

      this.desiredDate.value = settings.desiredDate || "";
      this.desiredTime.value = settings.desiredTime || "";
      this.desiredLocation.value = settings.desiredLocation || "";
      this.checkInterval.value = settings.checkInterval || "5";
      this.notificationEmail.value = settings.notificationEmail || "";

      if (settings.isMonitoring) {
        this.showStopButton();
      } else {
        this.showStartButton();
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        desiredDate: this.desiredDate.value,
        desiredTime: this.desiredTime.value,
        desiredLocation: this.desiredLocation.value,
        checkInterval: this.checkInterval.value,
        notificationEmail: this.notificationEmail.value,
      };

      await chrome.storage.sync.set(settings);
      this.addLogEntry("Settings saved", "info");
    } catch (error) {
      console.error("Error saving settings:", error);
      this.addLogEntry("Failed to save settings", "error");
    }
  }

  async startMonitoring() {
    try {
      // Validate required fields
      if (!this.notificationEmail.value) {
        this.addLogEntry("Please enter an email address", "error");
        return;
      }

      // Save current settings
      await this.saveSettings();

      // Send message to background script
      await chrome.runtime.sendMessage({
        action: "startMonitoring",
        settings: {
          desiredDate: this.desiredDate.value,
          desiredTime: this.desiredTime.value,
          desiredLocation: this.desiredLocation.value,
          checkInterval: parseInt(this.checkInterval.value),
          notificationEmail: this.notificationEmail.value,
        },
      });

      await chrome.storage.sync.set({ isMonitoring: true });
      this.showStopButton();
      this.updateStatus("active");
      this.addLogEntry("Monitoring started", "success");
    } catch (error) {
      console.error("Error starting monitoring:", error);
      this.addLogEntry("Failed to start monitoring", "error");
    }
  }

  async stopMonitoring() {
    try {
      await chrome.runtime.sendMessage({ action: "stopMonitoring" });
      await chrome.storage.sync.set({ isMonitoring: false });
      this.showStartButton();
      this.updateStatus("inactive");
      this.addLogEntry("Monitoring stopped", "info");
    } catch (error) {
      console.error("Error stopping monitoring:", error);
      this.addLogEntry("Failed to stop monitoring", "error");
    }
  }

  showStartButton() {
    this.startBtn.style.display = "block";
    this.stopBtn.style.display = "none";
  }

  showStopButton() {
    this.startBtn.style.display = "none";
    this.stopBtn.style.display = "block";
  }

  updateStatus(status = "checking") {
    this.statusDot.className = "status-dot";

    switch (status) {
      case "active":
        this.statusDot.classList.add("active");
        this.statusText.textContent = "Monitoring active";
        break;
      case "inactive":
        this.statusText.textContent = "Not monitoring";
        break;
      case "error":
        this.statusDot.classList.add("error");
        this.statusText.textContent = "Error occurred";
        break;
      default:
        this.statusText.textContent = "Checking status...";
    }
  }

  addLogEntry(message, type = "info") {
    const logContainer = this.activityLog;
    const placeholder = logContainer.querySelector(".log-placeholder");

    if (placeholder) {
      placeholder.remove();
    }

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span class="log-time">${time}</span>${message}`;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // Keep only last 10 entries
    const entries = logContainer.querySelectorAll(".log-entry");
    if (entries.length > 10) {
      entries[entries.length - 1].remove();
    }
  }

  async checkCurrentStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getStatus",
      });
      if (response && response.isMonitoring) {
        this.updateStatus("active");
        this.showStopButton();
      } else {
        this.updateStatus("inactive");
        this.showStartButton();
      }
    } catch (error) {
      console.error("Error checking status:", error);
      this.updateStatus("error");
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const popup = new PrairieTestPopup();

  // Check status periodically
  setInterval(() => {
    popup.checkCurrentStatus();
  }, 5000);
});
