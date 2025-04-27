// Frontend/src/components/ui/CyberButton.jsx
import React from 'react';

const CyberButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon,
  disabled,
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'cyber-button-primary';
      case 'secondary':
        return 'cyber-button-secondary';
      case 'danger':
        return 'cyber-button-danger';
      default:
        return 'cyber-button-primary';
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'cyber-button-sm';
      case 'lg':
        return 'cyber-button-lg';
      default:
        return '';
    }
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
      
      <style jsx>{`
        .cyber-button-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #0369a1, #0891b2);
          border: none;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-button-primary:hover:not(:disabled) {
          background: linear-gradient(90deg, #0891b2, #0ea5e9);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
          transform: translateY(-1px);
        }
        
        .cyber-button-primary:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: all 0.6s;
        }
        
        .cyber-button-primary:hover:before:not(:disabled) {
          left: 100%;
        }
        
        .cyber-button-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.375rem;
          color: rgb(6, 182, 212);
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .cyber-button-secondary:hover:not(:disabled) {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        
        .cyber-button-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #7f1d1d, #b91c1c);
          border: none;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .cyber-button-danger:hover:not(:disabled) {
          background: linear-gradient(90deg, #b91c1c, #dc2626);
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
          transform: translateY(-1px);
        }
        
        .cyber-button-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }
        
        .cyber-button-lg {
          padding: 0.625rem 1.25rem;
          font-size: 1.125rem;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-icon {
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
        }
      `}</style>
    </button>
  );
};

export default CyberButton;