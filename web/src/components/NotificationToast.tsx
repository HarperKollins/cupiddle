import React, { useEffect } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';

export interface ToastData {
  id: string;
  type: 'spark' | 'match' | 'message';
  title: string;
  body: string;
  avatar?: string;
  onClick?: () => void;
}

interface NotificationToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: 'calc(100vw - 32px)',
        maxWidth: '440px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastData; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'spark':
        return <CupiddleIcon size={18} color="#202020" />;
      case 'match':
        return <Heart size={18} color="#202020" fill="#202020" />;
      default:
        return <MessageCircle size={18} color="#202020" />;
    }
  };

  const getBadgeColor = () => {
    switch (toast.type) {
      case 'match':
        return '#ffdb5b'; // Sunlit Honey
      case 'spark':
        return '#fff386'; // Pollen
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      onClick={() => {
        if (toast.onClick) toast.onClick();
        onDismiss();
      }}
      className="animate-slide-up"
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '2px solid #202020',
        boxShadow: '0 12px 32px rgba(32, 32, 32, 0.22)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
      }}
    >
      {/* Icon or Avatar */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: getBadgeColor(),
          border: '1.5px solid #202020',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {toast.avatar ? (
          <img src={toast.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getIcon()
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#202020',
              backgroundColor: getBadgeColor(),
              padding: '2px 8px',
              borderRadius: '1000px',
              border: '1px solid #202020',
            }}
          >
            {toast.type === 'match' ? "It's a Match!" : toast.type === 'spark' ? 'New Spark' : 'New Message'}
          </span>
        </div>
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#202020',
            margin: '3px 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {toast.title}
        </h4>
        <p
          style={{
            fontSize: '12px',
            color: '#575656',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {toast.body}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#575656',
          padding: '6px',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
