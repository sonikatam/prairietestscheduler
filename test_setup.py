#!/usr/bin/env python3
"""
Test script for PrairieTest Slot Monitor
Verifies configuration and connectivity.
"""

import os
import sys
import smtplib
from dotenv import load_dotenv

def test_env_file():
    """Test if .env file exists and has required variables."""
    print("🔍 Testing .env file...")
    
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("Run: python setup.py")
        return False
    
    load_dotenv()
    
    required_vars = [
        'SCHOOL_EMAIL',
        'SCHOOL_PASSWORD', 
        'NOTIFICATION_EMAIL',
        'EMAIL_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ .env file configured correctly")
    return True

def test_email_connection():
    """Test email connectivity."""
    print("🔍 Testing email connection...")
    
    try:
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        email = os.getenv('NOTIFICATION_EMAIL')
        password = os.getenv('EMAIL_PASSWORD')
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email, password)
        server.quit()
        
        print("✅ Email connection successful")
        return True
    except Exception as e:
        print(f"❌ Email connection failed: {e}")
        print("Please check your Gmail App Password setup")
        return False

def test_selenium():
    """Test Selenium setup."""
    print("🔍 Testing Selenium setup...")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service
        
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get("https://www.google.com")
        driver.quit()
        
        print("✅ Selenium setup successful")
        return True
    except Exception as e:
        print(f"❌ Selenium setup failed: {e}")
        print("Please make sure Chrome browser is installed")
        return False

def test_prairie_connectivity():
    """Test basic connectivity to PrairieTest."""
    print("🔍 Testing PrairieTest connectivity...")
    
    try:
        import requests
        prairie_url = os.getenv('PRAIRIE_TEST_URL', 'https://us.prairietest.com/')
        
        response = requests.get(prairie_url, timeout=10)
        if response.status_code == 200:
            print("✅ PrairieTest site is accessible")
            return True
        else:
            print(f"❌ PrairieTest returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to PrairieTest: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing PrairieTest Slot Monitor Setup")
    print("=" * 50)
    
    tests = [
        test_env_file,
        test_email_connection,
        test_selenium,
        test_prairie_connectivity
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! You're ready to run the monitor.")
        print("Run: python prairie_monitor.py")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 