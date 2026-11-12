import { Component, ErrorInfo, ReactNode } from 'react';
import { Compass, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#202020',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1.5px solid #202020',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(32, 32, 32, 0.12)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#ffdb5b',
                border: '1.5px solid #202020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Compass size={28} color="#202020" />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#202020' }}>
              Something paused your Spark
            </h1>

            <p style={{ fontSize: '14px', color: '#575656', lineHeight: 1.5, marginBottom: '24px' }}>
              We hit a quick rendering bump while loading your curiosity view. Refreshing will restore your session instantly.
            </p>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '16px',
                backgroundColor: '#202020',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} /> Reload Cupiddle
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
