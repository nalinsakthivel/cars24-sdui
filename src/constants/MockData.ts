import { SDUIPage } from '../sdui/schema.types';

const MockData: SDUIPage = {
  version: '1.0.0',
  screen_id: 'home_landing',
  sections: [
    {
      id: 'header_001',
      type: 'header',
      props: {
        logo_url: 'https://picsum.photos/seed/logo/80/40',
        search_placeholder: 'Search cars, brands, budget...',
        location: 'Chennai',
        notification_count: 3,
      },
    },
    {
      id: 'banner_001',
      type: 'banner_carousel',
      props: {
        autoplay: true,
        interval_ms: 3000,
        items: [
          {
            id: 'b1',
            image_url: 'https://picsum.photos/seed/cars_banner1/800/300',
            title: 'Best deals this week',
            cta_text: 'Explore',
            action: { type: 'navigate', payload: { screen: 'deals' } },
          },
          {
            id: 'b2',
            image_url: 'https://picsum.photos/seed/cars_banner2/800/300',
            title: 'Up to ₹50,000 off',
            cta_text: 'View Offers',
            action: { type: 'navigate', payload: { screen: 'offers' } },
          },
          {
            id: 'b3',
            image_url: 'https://picsum.photos/seed/cars_banner3/800/300',
            title: 'Sell your car in 24hrs',
            cta_text: 'Get Quote',
            action: { type: 'open_sheet', payload: { sheet_id: 'sell_flow' } },
          },
        ],
      },
      metadata: {
        analytics_id: 'home_banner_v2',
        log_impression: true,
      },
    },
    {
      id: 'chips_001',
      type: 'category_chips',
      props: {
        selected_id: 'buy',
        items: [
          {
            id: 'buy',
            label: 'Buy',
            icon: 'car-outline',
            action: {
              type: 'update_state',
              payload: { key: 'selectedCategory', value: 'buy' },
            },
          },
          {
            id: 'sell',
            label: 'Sell',
            icon: 'pricetag-outline',
            action: {
              type: 'update_state',
              payload: { key: 'selectedCategory', value: 'sell' },
            },
          },
          {
            id: 'loan',
            label: 'Loan',
            icon: 'card-outline',
            action: {
              type: 'update_state',
              payload: { key: 'selectedCategory', value: 'loan' },
            },
          },
          {
            id: 'rc',
            label: 'RC Transfer',
            icon: 'document-outline',
            action: { type: 'navigate', payload: { screen: 'rc_transfer' } },
          },
        ],
      },
    },
    {
      id: 'car_rail_001',
      type: 'car_card_rail',
      props: {
        title: 'Recently Added',
        subtitle: 'Fresh cars in Chennai',
        items: [
          {
            id: 'car1',
            name: 'Maruti Swift VXi',
            year: 2021,
            km: '32,000 km',
            price: '₹5.75 L',
            emi: '₹10,200/mo',
            image_url: 'https://picsum.photos/seed/swift/300/200',
            badge: 'CERTIFIED',
            action: {
              type: 'navigate',
              payload: { screen: 'car_detail', car_id: 'car1' },
            },
          },
          {
            id: 'car2',
            name: 'Honda City ZX',
            year: 2020,
            km: '45,000 km',
            price: '₹8.25 L',
            emi: '₹14,600/mo',
            image_url: 'https://picsum.photos/seed/city/300/200',
            badge: 'TOP RATED',
            action: {
              type: 'navigate',
              payload: { screen: 'car_detail', car_id: 'car2' },
            },
          },
          {
            id: 'car3',
            name: 'Hyundai Creta SX',
            year: 2022,
            km: '18,000 km',
            price: '₹12.50 L',
            emi: '₹22,100/mo',
            image_url: 'https://picsum.photos/seed/creta/300/200',
            badge: 'HOT DEAL',
            action: {
              type: 'navigate',
              payload: { screen: 'car_detail', car_id: 'car3' },
            },
          },
          {
            id: 'car4',
            name: 'Tata Nexon XZ+',
            year: 2021,
            km: '28,500 km',
            price: '₹9.80 L',
            emi: '₹17,400/mo',
            image_url: 'https://picsum.photos/seed/nexon/300/200',
            badge: 'CERTIFIED',
            action: {
              type: 'navigate',
              payload: { screen: 'car_detail', car_id: 'car4' },
            },
          },
          {
            id: 'car5',
            name: 'Kia Seltos HTX',
            year: 2020,
            km: '52,000 km',
            price: '₹11.20 L',
            emi: '₹19,800/mo',
            image_url: 'https://picsum.photos/seed/seltos/300/200',
            badge: 'PRICE DROP',
            action: {
              type: 'navigate',
              payload: { screen: 'car_detail', car_id: 'car5' },
            },
          },
        ],
      },
    },
    {
      id: 'value_prop_001',
      type: 'value_prop_strip',
      props: {
        items: [
          {
            icon: 'shield-checkmark',
            title: '200+ Inspections',
            subtitle: 'Every car checked',
          },
          {
            icon: 'refresh-circle',
            title: '7-Day Returns',
            subtitle: 'No questions asked',
          },
          {
            icon: 'star',
            title: '1-Year Warranty',
            subtitle: 'Peace of mind',
          },
          {
            icon: 'cash',
            title: 'Best Price',
            subtitle: 'Price match guarantee',
          },
        ],
      },
    },
    {
      id: 'unknown_test_001',
      type: 'holographic_display',
      props: { message: 'Future feature — not yet in client' },
      fallback: 'hide',
    },
    {
      id: 'footer_cta_001',
      type: 'footer_cta',
      props: {
        title: 'Sell your car in 24 hours',
        subtitle: 'Get the best price guaranteed',
        cta_text: 'Get Free Quote',
        background_color: '#FF6B00',
        action: { type: 'open_sheet', payload: { sheet_id: 'sell_flow' } },
      },
      layout: {
        margin: 16,
        borderRadius: 12,
      },
    },
  ],
};

export default MockData;
