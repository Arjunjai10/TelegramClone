# 📱 Telegram Clone — React Native Real-Time Chat Application

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.84.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native Version">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-23.8.6-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Zustand-5.0.11-4B32C3?style=for-the-badge&logo=react&logoColor=white" alt="Zustand">
  <img src="https://img.shields.io/badge/Architecture-New%20%2B%20Hermes-00A98F?style=for-the-badge" alt="New Arch + Hermes">
</p>

A feature-rich, high-performance real-time messaging mobile application inspired by **Telegram**. Built using the latest **React Native 0.84** with **TypeScript**, **Zustand** for state management, **React Navigation 7**, and fully integrated with the **Firebase Suite** (Auth, Firestore, Cloud Messaging, and Storage) for a secure, highly scalable backend infrastructure.

---

## ✨ Key Features

- **🔐 Robust Authentication & Identity:**
  - Secure Email/Password Sign-up and Login via **Firebase Auth**.
  - One-click Google Authentication powered by `@react-native-google-signin/google-signin`.
  - Persistent user sessions and profile customization.

- **💬 Real-Time Messaging & Chat Experience:**
  - Instant message synchronization using **Firebase Firestore** with low-latency bidirectional communication.
  - Chat screen built with gesture optimization (`react-native-gesture-handler`) and smooth scroll dynamics.
  - Live network connectivity tracking via `@react-native-community/netinfo` to manage offline/online message queuing.

- **🖼️ Rich Media Sharing & Storage:**
  - Integrated photo and file sharing powered by `@react-native-firebase/storage` and `react-native-image-picker`.
  - Secure cloud storage for chat media attachments, user avatars, and custom document sharing.

- **🔔 Advanced Native Push Notifications:**
  - High-priority interactive push notification delivery via `@notifee/react-native` and **Firebase Cloud Messaging (FCM)**.
  - Custom foreground and background notification alerts with badges, actions, and channels.

- **📒 Native Phone Contacts Integration:**
  - Discover friends and sync phone contacts natively using `react-native-contacts`.
  - Easily initiate chats with active platform contacts from your address book.

- **⚡ Modern Architectural Performance:**
  - Powered by the **Hermes JS Engine** and React Native's **New Architecture (Fabric & TurboModules enabled)** for instant rendering and minimal memory usage.
  - Seamless native splash screen transitions via `react-native-bootsplash`.

---

## 🛠️ Technology Stack & Libraries

| Category | Technology / Library | Version | Description |
| :--- | :--- | :--- | :--- |
| **Core** | `react-native` | `0.84.0` | Mobile application framework (New Arch & Hermes enabled) |
| **Language** | `typescript` / `react` | `5.8.3` / `19.2.3` | Strongly typed functional UI development |
| **State Management** | `zustand` | `^5.0.11` | Lightweight, fast, and scalable global state management |
| **Navigation** | `@react-navigation/stack & bottom-tabs` | `^7.x.x` | Intuitive native screen transitions and tabs |
| **Backend & Auth** | `@react-native-firebase/*` & `google-signin` | `^23.8.6` | Authentication, Firestore DB, Storage & FCM Messaging |
| **Notifications** | `@notifee/react-native` | `^9.1.8` | Advanced native iOS & Android local/push notification management |
| **Media & Hardware** | `react-native-image-picker`, `contacts` | `^8.2.1` / `^8.0.10` | Native camera, gallery gallery, and contacts synchronization |

---

## 🏗️ Project Architecture

```text
C:\Github Repositories\TelegramClone
├── android/                 # Native Android source code & Gradle build configuration
├── ios/                     # Native iOS workspace, CocoaPods, and Xcode configs
├── src/
│   ├── components/          # Reusable customized UI components (Buttons, Chat bubbles, Inputs)
│   ├── constants/           # Global application constants, theme colors, typography
│   ├── navigation/          # React Navigation routers (Tab Navigator, Auth Stack, Main Stack)
│   ├── screens/             # UI views mapped by feature domains:
│   │   ├── auth/            #   └── Login, Registration, and Onboarding screens
│   │   ├── chat/            #   └── Active Conversation & Message history screens
│   │   ├── home/            #   └── Recent Chats List, Contacts Overview, & Search
│   │   └── settings/        #   └── User Preferences, Profile Customization, & Logout
│   ├── services/            # API integration Layer & Firebase Controllers:
│   │   ├── authService.ts   #   └── Firebase & Google Authentication routines
│   │   ├── chatService.ts   #   └── Firestore message queries and real-time listeners
│   │   ├── notificationService.ts # FCM and Notifee configuration
│   │   ├── storageService.ts#   └── File uploading and CDN URL retrieval
│   │   └── userService.ts   #   └── Firestore profiles and status updates
│   └── store/               # Zustand global store hooks (Chat store, User status store)
├── App.tsx                  # Root Application React component & Theme/Context Provider
├── index.js                 # Metro bundling React Native runtime registration entrypoint
└── package.json             # NPM package scripts & dependency configurations
```

---

## 🚀 Getting Started

### 1️⃣ System Requirements & Prerequisites
Before building the application locally, ensure your machine has the following tools installed and properly configured in your system path:
- **Node.js**: `>= 22.11.0` (Use nvm for easily switching versions).
- **Java JDK (IMPORTANT)**: **`JDK 17 or higher`** is explicitly required for React Native `0.84.0` and Gradle `8.x`.
  - *If your build fails with a JVM 11 error, verify your `JAVA_HOME` environment variable points directly to a Java 17+ installation directory.*
- **Android Development**: Android Studio, configured Android SDK Platforms, and build tools (`20.1.0+`).
- **iOS Development (macOS only)**: Xcode `15+`, Xcode Command Line Tools, and **CocoaPods** installed (`bundle exec pod install`).

### 2️⃣ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arjunjai10/TelegramClone.git
   cd TelegramClone
   ```

2. **Install JavaScript dependencies:**
   ```bash
   npm install
   # OR using Yarn
   yarn install
   ```

3. **Configure Firebase Secrets & Environment:**
   - Add your Google Firebase configuration file (`google-services.json`) into the `android/app/` directory.
   - Add your iOS Firebase credential (`GoogleService-Info.plist`) into the `ios/` workspace using Xcode.
   - Set up your local `.env` configuration file if custom keys are used.

4. **Install iOS CocoaPods (macOS users):**
   ```bash
   cd ios && bundle exec pod install && cd ..
   ```

### 3️⃣ Running the Application

1. **Start the Metro Bundler:**
   Open a terminal window and initiate the local bundler server:
   ```bash
   npm start
   ```

2. **Run on Android Emulator / Physical Device:**
   In a separate terminal, deploy the native app directly to your connected Android device or running emulator:
   ```bash
   # Make sure JAVA_HOME is pointing to JDK 17+
   npm run android
   ```
   *(On Windows PowerShell, if testing temporary JDK configurations, you can run: `$env:JAVA_HOME="C:\Program Files\Java\jdk-17"; npm run android`)*

3. **Run on iOS Simulator / Physical Device (macOS):**
   ```bash
   npm run ios
   ```

---

## 🧪 Testing & Linting

Keep code clean, compliant, and verified using existing scripts:

```bash
# Execute unit & snapshot tests via Jest
npm test

# Check code consistency and TypeScript syntax via ESLint & TSC
npm run lint
npx tsc --noEmit
```

---

## 🐞 Common Troubleshooting

- **Gradle JVM Error (`Gradle requires JVM 17 or later`):**
  Your system environment `JAVA_HOME` is pointed to Java 8 or Java 11. Point `JAVA_HOME` in your operating system environment variables directly to `C:\Program Files\Java\jdk-17` (or corresponding JDK 17 path on Linux/Mac) or customize `org.gradle.java.home` within your `android/gradle.properties` file.
- **Metro Caching & Resetting Bundles:**
  If you run into dependency caching bugs or stale builds, execute a reset start:
  ```bash
  npx react-native start --reset-cache
  ```

---

## 📄 License & Contributing
This repository is freely available under the **MIT License**. Contributions, bug reports, and feature improvements via Pull Requests are warmly welcomed!
