import React from 'react';
import { UnknownFallbackComponent } from '../components/UnknownFallbackComponent';

interface Props {
  children: React.ReactNode;
  componentType: string;
}

interface State {
  hasError: boolean;
}

export class SDUIErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to Crashlytics in production
    console.warn(
      `SDUI render error for component: ${this.props.componentType}`,
      error,
      info,
    );
  }

  render() {
    if (this.state.hasError) {
      return <UnknownFallbackComponent type={this.props.componentType} />;
    }
    return this.props.children;
  }
}
