import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from '@d11/react-native-fast-image';
import { handleAction } from '../sdui/ActionHandler';
import { useSDUIStore } from '../stores/hooks/useSDUIStore';
import { BannerItem } from '../types';
import { Colors } from '../constants/Colors';
import { BANNER_HEIGHT, rf, rs, SCREEN_WIDTH } from '../utils/Dimensions';

interface Props {
  autoplay?: boolean;
  interval_ms?: number;
  items: BannerItem[];
}

export const BannerCarouselComponent: React.FC<Props> = ({
  autoplay = false,
  interval_ms = 3000,
  items,
}) => {
  const navigation = useNavigation<any>();
  const setSelectedChip = useSDUIStore(s => s.setSelectedChip);
  const openSheet = useSDUIStore(s => s.openSheet);
  const listRef = useRef<FlatList<BannerItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % items.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, interval_ms);
    return () => clearInterval(timer);
  }, [autoplay, interval_ms, items.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slide}
            activeOpacity={0.9}
            onPress={() =>
              handleAction(
                item.action,
                navigation,
                (key, value) =>
                  key === 'selectedCategory' && setSelectedChip(value as string),
                openSheet,
              )
            }>
            <FastImage source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{item.cta_text}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {items.map((item, i) => (
          <View
            key={item.id}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.divider,
  },
  overlay: {
    position: 'absolute',
    bottom: rs(16),
    left: rs(16),
  },
  title: {
    color: Colors.surface,
    fontSize: rf(18),
    fontWeight: '700',
    marginBottom: rs(8),
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    borderRadius: rs(6),
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: Colors.surface,
    fontSize: rf(13),
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: rs(8),
  },
  dot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: Colors.border,
    marginHorizontal: rs(3),
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: rs(16),
  },
});
