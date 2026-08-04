import { NavigationProp } from '@react-navigation/native';
import { Linking } from 'react-native';
import { SDUIAction } from './schema.types';

export const handleAction = (
  action: SDUIAction | undefined,
  navigation: NavigationProp<any>,
  setState: (key: string, value: unknown) => void,
  openSheet: (sheetId: string) => void,
): void => {
  if (!action) return;

  switch (action.type) {
    case 'navigate': {
      const screen = action.payload.screen as string;
      if (screen.startsWith('http')) {
        Linking.openURL(screen).catch(console.warn);
      } else if (navigation.getState()?.routeNames.includes(screen)) {
        navigation.navigate(screen, action.payload);
      } else {
        // Server can reference screens the client hasn't built yet (e.g. car_detail,
        // rc_transfer) — this is the SDUI graceful-degradation contract, not a bug.
        console.warn(`SDUI navigate: unregistered screen "${screen}"`);
      }
      break;
    }

    case 'update_state':
      setState(action.payload.key as string, action.payload.value);
      break;

    case 'open_sheet':
      openSheet(action.payload.sheet_id as string);
      break;

    case 'external_url':
      Linking.openURL(action.payload.url as string).catch(console.warn);
      break;

    case 'filter':
      setState('activeFilter', action.payload.filter_id);
      break;

    default:
      console.warn(`Unknown SDUI action type: ${(action as any).type}`);
  }
};
