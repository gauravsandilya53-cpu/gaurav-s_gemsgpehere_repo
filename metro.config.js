/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * GemSphere Books - Metro Config
 * Optimized for Expo Go and Node 22 (Windows).
 * Web support: redirects expo-sqlite to an in-memory web stub.
 */
const config = getDefaultConfig(__dirname);

// Workaround for Node 22 + Metro direct export issues
// Ensures TerminalReporter and other internal subpaths are accessible
config.resolver.unstable_enablePackageExports = false;

// Allow .wasm files to be treated as assets so Metro doesn't error when
// expo-sqlite's worker tries to import the WebAssembly module on web.
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];

// On web, redirect specific native modules to web stubs.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Redirect our sqlite service to the AlaSQL web stub
    if (moduleName.endsWith('storage/sqlite')) {
      return {
        filePath: path.resolve(__dirname, 'src/core/storage/sqlite.web.ts'),
        type: 'sourceFile',
      };
    }
    // Redirect expo-secure-store to a localStorage-backed web stub
    if (moduleName === 'expo-secure-store') {
      return {
        filePath: path.resolve(__dirname, 'src/core/storage/secure-store.web.ts'),
        type: 'sourceFile',
      };
    }
    // Redirect biometry service to a no-op web stub
    if (moduleName.endsWith('core/auth/biometry')) {
      return {
        filePath: path.resolve(__dirname, 'src/core/auth/biometry.web.ts'),
        type: 'sourceFile',
      };
    }
    // Redirect expo-print to browser window.print() stub
    if (moduleName === 'expo-print') {
      return {
        filePath: path.resolve(__dirname, 'src/core/services/print.web.ts'),
        type: 'sourceFile',
      };
    }
    // Redirect expo-sharing to Web Share API stub
    if (moduleName === 'expo-sharing') {
      return {
        filePath: path.resolve(__dirname, 'src/core/services/sharing.web.ts'),
        type: 'sourceFile',
      };
    }
    // Redirect expo-camera to a placeholder component stub
    if (moduleName === 'expo-camera') {
      return {
        filePath: path.resolve(__dirname, 'src/core/services/camera.web.tsx'),
        type: 'sourceFile',
      };
    }
  }
  // Fall back to default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
