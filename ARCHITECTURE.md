# GemSphere Books - Mobile Architecture

## 📜 Copyright Notice
All code, documentation, and intellectual property within this project are **© GemSphere Technologies Private Limited**. All rights reserved. Unauthorized copying, distribution, or usage is strictly prohibited under international copyright laws. Unauthorized usage will be prosecuted to the maximum extent permitted by law.

## 🛠️ Technical Stack (Expo Go Optimized)
- **Framework**: Expo SDK (+ React Native)
- **Database**: `expo-sqlite` (Relational & Offline-First)
- **State**: Zustand (Store) + React Query (API Sync)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Security**: Expo Secure Store (Token) + Local Authentication (Biometrics)
- **Storage**: AsyncStorage (User Preferences)

## 🏗️ Layers

### 1. Presentation Layer (`src/presentation`)
Responsible for the UI and user interaction.
- **Screens**: Composable UI components representing full screens.
- **Components**: Reusable UI elements (Buttons, Inputs, Cards).
- **Features**: Grouped screens and logic by business modules (Auth, Billing, etc.).
- **State (Zustand)**: Lightweight and fast state management.

### 2. Domain Layer (`src/domain`)
Contains the business logic and rules. This layer remains independent of any external libraries or UI frameworks.
- **Entities**: Plain TypeScript objects representing core business data.
- **Use Cases**: Specific business operations (e.g., `CreateOrder`, `AuthorizeUser`).
- **Repositories (Interfaces)**: Abstractions defining how data should be fetched or saved.

### 3. Data Layer (`src/data`)
Implements the repository interfaces and handles data synchronization.
- **Repositories (Implementations)**: Orchestrate data between local and remote sources.
- **Models**: DTOs for API requests and database rows.
- **Services**: Low-level data fetching logic (Axios client, SQLite queries).

### 4. Core Layer (`src/core`)
Shared infrastructure and utilities.
- **API**: Axios instance with interceptors (Multi-tenant aware).
- **Storage**: AsyncStorage and `expo-sqlite` wrappers.
- **Auth**: Expo Secure Store and Biometric security abstractions.
- **i18n**: Multi-language support configuration (i18next).
- **Theme**: Design system tokens (colors, typography).

---

## 💾 Storage Strategy
- **AsyncStorage**: Used for persistent settings and lightweight UI state.
- **expo-sqlite**: Used for mission-critical relational data (Orders, Suppliers, Products, Ledger) to support professional offline-first accounting.

## 📡 Offline-First & Sync Engine
1. User performs an action (e.g., Create Order).
2. Data is immediately saved to **SQLite**.
3. A background task (`SyncService`) is queued to sync with the **GemSphere Commerce API**.
4. If offline, the queue persists; once online, the interceptor re-attempts synchronization.
5. Multi-tenancy is handled via the `tenantId` context extracted from the user session.

## 🌍 Global Support
- **i18next**: Strings are externalized with support for 20+ languages.
- **RTL**: Layouts automatically flip for RTL languages like Arabic.
- **Localization**: Specialized utilities handle varied Date, Currency (GST/VAT), and Number formatting.
- **ASO & SEO**: Configured deep linking and app metadata for global store discovery.
