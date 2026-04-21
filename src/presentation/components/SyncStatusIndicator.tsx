/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InvoiceRepository } from '../../data/repositories/InvoiceRepository';
import { Theme } from '../../core/theme';

export const SyncStatusIndicator = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const pending = InvoiceRepository.getPendingSync().length;
      setPendingCount(pending);
    }, 5000); // Poll every 5 seconds for visual update

    return () => clearInterval(interval);
  }, []);

  if (pendingCount === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>ðŸ”„ {pendingCount} items pending sync</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: Theme.Palette.secondary,
    paddingHorizontal: Theme.Spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 5,
  },
  text: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

