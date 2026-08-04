import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleAction } from '../sdui/ActionHandler';
import { useSDUIStore } from '../stores/hooks/useSDUIStore';
import { ChipItem } from '../types';
import { Colors } from '../constants/Colors';
import { CHIP_HEIGHT, IS_TABLET, rf, rs } from '../utils/Dimensions';

interface Props {
  selected_id?: string;
  items: ChipItem[];
}

export const CategoryChipsComponent: React.FC<Props> = ({ items }) => {
  const navigation = useNavigation<any>();
  const selectedChipId = useSDUIStore(s => s.selectedChipId);
  const setSelectedChip = useSDUIStore(s => s.setSelectedChip);
  const openSheet = useSDUIStore(s => s.openSheet);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {items.map(chip => {
        const isSelected = chip.id === selectedChipId;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() =>
              handleAction(
                chip.action,
                navigation,
                (key, value) =>
                  key === 'selectedCategory' && setSelectedChip(value as string),
                openSheet,
              )
            }>
            <Text
              style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: IS_TABLET ? rs(24) : rs(16),
    paddingVertical: rs(10),
  },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: rs(14),
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    marginRight: rs(8),
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: rf(13),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
