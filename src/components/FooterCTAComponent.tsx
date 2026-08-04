import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleAction } from '../sdui/ActionHandler';
import { useSDUIStore } from '../stores/hooks/useSDUIStore';
import { SDUIAction, SDUILayout } from '../sdui/schema.types';
import { Colors } from '../constants/Colors';
import { IS_TABLET, rf, rs, rw } from '../utils/Dimensions';

interface Props {
  title: string;
  subtitle?: string;
  cta_text: string;
  background_color?: string;
  action?: SDUIAction;
  layout?: SDUILayout;
}

export const FooterCTAComponent: React.FC<Props> = ({
  title,
  subtitle,
  cta_text,
  background_color,
  action,
  layout,
}) => {
  const navigation = useNavigation<any>();
  const setSelectedChip = useSDUIStore(s => s.setSelectedChip);
  const openSheet = useSDUIStore(s => s.openSheet);

  return (
    <View
      style={[
        styles.container,
        background_color && { backgroundColor: background_color },
        layout?.margin !== undefined && { margin: layout.margin },
        layout?.borderRadius !== undefined && {
          borderRadius: layout.borderRadius,
        },
        layout?.maxWidth !== undefined && { maxWidth: layout.maxWidth },
      ]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() =>
          handleAction(
            action,
            navigation,
            (key, value) =>
              key === 'selectedCategory' && setSelectedChip(value as string),
            openSheet,
          )
        }>
        <Text style={styles.ctaText}>{cta_text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: rs(20),
    borderRadius: rs(12),
    backgroundColor: Colors.primary,
    maxWidth: IS_TABLET ? rw(60) : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
  },
  title: {
    fontSize: rf(IS_TABLET ? 20 : 16),
    fontWeight: '700',
    color: Colors.surface,
  },
  subtitle: {
    fontSize: rf(IS_TABLET ? 15 : 13),
    color: Colors.surface,
    marginTop: rs(4),
  },
  ctaButton: {
    height: IS_TABLET ? rs(52) : rs(44),
    borderRadius: rs(8),
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rs(16),
  },
  ctaText: {
    color: Colors.primary,
    fontSize: rf(15),
    fontWeight: '700',
  },
});
