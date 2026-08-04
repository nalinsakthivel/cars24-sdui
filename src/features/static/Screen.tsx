import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderComponent } from '../../components/HeaderComponent';
import { BannerCarouselComponent } from '../../components/BannerCarouselComponent';
import { CategoryChipsComponent } from '../../components/CategoryChipsComponent';
import { CarCardRailComponent } from '../../components/CarCardRailComponent';
import { ValuePropStripComponent } from '../../components/ValuePropStripComponent';
import { FooterCTAComponent } from '../../components/FooterCTAComponent';
import { useScreen } from './useScreen';
import { Colors } from '../../constants/Colors';

const Screen: React.FC = () => {
  const { header, banner, chips, carRail, valueProp, footer } = useScreen();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderComponent {...header} />
        <BannerCarouselComponent {...banner} />
        <CategoryChipsComponent {...chips} />
        <CarCardRailComponent {...carRail} />
        <ValuePropStripComponent {...valueProp} />
        <FooterCTAComponent {...footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Screen;
