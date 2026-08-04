import MockData from '../../constants/MockData';

export const useScreen = () => {
  const sections = MockData.sections;
  const header = sections.find(s => s.type === 'header')?.props as any;
  const banner = sections.find(s => s.type === 'banner_carousel')?.props as any;
  const chips = sections.find(s => s.type === 'category_chips')?.props as any;
  const carRail = sections.find(s => s.type === 'car_card_rail')?.props as any;
  const valueProp = sections.find(s => s.type === 'value_prop_strip')?.props as any;
  const footer = sections.find(s => s.type === 'footer_cta')?.props as any;

  return { header, banner, chips, carRail, valueProp, footer };
};
