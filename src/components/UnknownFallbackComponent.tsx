import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  type?: string;
}

export const UnknownFallbackComponent: React.FC<Props> = ({ type }) => {
  if (__DEV__) {
    return (
      <View style={styles.devContainer}>
        <Text style={styles.devText}>⚠️ Unknown component: "{type}"</Text>
        <Text style={styles.devSubtext}>Register in ComponentRegistry</Text>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  devContainer: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning,
    backgroundColor: Colors.primaryLight,
  },
  devText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  devSubtext: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
