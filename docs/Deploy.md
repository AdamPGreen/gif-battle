# Gif Battle Deployment Guide

This document serves as a comprehensive deployment guide for the Gif Battle application. It contains all the necessary commands and context to make the application live after local development.

## Architecture Overview

Gif Battle uses a combination of Firebase services and Vercel for deployment:

- **Firebase** 
  - **Authentication**: User login and registration
  - **Firestore**: Database storage (named "gifbattle")
  - **Cloud Functions**: Backend logic
  - **Storage**: Media storage for uploaded files
  - **Realtime Database**: For live updates

- **Vercel**
  - **Hosting**: Frontend application hosting
  - **CI/CD**: Automatic deployments from GitHub

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase account with the project "gif-battle-bceab" set up
3. GitHub repository linked to Vercel for automatic deployments
4. Firebase project configured with the correct database name ("gifbattle")

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Start Firebase emulators (in a separate terminal)
firebase emulators:start
```

## Deployment Process

### 1. Prepare for Deployment

Before deploying, ensure:

- All changes are committed to git
- You've tested the application locally
- You're logged in to Firebase (`firebase login`)

### 2. Deploy Firebase Services

Deploy all Firebase services (excluding hosting, which is handled by Vercel):

```bash
firebase deploy --only storage,functions,database
```

If you only need to deploy specific services:

```bash
# Deploy only functions
firebase deploy --only functions

# Deploy only storage rules
firebase deploy --only storage

# Deploy only database rules
firebase deploy --only database
```

### 3. Deploy Frontend to Vercel (via GitHub)

Push your changes to GitHub, and Vercel will automatically deploy:

```bash
# Check status of your git repository
git status

# Add all changed files
git add .

# Commit changes
git commit -m "Your descriptive commit message"

# Push to GitHub (which triggers Vercel deployment)
git push origin main
```

### 4. Verify Deployment

After deployment:

1. Check Firebase Console for successful deployment of backend services
2. Visit the Vercel dashboard to monitor frontend deployment progress
3. Test the live application at your Vercel deployment URL

## Troubleshooting

### GitHub Push Issues

If you encounter "HTTP 400" errors when pushing to GitHub:

```bash
# Increase Git buffer size
git config http.postBuffer 157286400
```

### Firebase Deployment Issues

If you encounter issues with Firestore deployment:

```bash
# Confirm your database name
firebase firestore:databases:list

# Deploy excluding Firestore
firebase deploy --except firestore
```

### Database Connection Issues

If the application can't connect to the database:

1. Check Firebase Console for database rules
2. Verify the database name in your application configuration (should be "gifbattle", not "(default)")
3. Check that all required APIs are enabled in the Firebase Console

## Rollback Procedures

If you need to rollback to a previous deployment:

1. For Firebase: Use the Firebase Console to rollback functions or use a previous deployment

2. For Vercel: In the Vercel dashboard, find the previous deployment and click "Redeploy"

## Maintenance Window Recommendations

Best times for deployment:

- Weekday evenings (lowest user activity)
- Avoid deploying on Fridays if possible
- Schedule major updates with potential downtime during planned maintenance windows

---

*This deployment document should be updated as the deployment process evolves.* 