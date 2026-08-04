import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { Colors } from '../constants/Colors';
import { IS_TABLET, rf, rs } from '../utils/Dimensions';

interface Props {
  logo_url: string;
  search_placeholder: string;
  location: string;
  notification_count?: number;
}

export const HeaderComponent: React.FC<Props> = ({
  logo_url,
  search_placeholder,
  location,
  notification_count = 0,
}) => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <FastImage source={{ uri: logo_url }} style={styles.logo} />
        <TouchableOpacity style={styles.locationChip}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {location}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          {notification_count > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notification_count}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={search_placeholder}
          placeholderTextColor={Colors.textDisabled}
          style={styles.searchInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: IS_TABLET ? rs(24) : rs(16),
    paddingVertical: rs(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: IS_TABLET ? rs(48) : rs(36),
  },
  logo: {
    width: rs(60),
    height: rs(28),
  },
  locationChip: {
    flex: 1,
    marginLeft: rs(12),
  },
  locationText: {
    fontSize: rf(13),
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  notificationButton: {
    width: rs(36),
    height: rs(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: rf(20),
  },
  notificationBadge: {
    position: 'absolute',
    top: rs(2),
    right: rs(2),
    backgroundColor: Colors.error,
    borderRadius: rs(8),
    minWidth: rs(16),
    height: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(3),
  },
  notificationBadgeText: {
    color: Colors.surface,
    fontSize: rf(10),
    fontWeight: '700',
  },
  searchBar: {
    marginTop: rs(10),
    height: IS_TABLET ? rs(44) : rs(36),
    borderRadius: rs(8),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: rs(12),
  },
  searchInput: {
    flex: 1,
    fontSize: rf(13),
    color: Colors.textPrimary,
    padding: 0,
  },
});
