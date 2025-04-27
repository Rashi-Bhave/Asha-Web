// Frontend/src/components/ui/CyberPanel.jsx
import React from 'react';

const CyberPanel = ({ children, title, icon, actions, className = '' }) => {
  return (
    <div className={`cyber-panel h-full flex flex-col ${className}`}>
      {(title || actions) && (
        <div className="cyber-panel-header flex items-center justify-between mb-3">
          {title && (
            <div className="cyber-panel-title flex items-center space-x-2">
              {icon && icon}
              <span className="font-medium text-white tracking-wide">{title}</span>
            </div>
          )}
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="flex-grow">
        {children}
      </div>
      
      <style jsx>{`
        .cyber-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset,
            0 0 20px rgba(6, 182, 212, 0.1);
          position: relative;
        }
        
        .cyber-panel-title {
          color: #e2e8f0;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }
        
        .cyber-panel-header {
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          padding-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default CyberPanel;