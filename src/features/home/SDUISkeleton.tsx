import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BANNER_HEIGHT, IS_TABLET, rs, SCREEN_WIDTH } from '../../utils/Dimensions';

export const SDUISkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.header} />
    <View style={styles.banner} />
    <View style={styles.cardRow}>
      <View style={styles.card} />
      <View style={styles.card} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    height: IS_TABLET ? rs(72) : rs(56),
    backgroundColor: Colors.divider,
  },
  banner: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: Colors.divider,
    marginTop: rs(8),
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: rs(16),
    marginTop: rs(16),
  },
  card: {
    width: SCREEN_WIDTH * 0.4,
    height: rs(160),
    borderRadius: rs(8),
    backgroundColor: Colors.divider,
    marginRight: rs(12),
  },
});
