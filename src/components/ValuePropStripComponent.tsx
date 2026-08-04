import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ValuePropItem } from '../types';
import { Colors } from '../constants/Colors';
import { IS_TABLET, rf, rs } from '../utils/Dimensions';

interface Props {
  items: ValuePropItem[];
}

export const ValuePropStripComponent: React.FC<Props> = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map(item => (
        <View key={item.title} style={styles.item}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: IS_TABLET ? rs(16) : rs(8),
    paddingVertical: rs(16),
    backgroundColor: Colors.surface,
  },
  item: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: rs(8),
    paddingHorizontal: rs(8),
  },
  icon: {
    fontSize: rf(20),
    color: Colors.success,
    marginBottom: rs(4),
  },
  title: {
    fontSize: rf(13),
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: rf(11),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: rs(2),
  },
});
