# Vercel Deployment Guide for Typing Challenge

## 📋 Environment Variables for Vercel

Copy these environment variables and add them in your Vercel project settings:

```
VITE_FIREBASE_API_KEY=AIzaSyBwIxCLAfRXBathtwMDneVjiBs0xx75RsI
VITE_FIREBASE_AUTH_DOMAIN=typping-challenge.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=typping-challenge
VITE_FIREBASE_STORAGE_BUCKET=typping-challenge.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=480743995717
VITE_FIREBASE_APP_ID=1:480743995717:web:f3e4d5f2735938f0d2662c
VITE_FIREBASE_MEASUREMENT_ID=G-MQLNT2883K
```

---

## 🚀 Deploy to Vercel

### **Option 1: Deploy via Vercel Dashboard**

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Configure Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add each variable from above (one by one)
   - Apply to: **Production**, **Preview**, and **Development**
5. **Deploy**!

---

### **Option 2: Deploy via Vercel CLI**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables** (run for each variable):
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   # Enter value: AIzaSyBwIxCLAfRXBathtwMDneVjiBs0xx75RsI
   # Select environments: Production, Preview, Development
   ```

5. **Redeploy after adding env vars**:
   ```bash
   vercel --prod
   ```

---

## 📝 Files Created

- ✅ `.env` - Local environment variables (DO NOT commit to Git)
- ✅ `.env.example` - Template for environment variables
- ✅ `vercel.json` - Vercel configuration
- ✅ Updated `src/firebase.js` - Now uses environment variables

---

## ⚙️ How Environment Variables Work

### **Local Development**:
- Vite reads from `.env` file automatically
- Variables must start with `VITE_` prefix

### **Vercel Production**:
- Reads from Vercel project settings
- You set them in Vercel Dashboard or CLI

---

## ✅ Verification

After deployment, check:
1. App loads without errors
2. User registration works
3. Leaderboard displays
4. Admin panel functions

---

## 🔒 Security Note

Your `.env` file is already in `.gitignore`, so your Firebase keys won't be committed to Git. Perfect! ✅
