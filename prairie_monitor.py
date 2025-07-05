#!/usr/bin/env python3
"""
PrairieTest Slot Monitor
Monitors PrairieTest for available exam slots and sends email notifications.
"""

import os
import time
import logging
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List, Dict, Any

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import schedule
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('prairie_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PrairieTestMonitor:
    def __init__(self):
        self.config = self._load_config()
        self.driver = None
        self.is_logged_in = False
        self.last_check = None
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from environment variables."""
        return {
            'prairie_url': os.getenv('PRAIRIE_TEST_URL', 'https://us.prairietest.com/'),
            'school_email': os.getenv('SCHOOL_EMAIL'),
            'school_password': os.getenv('SCHOOL_PASSWORD'),
            'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', '587')),
            'notification_email': os.getenv('NOTIFICATION_EMAIL'),
            'email_password': os.getenv('EMAIL_PASSWORD'),
            'check_interval': int(os.getenv('CHECK_INTERVAL_MINUTES', '5')),
            'desired_date': os.getenv('DESIRED_DATE'),
            'desired_time': os.getenv('DESIRED_TIME'),
            'desired_location': os.getenv('DESIRED_LOCATION'),
            'headless': os.getenv('HEADLESS_MODE', 'true').lower() == 'true',
            'timeout': int(os.getenv('BROWSER_TIMEOUT', '30'))
        }
    
    def _setup_driver(self):
        """Initialize Chrome WebDriver with appropriate options."""
        chrome_options = Options()
        
        if self.config['headless']:
            chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(10)
        
    def _login(self) -> bool:
        """Handle SSO login to PrairieTest."""
        try:
            logger.info("Attempting to login to PrairieTest...")
            self.driver.get(self.config['prairie_url'])
            
            # Wait for login form or SSO redirect
            wait = WebDriverWait(self.driver, self.config['timeout'])
            
            # Look for login elements (these selectors may need adjustment based on actual site)
            login_selectors = [
                "input[type='email']",
                "input[name='email']",
                "input[id*='email']",
                "input[placeholder*='email']"
            ]
            
            email_input = None
            for selector in login_selectors:
                try:
                    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    break
                except TimeoutException:
                    continue
            
            if not email_input:
                logger.error("Could not find email input field")
                return False
            
            # Enter email
            email_input.clear()
            email_input.send_keys(self.config['school_email'])
            
            # Find and fill password
            password_selectors = [
                "input[type='password']",
                "input[name='password']",
                "input[id*='password']"
            ]
            
            password_input = None
            for selector in password_selectors:
                try:
                    password_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            if not password_input:
                logger.error("Could not find password input field")
                return False
            
            password_input.clear()
            password_input.send_keys(self.config['school_password'])
            
            # Find and click login button
            login_button_selectors = [
                "button[type='submit']",
                "input[type='submit']",
                "button:contains('Login')",
                "button:contains('Sign In')",
                ".login-button",
                "#login-button"
            ]
            
            login_button = None
            for selector in login_selectors:
                try:
                    login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            if login_button:
                login_button.click()
            else:
                # Try pressing Enter on password field
                password_input.send_keys(Keys.RETURN)
            
            # Wait for successful login (look for dashboard or user info)
            time.sleep(3)
            
            # Check if login was successful
            success_indicators = [
                ".dashboard",
                ".user-info",
                ".logout",
                "a[href*='logout']",
                ".welcome"
            ]
            
            for indicator in success_indicators:
                try:
                    self.driver.find_element(By.CSS_SELECTOR, indicator)
                    logger.info("Successfully logged in to PrairieTest")
                    self.is_logged_in = True
                    return True
                except NoSuchElementException:
                    continue
            
            logger.error("Login failed - could not verify successful login")
            return False
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return False
    
    def _check_available_slots(self) -> List[Dict[str, str]]:
        """Check for available exam slots."""
        try:
            if not self.is_logged_in:
                if not self._login():
                    return []
            
            # Navigate to scheduling page (adjust URL as needed)
            schedule_url = f"{self.config['prairie_url']}schedule" if not self.config['prairie_url'].endswith('/') else f"{self.config['prairie_url']}schedule"
            self.driver.get(schedule_url)
            
            # Wait for page to load
            time.sleep(3)
            
            # Parse the page for available slots
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            available_slots = []
            
            # Look for slot elements (these selectors will need adjustment)
            slot_selectors = [
                ".slot",
                ".time-slot",
                ".available-slot",
                "[data-slot]",
                ".calendar-slot"
            ]
            
            for selector in slot_selectors:
                slots = soup.select(selector)
                for slot in slots:
                    slot_info = self._extract_slot_info(slot)
                    if slot_info and self._is_desired_slot(slot_info):
                        available_slots.append(slot_info)
            
            logger.info(f"Found {len(available_slots)} available slots")
            return available_slots
            
        except Exception as e:
            logger.error(f"Error checking slots: {str(e)}")
            return []
    
    def _extract_slot_info(self, slot_element) -> Optional[Dict[str, str]]:
        """Extract slot information from HTML element."""
        try:
            # Extract date, time, and location from slot element
            # This will need customization based on actual HTML structure
            date_elem = slot_element.select_one('.date, .slot-date, [data-date]')
            time_elem = slot_element.select_one('.time, .slot-time, [data-time]')
            location_elem = slot_element.select_one('.location, .slot-location, [data-location]')
            
            if date_elem and time_elem:
                return {
                    'date': date_elem.get_text(strip=True),
                    'time': time_elem.get_text(strip=True),
                    'location': location_elem.get_text(strip=True) if location_elem else 'Unknown'
                }
        except Exception as e:
            logger.error(f"Error extracting slot info: {str(e)}")
        
        return None
    
    def _is_desired_slot(self, slot_info: Dict[str, str]) -> bool:
        """Check if slot matches desired criteria."""
        if not self.config['desired_date'] and not self.config['desired_time']:
            return True  # Accept any slot if no specific criteria
        
        # Check date
        if self.config['desired_date']:
            slot_date = slot_info.get('date', '')
            if self.config['desired_date'] not in slot_date:
                return False
        
        # Check time
        if self.config['desired_time']:
            slot_time = slot_info.get('time', '')
            if self.config['desired_time'] not in slot_time:
                return False
        
        # Check location
        if self.config['desired_location']:
            slot_location = slot_info.get('location', '')
            if self.config['desired_location'].lower() not in slot_location.lower():
                return False
        
        return True
    
    def _send_notification(self, available_slots: List[Dict[str, str]]):
        """Send email notification about available slots."""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.config['notification_email']
            msg['To'] = self.config['notification_email']
            msg['Subject'] = f"🎉 PrairieTest Slot Available! - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            
            # Create email body
            body = f"""
            <html>
            <body>
                <h2>🎉 PrairieTest Exam Slot Available!</h2>
                <p>Good news! The following exam slots are now available:</p>
                <ul>
            """
            
            for slot in available_slots:
                body += f"""
                    <li>
                        <strong>Date:</strong> {slot.get('date', 'N/A')}<br>
                        <strong>Time:</strong> {slot.get('time', 'N/A')}<br>
                        <strong>Location:</strong> {slot.get('location', 'N/A')}
                    </li>
                """
            
            body += f"""
                </ul>
                <p><a href="{self.config['prairie_url']}">Click here to book your slot now!</a></p>
                <p><small>This notification was sent by your PrairieTest Slot Monitor at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</small></p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # Send email
            server = smtplib.SMTP(self.config['smtp_server'], self.config['smtp_port'])
            server.starttls()
            server.login(self.config['notification_email'], self.config['email_password'])
            text = msg.as_string()
            server.sendmail(self.config['notification_email'], self.config['notification_email'], text)
            server.quit()
            
            logger.info(f"Notification sent for {len(available_slots)} available slots")
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
    
    def check_and_notify(self):
        """Main method to check for slots and send notifications."""
        try:
            logger.info("Checking for available PrairieTest slots...")
            
            if not self.driver:
                self._setup_driver()
            
            available_slots = self._check_available_slots()
            
            if available_slots:
                logger.info(f"Found {len(available_slots)} available slots!")
                self._send_notification(available_slots)
            else:
                logger.info("No available slots found")
            
            self.last_check = datetime.now()
            
        except Exception as e:
            logger.error(f"Error in check_and_notify: {str(e)}")
    
    def start_monitoring(self):
        """Start the monitoring service."""
        logger.info("Starting PrairieTest slot monitor...")
        logger.info(f"Checking every {self.config['check_interval']} minutes")
        logger.info(f"Looking for slots on {self.config['desired_date']} at {self.config['desired_time']}")
        
        # Schedule the monitoring job
        schedule.every(self.config['check_interval']).minutes.do(self.check_and_notify)
        
        # Run initial check
        self.check_and_notify()
        
        # Keep the script running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute for scheduled tasks
    
    def cleanup(self):
        """Clean up resources."""
        if self.driver:
            self.driver.quit()
        logger.info("Monitor stopped")

if __name__ == "__main__":
    monitor = PrairieTestMonitor()
    
    try:
        monitor.start_monitoring()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, stopping monitor...")
    finally:
        monitor.cleanup() 