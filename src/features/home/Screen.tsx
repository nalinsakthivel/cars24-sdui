import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SDUIRenderer from '../../sdui/SDUIRenderer';
import { useScreen } from './useScreen';
import { SDUISkeleton } from './SDUISkeleton';
import { SDUIErrorState } from './SDUIErrorState';
import { Colors } from '../../constants/Colors';
import { perf } from '../../utils/perf';

const Screen: React.FC = () => {
  const { page, isLoading, isError, refetch } = useScreen();
  const hasMarkedRender = useRef(false);

  if (page && !hasMarkedRender.current) {
    hasMarkedRender.current = true;
    perf.mark('render_start');
  }

  const onLayout = () => {
    perf.mark('render_complete');
    perf.mark('above_fold_visible');
    requestAnimationFrame(() => perf.mark('interactive'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'bottom']}>
      {isLoading || !page ? (
        <SDUISkeleton />
      ) : isError ? (
        <SDUIErrorState onRetry={refetch} />
      ) : (
        <SDUIRenderer page={page} onLayout={onLayout} />
      )}
    </SafeAreaView>
  );
};

export default Screen;
