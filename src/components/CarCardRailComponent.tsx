import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { CarCard } from './cards/CarCard';
import { handleAction } from '../sdui/ActionHandler';
import { useSDUIStore } from '../stores/hooks/useSDUIStore';
import { CarItem } from '../types';
import { Colors } from '../constants/Colors';
import { IS_TABLET, rf, rs } from '../utils/Dimensions';

interface Props {
  title: string;
  subtitle?: string;
  items: CarItem[];
}

export const CarCardRailComponent: React.FC<Props> = ({
  title,
  subtitle,
  items,
}) => {
  const navigation = useNavigation<any>();
  const setSelectedChip = useSDUIStore(s => s.setSelectedChip);
  const openSheet = useSDUIStore(s => s.openSheet);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <FlashList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CarCard
            car={item}
            onPress={car =>
              handleAction(
                car.action,
                navigation,
                (key, value) =>
                  key === 'selectedCategory' && setSelectedChip(value as string),
                openSheet,
              )
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: rs(12),
  },
  header: {
    paddingHorizontal: IS_TABLET ? rs(24) : rs(16),
    marginBottom: rs(10),
  },
  title: {
    fontSize: rf(18),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: rf(13),
    color: Colors.textSecondary,
    marginTop: rs(2),
  },
  listContent: {
    paddingHorizontal: IS_TABLET ? rs(24) : rs(16),
  },
});
