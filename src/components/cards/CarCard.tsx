import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { CarItem } from '../../types';
import { Colors } from '../../constants/Colors';
import { CAR_CARD_WIDTH, rf, rs } from '../../utils/Dimensions';

interface Props {
  car: CarItem;
  onPress: (car: CarItem) => void;
}

export const CarCard: React.FC<Props> = ({ car, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(car)}>
      <FastImage
        source={{ uri: car.image_url, priority: FastImage.priority.normal }}
        resizeMode={FastImage.resizeMode.cover}
        style={styles.image}
      />
      {car.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{car.badge}</Text>
        </View>
      ) : null}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {car.name}
        </Text>
        <Text style={styles.subtext}>
          {car.year} • {car.km}
        </Text>
        <Text style={styles.price}>{car.price}</Text>
        <Text style={styles.emi}>{car.emi}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CAR_CARD_WIDTH,
    marginRight: rs(12),
    borderRadius: rs(8),
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CAR_CARD_WIDTH * 0.65,
    backgroundColor: Colors.divider,
  },
  badge: {
    position: 'absolute',
    top: rs(8),
    left: rs(8),
    backgroundColor: Colors.primary,
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
    borderRadius: rs(4),
  },
  badgeText: {
    color: Colors.surface,
    fontSize: rf(10),
    fontWeight: '700',
  },
  details: {
    padding: rs(10),
  },
  name: {
    fontSize: rf(14),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtext: {
    fontSize: rf(12),
    color: Colors.textSecondary,
    marginTop: rs(2),
  },
  price: {
    fontSize: rf(16),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: rs(4),
  },
  emi: {
    fontSize: rf(12),
    color: Colors.textSecondary,
    marginTop: rs(2),
  },
});
