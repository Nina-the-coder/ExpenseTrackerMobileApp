# PlayStore Publication Checklist

## ✅ Pre-Publication Requirements

### Code Quality & Testing

- [x] App works in guest mode without backend
- [x] All core features tested (add, edit, delete expenses)
- [x] Theme switching works
- [x] Date filters work correctly
- [x] Category filters work
- [x] Expense sync logic handles offline/online
- [x] Error handling implemented
- [ ] User acceptance testing completed
- [ ] Performance optimization done
- [ ] No console errors or warnings

### App Configuration

- [x] App name and slug configured (`expense-tracker`)
- [x] Package name set (`com.anonymous.expensetracker`)
- [x] Android permissions declared
- [x] Adaptive icon configured
- [x] Splash screen configured
- [x] Version set (`1.0.0`)
- [x] Orientation set to portrait
- [ ] Update package name to unique identifier (com.yourname.expensetracker)
- [ ] Consider changing app name if needed
- [ ] Update icon to high-quality image (192x192 PNG)

### Documentation

- [x] Privacy Policy created
- [x] Terms of Service created
- [x] README updated with features and instructions
- [ ] Screenshots prepared (4-6 high-quality images)
- [ ] Promotional graphics created (icon, feature graphics)
- [ ] App description written
- [ ] Release notes prepared

### Account Setup

- [ ] Google Play Developer account created ($25 one-time fee)
- [ ] Merchant account configured
- [ ] Tax information provided
- [ ] Payment method added

### Build Configuration

- [ ] EAS CLI installed and authenticated
- [ ] eas.json configured correctly
- [ ] Signing key created or imported
- [ ] Build tested on Android emulator/device
- [ ] APK generated and tested

## 📋 PlayStore Submission Checklist

### Store Listing

- [ ] App title (≤50 chars): "Expense Tracker"
- [ ] Short description (≤80 chars): "Simple offline expense tracking"
- [ ] Full description (≤4000 chars): Prepared and compelling
- [ ] Category: Finance
- [ ] Content rating: Completed questionnaire
- [ ] Privacy policy URL: Link to [PRIVACY_POLICY.md](../PRIVACY_POLICY.md)
- [ ] Contact email: support@expensetracker.com
- [ ] Website URL: (if available)

### Graphics & Media

- [ ] App icon (512x512 PNG, no rounded corners)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (minimum 2, up to 8, at least one showing key features)
  - Screenshot 1: Main expense list
  - Screenshot 2: Add expense form
  - Screenshot 3: Filters/categories
  - Screenshot 4: Dark theme view
- [ ] Promotional graphic (180x120 PNG) - optional

### Metadata

- [ ] Screenshots alt text added
- [ ] Promotional text added
- [ ] Video preview (optional): Consider adding demo video
- [ ] Language: English (US)
- [ ] Release notes: "Initial release - Guest mode with full offline support"

### Content Rating

- [ ] Questionnaire completed
- [ ] Appropriate rating assigned
- [ ] No prohibited content

### Pricing & Distribution

- [ ] Price: Free
- [ ] Free trial: N/A
- [ ] Countries: Select all or specific regions
- [ ] Device requirements: Android 5.0+
- [ ] Tablets: Supported if applicable

### Sensitive Permissions

- [ ] INTERNET: Justified (needed for optional sync)
- [ ] ACCESS_NETWORK_STATE: Justified (check connectivity)
- [ ] Explain why permissions are needed

## 🏗️ Build & Testing Steps

### 1. Before Building

```bash
cd frontend
npm install
npm start  # Test the app once more
```

### 2. Create Android Build

```bash
eas build --platform android --profile production
```

### 3. Test the Build

- Download the APK from EAS
- Install on Android device/emulator
- Test all features:
  - Add expense with different dates
  - Edit expense
  - Delete expense
  - Filter by category
  - Filter by date range
  - Switch themes
  - Continue as guest without backend

### 4. Final Checks

- [ ] No crashes or force closes
- [ ] All UI elements render correctly
- [ ] Buttons are responsive
- [ ] Dates are stored correctly
- [ ] Theme switching works
- [ ] Offline functionality confirmed

## 📤 Submission Process

1. **Create Store Listing**

   - Go to Google Play Console
   - Create new app
   - Fill in all store listing details

2. **Upload APK/AAB**

   - Go to "Release" → "Production"
   - Upload the AAB file generated from EAS
   - Wait for review (typically 2-3 hours)

3. **Final Review**

   - Verify all details are correct
   - Review privacy policy
   - Check content rating
   - Confirm pricing and distribution

4. **Submit for Review**

   - Click "Submit for review"
   - Wait for Google Play approval
   - Status will show in console

5. **Post-Approval**
   - App will automatically go live
   - Monitor reviews and crashes
   - Plan future updates

## 📊 Post-Launch Monitoring

- [ ] Monitor app ratings and reviews
- [ ] Check crash analytics in Play Console
- [ ] Track install and uninstall rates
- [ ] Monitor user retention
- [ ] Review feedback for improvements
- [ ] Plan version 1.1 with improvements

## 🚀 Version Update Plan

### Version 1.1 (Planned)

- [ ] Add backup/restore functionality
- [ ] iOS release
- [ ] More expense categories
- [ ] Recurring expenses
- [ ] Export to CSV

### Version 1.2 (Planned)

- [ ] Graphs and analytics
- [ ] Budget tracking
- [ ] Multiple currencies
- [ ] Widgets

## 📝 Notes

- **Current Status:** Ready for PlayStore
- **Guest Mode:** Fully functional without backend
- **Backend Optional:** App works perfectly offline
- **Backend URL:** Update in `src/config/api.js` when server is available
- **Support Email:** Update in app settings as needed

---

**Last Updated:** December 3, 2025  
**App Version:** 1.0.0  
**Target:** Google Play Store
