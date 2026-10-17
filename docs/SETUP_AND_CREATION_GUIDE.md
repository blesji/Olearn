# Reproducible Setup & Developer Creation Guide — OLearn

## 1. Prerequisites & Environment Requirements

To set up, build, test, and package OLearn from scratch, ensure your development machine meets these requirements:

### 1.1 Web Development Tooling
- **Node.js**: v18.x, v20.x, or v22.x LTS (Recommended: Node 20 or 22)
- **Package Manager**: npm 9.x or 10.x (bundled with Node.js)
- **Operating System**: Windows 10/11, macOS (Apple Silicon or Intel), or Linux (Ubuntu 22.04+)

### 1.2 Android Native Tooling (For Android APK Compilation)
- **Android Studio**: Android Studio Ladybug (2024.2+) or Hedgehog (2023.3+)
- **Java Development Kit (JDK)**: OpenJDK 17 or 21 (configured in `JAVA_HOME`)
- **Android SDK Platform**: API Level 34 or 36 (`compileSdkVersion = 36`, `minSdkVersion = 24`)
- **Android SDK Build-Tools**: 34.0.0 or higher
- **Android Device or Emulator**: Physical Android phone (Android 7.0+ / API 24+) with Developer Options & USB Debugging enabled, or Android Virtual Device (AVD).

---

## 2. Step-by-Step Setup from Clean Checkout

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository_url>
cd OLEARN

# Install all runtime, build, and test dependencies
npm install
```

### Step 2: Verify Static Types and Linting
```bash
npm run lint
```
*Expected Output: Exit code 0 (0 errors).*

### Step 3: Run the Automated Test Suite
```bash
npm test
```
*Expected Output: 123 passed across 12 test suites (100% pass rate).*

### Step 4: Run the Local Web Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` to interact with the responsive web application.

---

## 3. Building the Production Web Bundle

To create the optimized, tree-shaken static production bundle:
```bash
npm run build
```
This generates the compiled assets in `dist/`:
- `dist/index.html`
- `dist/assets/index-*.css`
- `dist/assets/index-*.js`
- `dist/assets/audio/` (All 93 bundled MP3 files)

---

## 4. Synchronizing & Packaging for Android

### Method A: One-Command Automated Build (Recommended)
You can run the consolidated build script directly from your terminal:
```bash
npm run android:build
```
This single command automatically:
1. Builds the production web bundle (`npm run build`).
2. Synchronizes all assets to the native Android directory (`npx cap sync android`).
3. Automatically locates Android Studio's bundled JBR/JDK (`C:\Program Files\Android\Android Studio\jbr`) so manual `JAVA_HOME` configuration is not required.
4. Compiles the native debug APK via Gradle.
5. Emits the fresh installable APK at:
   ```text
   android/app/build/outputs/apk/debug/app-debug.apk (~7.2 MB)
   ```

### Method B: Using Android Studio GUI
1. Synchronize web assets to Android:
   ```bash
   npm run android:sync
   ```
2. Open Android Studio:
   ```bash
   npm run android:open
   ```
3. If this is your first time opening the project, wait for Gradle sync to finish (indicated by the progress bar at the bottom right).
4. In Android Studio, click **Build** $\rightarrow$ **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.

---

## 5. Installing the APK on a Physical Phone

### Option 1: Direct File Transfer (No Developer Setup Required on Phone)
1. Copy `android/app/build/outputs/apk/debug/app-debug.apk` to your phone using any method:
   - Connect via USB cable $\rightarrow$ copy to your phone's **Downloads** folder.
   - Or upload to **Google Drive** / send to yourself via **WhatsApp**.
2. On your phone, open your **Files** or **Downloads** app.
3. Tap `app-debug.apk` and tap **Install** (if prompted, enable "Allow installation from this source").
4. Tap **Open** to launch OLearn.

### Option 2: Via ADB (Android Debug Bridge)
With USB Debugging enabled on your phone:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Offline Verification on Device

1. Disconnect the device from your development computer.
2. Enable **Airplane Mode** on the phone.
3. Launch **OLearn** from the app drawer.
4. Verify that tutorials play voice narration and execute all simulation screens with 0 errors.

---

## 7. Troubleshooting Common Setup Errors

| Error / Symptom | Cause | Proven Solution |
|---|---|---|
| **Build Bundle(s) / APK(s) is greyed out / locked** (`No Configuration Selected`) | Gradle initial sync in Android Studio is incomplete or waiting for SDK platform | Click **File $\rightarrow$ Sync Project with Gradle Files** (elephant icon). Ensure **Android SDK Platform 36** is installed in SDK Manager. Or run `npm run android:build` directly in terminal. |
| `Failed to install platforms;android-36` | Missing Android SDK Platform 36 | Open Android Studio $\rightarrow$ Tools $\rightarrow$ SDK Manager $\rightarrow$ SDK Platforms $\rightarrow$ check **Android 16.0 ("Baklava" / API 36)** $\rightarrow$ Apply. Or run `npm run android:build` which accepts the license and installs it automatically. |
| `JAVA_HOME is not set` in CLI | Terminal does not have Java in PATH | Use `npm run android:build`, which automatically discovers and uses Android Studio's bundled JBR at `C:\Program Files\Android\Android Studio\jbr`. |
| `SDK location not found` | Android SDK path missing | Create `android/local.properties` with: `sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk`. |
| `EADDRINUSE: 5173` | Vite port already in use | Kill previous node process or run `npx vite --port 5174`. |
| `localStorage is not available` | Restricted WebView / Private mode | OLearn automatically activates its built-in `memoryStore` fallback cache without failing. |
| Audio doesn't play in browser | Browser Autoplay Policy | Tap anywhere on the page to grant user interaction permission for audio context. |

