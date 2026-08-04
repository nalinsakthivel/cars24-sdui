import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { rf, rs } from '../../utils/Dimensions';

interface Props {
  onRetry: () => void;
}

export const SDUIErrorState: React.FC<Props> = ({ onRetry }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Couldn't load the page.</Text>
    <TouchableOpacity style={styles.button} onPress={onRetry}>
      <Text style={styles.buttonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(24),
  },
  text: {
    fontSize: rf(14),
    color: Colors.textSecondary,
    marginBottom: rs(12),
  },
  button: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: '700',
    fontSize: rf(14),
  },
});
