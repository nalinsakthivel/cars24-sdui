import { SDUIAction } from '../sdui/schema.types';

export type BannerItem = {
  id: string;
  image_url: string;
  title: string;
  cta_text: string;
  action?: SDUIAction;
};

export type ChipItem = {
  id: string;
  label: string;
  icon: string;
  action?: SDUIAction;
};

export type CarItem = {
  id: string;
  name: string;
  year: number;
  km: string;
  price: string;
  emi: string;
  image_url: string;
  badge?: string;
  action?: SDUIAction;
};

export type ValuePropItem = {
  icon: string;
  title: string;
  subtitle: string;
};
