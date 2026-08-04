export type SDUIPage = {
  version: string;
  screen_id: string;
  sections: SDUIComponent[];
};

export type SDUIComponent = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  action?: SDUIAction;
  fallback?: 'hide' | 'placeholder' | 'skeleton';
  layout?: SDUILayout;
  metadata?: SDUIMetadata;
};

export type SDUIMetadata = {
  analytics_id?: string;
  experiment_id?: string;
  log_impression?: boolean;
};

export type SDUILayout = {
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  maxWidth?: number;
};

export type SDUIAction = {
  type: 'navigate' | 'update_state' | 'open_sheet' | 'filter' | 'external_url';
  payload: Record<string, unknown>;
};
