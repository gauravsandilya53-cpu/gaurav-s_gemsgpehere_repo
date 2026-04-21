/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
const { getDefaultConfig } = require('expo/metro-config');

/**
 * GemSphere Books - Metro Config
 * Optimized for Expo Go and Node 22 (Windows).
 */
const config = getDefaultConfig(__dirname);

// Workaround for Node 22 + Metro direct export issues
// Ensures TerminalReporter and other internal subpaths are accessible
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
