import React, { useEffect, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { resolveComponent } from './ComponentRegistry';
import { SDUIErrorBoundary } from './SDUIErrorBoundary';
import { SDUIComponent, SDUIPage } from './schema.types';

const SDUIComponentRenderer: React.FC<{ component: SDUIComponent }> = ({
  component,
}) => {
  const Component = useMemo(
    () => resolveComponent(component.type),
    [component.type],
  );

  useEffect(() => {
    if (component.metadata?.log_impression) {
      console.log('[SDUI] Impression:', component.metadata.analytics_id);
    }
  }, [component.id, component.metadata?.log_impression, component.metadata?.analytics_id]);

  return (
    <Component
      {...component.props}
      action={component.action}
      layout={component.layout}
    />
  );
};

const SDUIRenderer: React.FC<{ page: SDUIPage; onLayout?: () => void }> = ({
  page,
  onLayout,
}) => {
  return (
    <FlashList
      data={page.sections}
      keyExtractor={item => item.id}
      onLayout={onLayout}
      renderItem={({ item }) => (
        <SDUIErrorBoundary componentType={item.type}>
          <SDUIComponentRenderer component={item} />
        </SDUIErrorBoundary>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default SDUIRenderer;
