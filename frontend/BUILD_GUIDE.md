# Build Guide - Expense Tracker for PlayStore

## Prerequisites

1. **Node.js** 16 or higher
2. **Expo CLI**: `npm install -g expo-cli`
3. **EAS CLI**: `npm install -g eas-cli`
4. **Google Play Developer Account** ($25 one-time)
5. **Git** (for version control)

## Step 1: Setup Expo & EAS Account

```bash
# Login to Expo
expo login

# Login to EAS
eas login

# Verify login
eas whoami
```

## Step 2: Initialize EAS (if not already done)

```bash
cd frontend
eas init
```

This will create/update `eas.json` with your project ID.

## Step 3: Verify Configuration

Check your `app.json`:

```json
{
  "expo": {
    "name": "Expense Tracker",
    "slug": "expense-tracker",
    "version": "1.0.0",
    "android": {
      "package": "com.anonymous.expensetracker",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

## Step 4: Test Locally First

```bash
# Start dev server
npm start

# Press 'a' to open in Android emulator
# Or scan QR code with Expo Go app
```

Test all features:

- ✅ Add expense
- ✅ Edit expense
- ✅ Delete expense
- ✅ Filter by date
- ✅ Filter by category
- ✅ Switch theme
- ✅ Guest mode works

## Step 5: Create Production Build

### Option A: Using EAS (Recommended)

```bash
# Build APK for PlayStore
eas build --platform android --profile production
```

This will:

1. Compile your app
2. Generate signed APK/AAB
3. Upload to EAS servers
4. Provide download link

**First time setup:**

- EAS will ask to create a keystore
- Choose "Generate new keystore"
- Choose "Store my keystore and credentials on EAS servers"

### Option B: Local Build (Advanced)

```bash
eas build --platform android --profile production --local
```

Requires Android SDK and build tools installed locally.

## Step 6: Download & Test Build

1. Go to https://expo.dev/builds
2. Find your build in the list
3. Click download for Android
4. Install APK on device/emulator:

```bash
# Install APK
adb install -r path/to/build.apk
```

5. Test thoroughly on real Android device
6. Check for:
   - ✅ App launches without crashes
   - ✅ All buttons work
   - ✅ Data persists after restart
   - ✅ Theme toggle works
   - ✅ Dates save correctly
   - ✅ No console errors

## Step 7: Prepare for PlayStore

### Generate AAB (App Bundle)

AAB is preferred over APK for PlayStore:

```bash
# Build AAB
eas build --platform android --profile production
```

The system will automatically create AAB if using EAS.

### Create Signing Key

First build will prompt you to create a signing key:

```
? Generate a new Android Keystore? › (Y/n)
```

Answer **Yes** and EAS will manage it for you.

## Step 8: Setup Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with Google account
3. Pay $25 one-time fee
4. Complete merchant account setup
5. Accept developer agreement

## Step 9: Create App on PlayStore

1. **New App**

   - Click "Create app"
   - App name: "Expense Tracker"
   - Default language: English (US)
   - App type: Free app
   - Declarations: Accept terms

2. **App listing**

   - Short description: "Track your expenses offline"
   - Full description: See below
   - Category: Finance
   - Add screenshots (4-6 images)
   - Upload app icon (512x512)

3. **Content rating**

   - Fill questionnaire
   - Get rating certificate

4. **Pricing & distribution**
   - Price: Free
   - Countries: Select all
   - Device categories: Required device features - none required

### Sample App Description:

```
Track your daily expenses with ease!

Expense Tracker is a lightweight, privacy-focused expense management app that works completely offline.

✨ KEY FEATURES:
• No account required - Use guest mode instantly
• 100% Offline - Your data never leaves your device
• Dark & Light Theme - Choose your style
• Smart Filters - Sort by category, date, and more
• Quick Summary - See your spending at a glance
• Easy to Use - Clean, intuitive interface

💾 HOW IT WORKS:
Simply open the app and start tracking! In guest mode, all your expenses are saved locally on your phone. No internet needed, no ads, no tracking.

🔒 PRIVACY FIRST:
Your financial data stays on your device. Period. No cloud upload, no analytics, no third-party sharing.

Perfect for:
• Daily expense tracking
• Budget awareness
• Finding spending patterns
• Quick expense logging

Get started in seconds - no setup required!
```

## Step 10: Upload APK/AAB

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload your AAB file from EAS
4. Add release notes:

```
Version 1.0.0 - Initial Release

✨ New Features:
• Guest mode for instant access
• Offline expense tracking
• Dark/light theme support
• Smart category and date filtering
• Expense summary and totals

🎯 Perfect for tracking daily expenses without any account signup required!
```

5. Review all details
6. Click **Submit for review**

## Step 11: Wait for Review

- Google typically reviews within 2-3 hours
- You'll receive email when approved or rejected
- If rejected, review feedback and resubmit

## Step 12: Post-Launch

1. **Monitor**

   - Check Play Console dashboard
   - Monitor ratings and reviews
   - Track crashes in Vitals

2. **Respond to reviews**

   - Reply to user feedback
   - Fix reported issues
   - Release updates as needed

3. **Track metrics**
   - Install rate
   - Uninstall rate
   - User retention
   - Crash rate

## Troubleshooting

### Build fails with "Android SDK not found"

```bash
# On Mac:
brew install android-sdk

# Or use EAS remote build:
eas build --platform android --remote
```

### "Project not initialized"

```bash
cd frontend
eas init  # Follow prompts
```

### Upload fails to PlayStore

- Check AAB file size (should be <500MB)
- Verify signing certificate
- Check version code (must increase each build)

### App crashes on launch

```bash
# Check logs
adb logcat | grep FATAL
```

## Version Updates

For future versions:

1. Update version in `app.json`:

```json
"version": "1.0.1"
```

2. Rebuild:

```bash
eas build --platform android --profile production
```

3. Upload new AAB to PlayStore
4. Add release notes
5. Submit for review

---

**Questions?** Check [README.md](./README.md) or Google Play Console documentation.
