import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const IS_TABLET = SCREEN_WIDTH >= 768;

const BASE_WIDTH = 375;
const scale = SCREEN_WIDTH / BASE_WIDTH;

export const rf = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * Math.min(scale, 1.4)));

export const rs = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

export const rw = (percent: number): number =>
  Math.round((SCREEN_WIDTH * percent) / 100);

export const rh = (percent: number): number =>
  Math.round((SCREEN_HEIGHT * percent) / 100);

export const GRID_COLUMNS = IS_TABLET ? 3 : 2;

const CARD_GAP = rs(12);
const HORIZONTAL_PADDING = rs(16);
export const CAR_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

export const BANNER_HEIGHT = IS_TABLET ? rh(25) : rh(22);

export const CHIP_HEIGHT = IS_TABLET ? rs(44) : rs(36);

export { SCREEN_WIDTH, SCREEN_HEIGHT };
