// AshaCodingPlatform/Frontend/src/Components/ChatBubble/LoginChatUIComponents.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Renders different types of attachments for the FAQ chat
 */
const FAQAttachment = ({ attachment }) => {
  const navigate = useNavigate();
  
  if (!attachment) return null;
  
  // Navigation function to handle redirects
  const navigateTo = (url) => {
    if (url.startsWith('/')) {
      // Internal navigation
      navigate(url);
    } else {
      // External URL
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  switch (attachment.type) {
    case 'link':
      return (
        <div className="faq-attachment faq-link-attachment">
          <button 
            className="faq-attachment-button"
            onClick={() => navigateTo(attachment.data.url)}
          >
            <div className="faq-attachment-icon">
              <i className="fas fa-external-link-alt"></i>
            </div>
            <div className="faq-attachment-content">
              <div className="faq-attachment-label">{attachment.data.label}</div>
              {attachment.data.description && (
                <div className="faq-attachment-description">{attachment.data.description}</div>
              )}
            </div>
            <div className="faq-attachment-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>
      );
      
    case 'signup':
      return <SignupForm data={attachment.data} />;
      
    case 'options':
      return (
        <div className="faq-options-attachment">
          <div className="faq-options-title">{attachment.data.title || 'Available Options'}</div>
          <div className="faq-options-list">
            {attachment.data.options.map((option, index) => (
              <button 
                key={index}
                className="faq-option-button"
                onClick={() => navigateTo(option.url || '#')}
              >
                {option.icon && <i className={`fas ${option.icon}`}></i>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

/**
 * Interactive signup form that can be embedded in the chat
 */
const SignupForm = ({ data }) => {
  const [step, setStep] = useState(data?.step || 'username');
  const [formData, setFormData] = useState(data?.formData || {});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const navigate = useNavigate();
  
  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate current step
    if (step === 'username' && (!formData.username || formData.username.length < 3)) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (step === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    if (step === 'password' && (!formData.password || formData.password.length < 8)) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (step === 'confirmation') {
      setIsLoading(true);
      
      try {
        // Submit the form data to the server
        const response = await fetch('/api/v1/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          setIsComplete(true);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(data.message || 'Failed to create account');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
      
      return;
    }
    
    // Move to next step
    const steps = ['username', 'email', 'password', 'confirmation'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };
  
  // Return different form based on current step
  const renderStep = () => {
    if (isComplete) {
      return (
        <div className="faq-signup-success">
          <div className="faq-signup-success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h4>Account Created!</h4>
          <p>Your account has been successfully created. You will be redirected to login.</p>
        </div>
      );
    }
    
    switch (step) {
      case 'username':
        return (
          <>
            <h4 className="faq-signup-title">Create Your Account</h4>
            <div className="faq-form-group">
              <label htmlFor="faq-username">Choose a Username</label>
              <input
                id="faq-username"
                type="text"
                value={formData.username || ''}
                onChange={(e) => updateFormData('username', e.target.value)}
                placeholder="e.g., codingstar"
                className="faq-form-input"
              />
            </div>
          </>
        );
        
      case 'email':
        return (
          <>
            <h4 className="faq-signup-title">Enter Your Email</h4>
            <div className="faq-form-group">
              <label htmlFor="faq-email">Email Address</label>
              <input
                id="faq-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="e.g., you@example.com"
                className="faq-form-input"
              />
            </div>
          </>
        );
        
      case 'password':
        return (
          <>
            <h4 className="faq-signup-title">Create Password</h4>
            <div className="faq-form-group">
              <label htmlFor="faq-password">Password (min 8 characters)</label>
              <input
                id="faq-password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Enter a secure password"
                className="faq-form-input"
              />
            </div>
          </>
        );
        
      case 'confirmation':
        return (
          <>
            <h4 className="faq-signup-title">Confirm Your Details</h4>
            <div className="faq-confirmation-details">
              <div className="faq-confirmation-item">
                <span className="faq-confirmation-label">Username:</span>
                <span className="faq-confirmation-value">{formData.username}</span>
              </div>
              <div className="faq-confirmation-item">
                <span className="faq-confirmation-label">Email:</span>
                <span className="faq-confirmation-value">{formData.email}</span>
              </div>
              <div className="faq-confirmation-item">
                <span className="faq-confirmation-label">Password:</span>
                <span className="faq-confirmation-value">••••••••</span>
              </div>
            </div>
          </>
        );
        
      default:
        return <p>Loading form...</p>;
    }
  };
  
  return (
    <div className="faq-signup-form">
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        {error && <div className="faq-form-error">{error}</div>}
        
        <div className="faq-form-actions">
          {step !== 'username' && !isComplete && (
            <button
              type="button"
              className="faq-back-button"
              onClick={() => {
                const steps = ['username', 'email', 'password', 'confirmation'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1]);
                }
              }}
            >
              Back
            </button>
          )}
          
          {!isComplete && (
            <button
              type="submit"
              className="faq-next-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Processing...</span>
                </>
              ) : step === 'confirmation' ? (
                'Create Account'
              ) : (
                'Next'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Quick reply button component
 */
const QuickReplyButton = ({ text, onClick }) => {
  return (
    <button className="faq-quick-reply" onClick={() => onClick(text)}>
      {text}
    </button>
  );
};

export { FAQAttachment, SignupForm, QuickReplyButton };