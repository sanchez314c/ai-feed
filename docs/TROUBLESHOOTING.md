# 🔧 AIFEED Troubleshooting Guide

**Version:** 1.0.0
**Last Updated:** October 30, 2024

## Table of Contents

1. [Quick Fixes](#quick-fixes)
2. [Installation Issues](#installation-issues)
3. [Startup Problems](#startup-problems)
4. [Content Loading Issues](#content-loading-issues)
5. [API and Authentication Problems](#api-and-authentication-problems)
6. [Performance Issues](#performance-issues)
7. [Database Issues](#database-issues)
8. [Platform-Specific Issues](#platform-specific-issues)
9. [Network and Connectivity](#network-and-connectivity)
10. [Crash Recovery](#crash-recovery)
11. [Getting Additional Help](#getting-additional-help)

## Quick Fixes

### Before You Begin

Try these common fixes first:

1. **Restart the Application**
   - Close AIFEED completely
   - Wait 10 seconds
   - Relaunch the application

2. **Check for Updates**
   - Navigate to Help → Check for Updates
   - Install any available updates
   - Restart after updating

3. **Clear Cache**
   - Settings → Advanced → Clear Cache
   - Restart the application

4. **Reset Settings (Last Resort)**
   - Backup your configuration first
   - Settings → Advanced → Reset to Defaults
   - Reconfigure your preferences

## Installation Issues

### Windows

#### "Windows protected your PC" Message

**Problem:** SmartScreen blocks the installation

**Solution:**
1. Click "More info" in the warning dialog
2. Click "Run anyway"
3. Alternatively, right-click → Properties → Unblock

#### Installer Won't Run

**Problem:** Double-clicking the installer does nothing

**Solution:**
1. Download the installer again
2. Right-click and "Run as administrator"
3. Disable antivirus temporarily during installation
4. Run from command line:
   ```cmd
   AIFEED-Setup-1.0.0.exe /S
   ```

#### Missing DLL Files

**Problem:** Error about missing MSVCP140.dll or similar

**Solution:**
1. Install Microsoft Visual C++ Redistributable
2. Download from [Microsoft's website](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
3. Choose x64 version for 64-bit systems

### macOS

#### "AIFEED can't be opened because Apple cannot check it for malicious software"

**Problem:** Gatekeeper blocks the application

**Solution:**
1. Right-click on AIFEED.app
2. Select "Open" from context menu
3. Click "Open" in the confirmation dialog
4. Or allow in System Preferences:
   - System Preferences → Security & Privacy
   - Click "Allow Anyway" next to AIFEED

#### Application Damaged Error

**Problem:** "AIFEED is damaged and can't be opened"

**Solution:**
1. Remove the application:
   ```bash
   sudo rm -rf /Applications/AIFEED.app
   ```
2. Re-download from the official source
3. Verify the checksum if provided

#### Permission Denied

**Problem:** Can't write to application directory

**Solution:**
1. Repair disk permissions
2. Reinstall with correct permissions:
   ```bash
   sudo cp -R AIFEED.app /Applications/
   sudo chown -R $USER:staff /Applications/AIFEED.app
   ```

### Linux

#### Permission Denied on Executable

**Problem:** Cannot run the downloaded binary

**Solution:**
1. Make the file executable:
   ```bash
   chmod +x AIFEED.AppImage
   ```
2. Or run with explicit permissions:
   ```bash
   ./AIFEED.AppImage
   ```

#### Missing Dependencies

**Problem:** Error about missing libraries

**Solution:**
1. Install required dependencies:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0

   # Fedora/CentOS
   sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-core libuuid libsecret
   ```

2. For AppImage, use FUSE:
   ```bash
   sudo apt-get install libfuse2
   ```

#### Wayland Compatibility Issues

**Problem:** Application doesn't display properly on Wayland

**Solution:**
1. Run with XWayland:
   ```bash
   GDK_BACKEND=x11 ./AIFEED.AppImage
   ```
2. Or add to desktop entry:
   ```ini
   Exec=env GDK_BACKEND=x11 /path/to/AIFEED.AppImage
   ```

## Startup Problems

### Application Won't Start

#### Black Screen on Launch

**Problem:** Application opens but shows black window

**Solution:**
1. **Disable Hardware Acceleration**
   - Close the application
   - Edit configuration file:
     ```json
     {
       "hardwareAcceleration": false
     }
     ```
   - Relaunch application

2. **Reset Graphics Settings**
   - Delete `gpu-cache` folder:
     ```bash
     # macOS
     rm -rf ~/Library/Application\ Support/AIFEED/gpu-cache/

     # Windows
     rmdir /s "%APPDATA%\AIFEED\gpu-cache"
     ```

3. **Update Graphics Drivers**
   - Update to latest GPU drivers
   - Restart computer

#### Crash During Startup

**Problem:** Application crashes immediately after launch

**Solution:**
1. **Check Crash Logs**
   ```bash
   # macOS
   Console.app → Crash Reports → AIFEED

   # Windows
   Event Viewer → Windows Logs → Application

   # Linux
   journalctl -u aifeed
   ```

2. **Start in Safe Mode**
   ```bash
   # Command line flag
   AIFEED.exe --safe-mode

   # Or environment variable
   AIFEED_SAFE_MODE=1 AIFEED.exe
   ```

3. **Reset Configuration**
   ```bash
   # Backup current config
   cp ~/.config/AIFEED/config.json ~/.config/AIFEED/config.json.backup

   # Remove corrupted config
   rm ~/.config/AIFEED/config.json
   ```

## Content Loading Issues

### No Content Displaying

#### Empty Dashboard

**Problem:** Dashboard shows "No content available"

**Solution:**
1. **Check Internet Connection**
   - Verify internet connectivity
   - Test with a browser
   - Check firewall settings

2. **Verify API Keys**
   - Navigate to Settings → API Configuration
   - Ensure all required API keys are entered
   - Test each API connection

3. **Manual Refresh**
   - Press Ctrl/Cmd + R
   - Or click refresh button
   - Wait 2-3 minutes for initial load

4. **Check Data Sources**
   - Settings → Data Sources
   - Ensure sources are enabled
   - Verify source configurations

#### Content Not Updating

**Problem:** Old content showing, no new items

**Solution:**
1. **Check Update Settings**
   - Settings → Updates
   - Ensure auto-update is enabled
   - Verify update interval

2. **Force Manual Update**
   - Settings → Data Sources → Force Update
   - Wait for completion

3. **Check API Quotas**
   - Review API usage in provider dashboards
   - Verify you haven't exceeded limits

4. **Clear Cache and Refresh**
   - Settings → Advanced → Clear Cache
   - Restart application
   - Perform manual refresh

### Content Display Issues

#### Images Not Loading

**Problem:** Thumbnails and images missing

**Solution:**
1. **Check Image Loading Settings**
   - Settings → Appearance → Show Thumbnails
   - Ensure it's enabled

2. **Clear Image Cache**
   ```bash
   # Clear cached images
   rm -rf ~/Library/Application\ Support/AIFEED/images/
   ```

3. **Check Network Settings**
   - Verify no image-blocking extensions
   - Check corporate firewall settings

#### Summaries Not Generated

**Problem:** Content shows without AI-generated summaries

**Solution:**
1. **Check Claude API Configuration**
   - Verify Anthropic API key is valid
   - Test API connection in settings
   - Check API usage and limits

2. **Check Processing Settings**
   - Settings → Content Processing
   - Enable summarization if disabled

3. **Manual Regeneration**
   - Right-click content item
   - Select "Regenerate Summary"

## API and Authentication Problems

### Anthropic API Issues

#### Invalid API Key

**Problem:** "Invalid API key" error

**Solution:**
1. **Verify API Key**
   - Copy key directly from Anthropic console
   - Remove any extra spaces
   - Check for trailing characters

2. **Check Key Permissions**
   - Ensure key has correct permissions
   - Verify account is active
   - Check billing status

3. **Regenerate API Key**
   - Create new key in Anthropic console
   - Update application settings
   - Delete old key

#### Rate Limit Errors

**Problem:** "Rate limit exceeded" messages

**Solution:**
1. **Check Usage Limits**
   - Review usage in Anthropic dashboard
   - Wait for limit reset (usually monthly)
   - Upgrade plan if needed

2. **Reduce Request Frequency**
   - Increase batch processing size
   - Reduce concurrent requests
   - Adjust update intervals

3. **Implement Caching**
   - Enable content caching
   - Increase cache TTL
   - Use local processing where possible

### News API Issues

#### API Key Problems

**Solution:**
1. Verify key in NewsAPI.org dashboard
2. Check request limits
3. Ensure correct endpoint usage

#### Source Access Issues

**Problem:** Certain news sources not accessible

**Solution:**
1. Check source availability in your plan
2. Verify source names are correct
3. Use alternative sources

### YouTube API Issues

#### Quota Exceeded

**Solution:**
1. Check quota usage in Google Cloud Console
2. Optimize request patterns
3. Request quota increase if needed

#### Video Access Restrictions

**Problem:** Some videos cannot be accessed

**Solution:**
1. Check video privacy settings
2. Verify regional availability
3. Use alternative video sources

## Performance Issues

### Slow Application Performance

#### High CPU Usage

**Problem:** Application using excessive CPU

**Solution:**
1. **Reduce Concurrent Operations**
   ```json
   {
     "performance": {
       "maxConcurrentRequests": 3,
       "batchSize": 25
     }
   }
   ```

2. **Disable Unnecessary Features**
   - Turn off real-time updates
   - Reduce background processing
   - Disable animations

3. **Update Application**
   - Check for performance updates
   - Install latest version

#### High Memory Usage

**Problem:** Application consuming too much RAM

**Solution:**
1. **Adjust Cache Settings**
   ```json
   {
     "cache": {
       "maxSize": "200MB",
       "cleanupInterval": 60000
     }
   }
   ```

2. **Database Optimization**
   - Enable database vacuuming
   - Reduce history retention
   - Compact database manually

3. **Restart Application**
   - Clear memory by restarting
   - Monitor for memory leaks

### Slow Content Loading

#### Network Bottlenecks

**Solution:**
1. **Optimize Network Settings**
   ```json
   {
     "network": {
       "timeout": 15000,
       "retries": 2,
       "concurrentDownloads": 3
     }
   }
   ```

2. **Use Content Delivery Network**
   - Enable CDN if available
   - Select nearest server region

#### Database Performance

**Solution:**
1. **Index Optimization**
   ```sql
   -- Add missing indexes
   CREATE INDEX idx_items_published ON items(published);
   CREATE INDEX idx_items_source ON items(source);
   ```

2. **Database Maintenance**
   - Regular VACUUM operations
   - Analyze table statistics
   - Rebuild indexes

## Database Issues

### Database Corruption

#### Database Locked

**Problem:** "Database is locked" error

**Solution:**
1. **Close All Connections**
   - Close application completely
   - Check for other processes
   ```bash
   # Find and kill sqlite processes
   ps aux | grep sqlite
   kill -9 <pid>
   ```

2. **Remove Lock Files**
   ```bash
   # Remove lock files
   rm -f aifeed.db.db-journal
   rm -f aifeed.db-wal
   rm -f aifeed.db-shm
   ```

3. **Check File Permissions**
   ```bash
   # Fix permissions
   chmod 644 aifeed.db
   chown $USER:$USER aifeed.db
   ```

#### Database Corruption

**Problem:** SQLite corruption errors

**Solution:**
1. **Integrity Check**
   ```bash
   sqlite3 aifeed.db "PRAGMA integrity_check;"
   ```

2. **Export and Recreate**
   ```bash
   # Export data
   sqlite3 aifeed.db ".dump" > backup.sql

   # Create new database
   sqlite3 aifeed_new.db < backup.sql

   # Replace old database
   mv aifeed.db aifeed_corrupted.db
   mv aifeed_new.db aifeed.db
   ```

3. **Restore from Backup**
   ```bash
   # Find recent backup
   ls -la backups/

   # Restore most recent
   cp backups/aifeed_20241030.db aifeed.db
   ```

### Database Size Issues

#### Database Too Large

**Problem:** Database file growing excessively

**Solution:**
1. **Configure Auto-Cleanup**
   ```json
   {
     "database": {
       "autoCleanup": true,
       "maxAge": 30,
       "maxRecords": 10000
     }
   }
   ```

2. **Manual Cleanup**
   ```sql
   -- Delete old records
   DELETE FROM items WHERE published < date('now', '-30 days');

   -- Optimize database
   VACUUM;
   ```

3. **Archive Old Data**
   ```bash
   # Create archive database
   sqlite3 archive.db ""

   # Move old records
   sqlite3 aifeed.db ".dump --data-only" | sqlite3 archive.db
   ```

## Platform-Specific Issues

### macOS Issues

#### Notarization Problems

**Problem:** "Application can't be verified" error

**Solution:**
1. Allow the application in System Preferences
2. Use `spctl` command:
   ```bash
   sudo spctl --master-disable
   # Run application
   sudo spctl --master-enable
   ```

#### Permission Issues

**Problem**: Application can't access certain folders

**Solution**:
1. Grant permissions in System Preferences
2. Use Full Disk Access if needed
3. Reset permissions:
   ```bash
   tccutil reset All
   ```

### Windows Issues

#### Windows Defender Blocking

**Problem**: Windows Defender removes or blocks the application

**Solution**:
1. Add exclusion in Windows Defender
2. Report as false positive to Microsoft
3. Use PowerShell to run:
   ```powershell
   Start-Process -FilePath "AIFEED.exe" -Verb RunAs
   ```

#### Registry Issues

**Problem**: Settings not persisting

**Solution**:
1. Check registry permissions
2. Reset registry entries:
   ```cmd
   reg delete "HKCU\Software\AIFEED" /f
   ```

### Linux Issues

#### Desktop Integration

**Problem**: Application doesn't appear in application menu

**Solution**:
1. Install desktop entry:
   ```bash
   cp aifeed.desktop ~/.local/share/applications/
   ```
2. Update desktop database:
   ```bash
   update-desktop-database ~/.local/share/applications/
   ```

#### Theme Integration

**Problem**: Application doesn't follow system theme

**Solution**:
1. Set GTK_THEME environment variable:
   ```bash
   export GTK_THEME=Adwaita:dark
   ./AIFEED.AppImage
   ```
2. Install theme packages:
   ```bash
   sudo apt-get install gnome-themes-extra
   ```

## Network and Connectivity

### Proxy Issues

#### Corporate Proxy Blocking

**Problem**: Application can't connect through corporate proxy

**Solution**:
1. Configure proxy settings:
   ```json
   {
     "proxy": {
       "enabled": true,
       "host": "proxy.company.com",
       "port": 8080,
       "username": "user",
       "password": "pass"
     }
   }
   ```

2. Use environment variables:
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

### SSL/TLS Issues

#### Certificate Errors

**Problem**: SSL certificate validation failures

**Solution**:
1. Update system certificates
2. Configure custom CA:
   ```json
   {
     "ssl": {
       "rejectUnauthorized": false,
       "caFile": "/path/to/cert.pem"
     }
   }
   ```

### DNS Issues

#### Resolution Failures

**Problem**: Can't resolve API endpoints

**Solution**:
1. Use alternative DNS:
   ```bash
   # Set DNS servers
   echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
   ```
2. Configure hosts file if needed

## Crash Recovery

### Application Crashes

#### Collect Crash Information

1. **Find Crash Logs**
   - macOS: Console.app → Crash Reports
   - Windows: Event Viewer → Application Logs
   - Linux: journalctl or .crash files

2. **Generate Debug Report**
   - Start with debug flag:
     ```bash
     AIFEED.exe --debug --verbose
     ```

#### Safe Mode Recovery

1. **Start in Safe Mode**
   ```bash
   AIFEED.exe --safe-mode
   ```

2. **Export Data**
   - File → Export → All Data
   - Save to safe location

3. **Clean Reinstall**
   - Unkeep user data during uninstall
   - Reinstall application
   - Import exported data

### Data Recovery

#### Backup Recovery

1. **Locate Backups**
   ```bash
   # Find backup files
   find ~/ -name "*aifeed*backup*" 2>/dev/null
   ```

2. **Restore from Backup**
   ```bash
   # Stop application
   # Replace database
   cp backup/aifeed_backup.db ~/.config/AIFEED/aifeed.db
   ```

#### Manual Data Extraction

1. **Extract SQLite Data**
   ```bash
   # Export all data
   sqlite3 aifeed.db ".output backup.json"
   sqlite3 aifeed.db ".dump --data-only"
   ```

2. **Recover Configuration**
   ```bash
   # Export settings
   jq . ~/.config/AIFEED/config.json > config_backup.json
   ```

## Getting Additional Help

### Support Channels

1. **In-App Support**
   - Help → Report Issue
   - Includes diagnostic information
   - Automatic log collection

2. **GitHub Issues**
   - [Report Bug](https://github.com/sanchez314c/ai-feed/issues)
   - Include:
     - Operating system and version
     - Application version
     - Steps to reproduce
     - Error messages and logs

3. **Community Forums**
   - Discussions on GitHub
   - Stack Overflow with `aifeed` tag
   - Reddit r/AIFEED

### Diagnostic Information

To include with support requests:

1. **System Information**
   ```bash
   # Generate system report
   AIFEED.exe --system-info > system_info.txt
   ```

2. **Application Logs**
   ```bash
   # Find logs
   # macOS: ~/Library/Logs/AIFEED/
   # Windows: %APPDATA%/AIFEED/logs/
   # Linux: ~/.local/share/AIFEED/logs/
   ```

3. **Configuration Export**
   - Settings → Advanced → Export Configuration
   - Removes sensitive data automatically

### Common Debug Commands

```bash
# Check application version
AIFEED.exe --version

# Verify API connections
AIFEED.exe --test-apis

# Database integrity check
AIFEED.exe --check-db

# Generate full diagnostic report
AIFEED.exe --diagnostic
```

---

**Related Documentation:**
- [Configuration Guide](CONFIGURATION.md)
- [API Reference](API_REFERENCE.md)
- [User Guide](USER_GUIDE.md)