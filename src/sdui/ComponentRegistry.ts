import React from 'react';
import { HeaderComponent } from '../components/HeaderComponent';
import { BannerCarouselComponent } from '../components/BannerCarouselComponent';
import { CategoryChipsComponent } from '../components/CategoryChipsComponent';
import { CarCardRailComponent } from '../components/CarCardRailComponent';
import { ValuePropStripComponent } from '../components/ValuePropStripComponent';
import { FooterCTAComponent } from '../components/FooterCTAComponent';
import { UnknownFallbackComponent } from '../components/UnknownFallbackComponent';

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  header: HeaderComponent,
  banner_carousel: BannerCarouselComponent,
  category_chips: CategoryChipsComponent,
  car_card_rail: CarCardRailComponent,
  value_prop_strip: ValuePropStripComponent,
  footer_cta: FooterCTAComponent,
};

export const resolveComponent = (type: string): React.ComponentType<any> => {
  return COMPONENT_REGISTRY[type] ?? UnknownFallbackComponent;
};
