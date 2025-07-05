#!/usr/bin/env python3
"""
Setup script for PrairieTest Slot Monitor
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file from template."""
    if os.path.exists('.env'):
        print("⚠️  .env file already exists. Skipping creation.")
        return
    
    print("📝 Creating .env file from template...")
    
    # Copy from example file
    if os.path.exists('config.env.example'):
        with open('config.env.example', 'r') as f:
            template_content = f.read()
        
        with open('.env', 'w') as f:
            f.write(template_content)
        
        print("✅ .env file created! Please edit it with your credentials.")
    else:
        print("❌ config.env.example not found!")

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    try:
        import requests
        import beautifulsoup4
        import selenium
        import schedule
        import dotenv
        print("✅ All dependencies are available!")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False
    
    return True

def check_chrome():
    """Check if Chrome browser is available."""
    print("🔍 Checking Chrome browser...")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        
        # Test Chrome setup
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        service = ChromeDriverManager().install()
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.quit()
        
        print("✅ Chrome browser setup successful!")
        return True
    except Exception as e:
        print(f"❌ Chrome setup failed: {e}")
        print("Please make sure Chrome browser is installed.")
        return False

def main():
    """Main setup function."""
    print("🚀 Setting up PrairieTest Slot Monitor...")
    print("=" * 50)
    
    # Create .env file
    create_env_file()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check Chrome
    if not check_chrome():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ Setup complete!")
    print("\n📋 Next steps:")
    print("1. Edit the .env file with your credentials")
    print("2. For Gmail, create an App Password:")
    print("   - Go to Google Account settings")
    print("   - Security → 2-Step Verification → App passwords")
    print("   - Generate a password for 'Mail'")
    print("3. Run: python prairie_monitor.py")
    print("\n⚠️  Important: Keep your .env file secure and never commit it to version control!")

if __name__ == "__main__":
    main() 