# Gif Battle

A multiplayer GIF contest application where users can compete by submitting GIFs based on prompts.

## Deployment Process

This application uses:
- **Firebase** for authentication, database (Firestore), and storage
- **Vercel** for hosting and deployment

For a complete deployment guide, please see the [detailed deployment documentation](docs/Deploy.md).

### Quick Deployment Steps

1. **Firebase Deployment**
   ```
   firebase deploy --only storage,functions,database
   ```
   This deploys the Firebase components (auth, database, storage).

2. **Vercel Deployment**
   The application is automatically deployed to Vercel when changes are pushed to the main branch on GitHub.
   ```
   git push origin main
   ```

### Troubleshooting

- If experiencing GitHub push issues with "HTTP 400" errors, try increasing the Git buffer size:
  ```
  git config http.postBuffer 157286400
  ``` 