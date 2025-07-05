// Content script for PrairieTest Monitor extension
class PrairieTestContentScript {
  constructor() {
    this.setupMessageListeners();
    this.initializeSlotDetection();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case "checkForSlots":
          this.checkForSlots(message.settings);
          sendResponse({ success: true });
          break;
      }
      return true;
    });
  }

  initializeSlotDetection() {
    // Set up mutation observer to watch for dynamic content changes
    this.setupMutationObserver();

    // Initial check after page loads
    setTimeout(() => {
      this.checkForSlots();
    }, 2000);
  }

  setupMutationObserver() {
    // Watch for changes in the DOM that might indicate new slots
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if new content might contain slots
          setTimeout(() => {
            this.checkForSlots();
          }, 1000);
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  async checkForSlots(settings = null) {
    try {
      // Get settings from storage if not provided
      if (!settings) {
        const result = await chrome.storage.sync.get([
          "desiredDate",
          "desiredTime",
          "desiredLocation",
          "isMonitoring",
        ]);
        settings = result;
      }

      // Only check if monitoring is active
      if (!settings.isMonitoring) {
        return;
      }

      // Look for available slots on the page
      const availableSlots = this.findAvailableSlots();

      if (availableSlots.length > 0) {
        // Filter slots based on user preferences
        const matchingSlots = this.filterSlots(availableSlots, settings);

        if (matchingSlots.length > 0) {
          // Send notification for each matching slot
          for (const slot of matchingSlots) {
            await chrome.runtime.sendMessage({
              action: "slotFound",
              slot: slot,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking for slots:", error);
    }
  }

  findAvailableSlots() {
    const slots = [];

    // Common selectors for slot elements (adjust based on actual PrairieTest HTML)
    const slotSelectors = [
      ".slot:not(.booked)",
      ".time-slot:not(.occupied)",
      ".available-slot",
      '[data-slot-status="available"]',
      ".calendar-slot:not(.taken)",
      ".appointment-slot:not(.reserved)",
    ];

    // Look for slot containers
    const slotContainers = document.querySelectorAll(slotSelectors.join(", "));

    slotContainers.forEach((container) => {
      const slotInfo = this.extractSlotInfo(container);
      if (slotInfo) {
        slots.push(slotInfo);
      }
    });

    // Also look for any clickable elements that might be slots
    const clickableSlots = document.querySelectorAll(
      'button[onclick*="slot"], a[href*="book"], .book-slot'
    );
    clickableSlots.forEach((element) => {
      const slotInfo = this.extractSlotInfo(element);
      if (slotInfo) {
        slots.push(slotInfo);
      }
    });

    return slots;
  }

  extractSlotInfo(element) {
    try {
      // Try to extract date, time, and location from the element
      let date = "";
      let time = "";
      let location = "";

      // Look for date information
      const dateSelectors = [
        "[data-date]",
        ".date",
        ".slot-date",
        ".appointment-date",
      ];

      for (const selector of dateSelectors) {
        const dateElement =
          element.querySelector(selector) || element.closest(selector);
        if (dateElement) {
          date =
            dateElement.textContent.trim() ||
            dateElement.getAttribute("data-date");
          break;
        }
      }

      // Look for time information
      const timeSelectors = [
        "[data-time]",
        ".time",
        ".slot-time",
        ".appointment-time",
      ];

      for (const selector of timeSelectors) {
        const timeElement =
          element.querySelector(selector) || element.closest(selector);
        if (timeElement) {
          time =
            timeElement.textContent.trim() ||
            timeElement.getAttribute("data-time");
          break;
        }
      }

      // Look for location information
      const locationSelectors = [
        "[data-location]",
        ".location",
        ".slot-location",
        ".appointment-location",
      ];

      for (const selector of locationSelectors) {
        const locationElement =
          element.querySelector(selector) || element.closest(selector);
        if (locationElement) {
          location =
            locationElement.textContent.trim() ||
            locationElement.getAttribute("data-location");
          break;
        }
      }

      // If we found at least date or time, consider it a valid slot
      if (date || time) {
        return {
          date: date || "Unknown",
          time: time || "Unknown",
          location: location || "Unknown",
          element: element,
        };
      }
    } catch (error) {
      console.error("Error extracting slot info:", error);
    }

    return null;
  }

  filterSlots(slots, settings) {
    return slots.filter((slot) => {
      // Check date filter
      if (settings.desiredDate && slot.date) {
        const slotDate = this.normalizeDate(slot.date);
        const desiredDate = this.normalizeDate(settings.desiredDate);
        if (slotDate !== desiredDate) {
          return false;
        }
      }

      // Check time filter
      if (settings.desiredTime && slot.time) {
        const slotTime = this.normalizeTime(slot.time);
        const desiredTime = this.normalizeTime(settings.desiredTime);
        if (slotTime !== desiredTime) {
          return false;
        }
      }

      // Check location filter
      if (settings.desiredLocation && slot.location) {
        const slotLocation = slot.location.toLowerCase();
        const desiredLocation = settings.desiredLocation.toLowerCase();
        if (!slotLocation.includes(desiredLocation)) {
          return false;
        }
      }

      return true;
    });
  }

  normalizeDate(dateString) {
    // Convert various date formats to YYYY-MM-DD
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      return dateString;
    }
  }

  normalizeTime(timeString) {
    // Convert various time formats to HH:MM
    try {
      // Handle formats like "9:00 PM", "21:00", "9:00"
      const time = new Date(`2000-01-01 ${timeString}`);
      return time.toTimeString().slice(0, 5);
    } catch (error) {
      return timeString;
    }
  }

  // Log activity to background script
  logActivity(message, type = "info") {
    chrome.runtime.sendMessage({
      action: "logActivity",
      message: message,
      type: type,
    });
  }
}

// Initialize content script when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new PrairieTestContentScript();
  });
} else {
  new PrairieTestContentScript();
}
