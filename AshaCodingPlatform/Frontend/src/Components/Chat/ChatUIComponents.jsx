// Complete EnhancedMessage component with sequential GIF animation and transform effect
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import MessageAttachment if it's defined elsewhere
// import { MessageAttachment } from './OtherComponents';

/**
 * Attachment component for rendering various types of rich attachments
 * Supports links, option lists, and other attachment types
 */
const MessageAttachment = ({ attachment }) => {
  const navigate = useNavigate();
  
  if (!attachment) return null;
  
  // Navigation function to handle redirects
  const navigateTo = (url) => {
    navigate(url);
  };
  
  switch (attachment.type) {
    case 'link':
      return (
        <div className="cyber-attachment cyber-link-attachment">
          <button 
            className="cyber-attachment-link"
            onClick={() => navigateTo(attachment.data.url)}
          >
            <div className="cyber-attachment-icon">
              <i className="fas fa-external-link-alt"></i>
            </div>
            <div className="cyber-attachment-content">
              <div className="cyber-attachment-title">{attachment.data.label}</div>
              <div className="cyber-attachment-desc">{attachment.data.description}</div>
            </div>
            <div className="cyber-attachment-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
            
            {/* Decorative corners for cyberpunk style */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
          </button>
        </div>
      );
      
    case 'options':
      return (
        <div className="cyber-attachment cyber-options-attachment">
          <div className="cyber-options-title">Available Options:</div>
          <div className="cyber-options-list">
            {attachment.data.map((option, index) => (
              <button 
                key={index}
                className="cyber-option-item"
                onClick={() => navigateTo(option.url)}
              >
                <div className="cyber-option-label">{option.label}</div>
                <div className="cyber-option-desc">{option.description}</div>
                
                {/* Decorative corners */}
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="cyber-corner cyber-corner-bl"></div>
                <div className="cyber-corner cyber-corner-br"></div>
              </button>
            ))}
          </div>
        </div>
      );
      
    case 'job':
      return (
        <div className="cyber-attachment cyber-job-attachment">
          <div className="cyber-job-header">
            <div className="cyber-job-title">{attachment.data.title}</div>
            <div className="cyber-job-company">{attachment.data.company}</div>
          </div>
          <div className="cyber-job-details">
            <div className="cyber-job-location">
              <i className="fas fa-map-marker-alt"></i> {attachment.data.location}
            </div>
            <div className="cyber-job-salary">
              <i className="fas fa-money-bill-wave"></i> {attachment.data.salary || 'Salary not disclosed'}
            </div>
          </div>
          <button 
            className="cyber-job-view-button"
            onClick={() => navigateTo(`/jobs/${attachment.data.id}`)}
          >
            View Job Details
          </button>
        </div>
      );

    case 'jobs':
      return (
        <div className="cyber-attachment cyber-jobs-container">
          {attachment.data.map((job, index) => (
            <div key={index} className="cyber-job-attachment" style={{marginBottom: index < attachment.data.length - 1 ? '12px' : '0'}}>
              <div className="cyber-job-header">
                <div className="cyber-job-title">{job.title}</div>
                <div className="cyber-job-company">{job.company}</div>
              </div>
              <div className="cyber-job-details">
                <div className="cyber-job-location">
                  <i className="fas fa-map-marker-alt"></i> {job.location}
                </div>
                <div className="cyber-job-salary">
                  <i className="fas fa-money-bill-wave"></i> {job.salary || 'Salary not disclosed'}
                </div>
              </div>
              <button 
                className="cyber-job-view-button"
                onClick={() => {
                  // Use the applyUrl if available, or fall back to internal page
                  const url = job.applyUrl && job.applyUrl !== '#' 
                    ? job.applyUrl 
                    : `/jobs/${job.id || job._id}`;
                  
                  // If it's an external URL, open in new tab
                  if (url.startsWith('http')) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } else {
                    // Internal URL, use the navigate function
                    navigateTo(url);
                  }
                }}
              >
                {job.applyUrl && job.applyUrl !== '#' ? 'Apply Now' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      );
      
    default:
      return null;
  }
};

/**
 * Format message text with markdown, code blocks, and links
 */
const formatMessageText = (text) => {
  // Replace ```language ... ``` with code blocks
  let formattedText = text.replace(
    /```([a-z]*)\n([\s\S]*?)```/g, 
    (match, language, code) => `<pre class="code-block ${language}"><code>${code}</code></pre>`
  );
  
  // Replace inline code blocks `code` with <code> tags
  formattedText = formattedText.replace(
    /`([^`]+)`/g, 
    (match, code) => `<code class="inline-code">${code}</code>`
  );
  
  // Replace URLs with clickable links
  formattedText = formattedText.replace(
    /(https?:\/\/[^\s]+)/g, 
    (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="message-link">${match}</a>`
  );
  
  // Handle line breaks
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};

/**
 * Enhanced message component with sequential GIF animation and transform effect
 */

let activeGifMessageId = null;

window.clearAllChatbotGifs = function() {
  activeGifMessageId = null;
  document.querySelectorAll('.cyber-message-wrapper').forEach(el => {
    el.dataset.hasGif = 'false';
    
    // Try to find avatar GIF containers
    const gifContainers = el.querySelectorAll('.cyber-avatar-gif-container');
    gifContainers.forEach(container => {
      // Create a static avatar to replace the GIF
      const staticAvatar = document.createElement('div');
      staticAvatar.className = 'cyber-avatar';
      staticAvatar.innerHTML = `
        <div class="cyber-avatar-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="cyber-avatar-ring"></div>
      `;
      
      // Replace the GIF container with the static avatar
      if (container.parentNode) {
        container.parentNode.replaceChild(staticAvatar, container);
      }
    });
  });
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return 'rgb(16, 185, 129)'; // Green
  if (confidence >= 70) return 'rgb(245, 158, 11)'; // Amber
  return 'rgb(239, 68, 68)'; // Red
};



const EnhancedMessage = ({ 
  message, 
  handleMessageClick, 
  showActions, 
  isLatestBotMessage,
  isThinking,
  // Message action handlers
  handleCopy,
  speakMessage,
  toggleExplanation,
  setActiveFeedbackId,
  activeFeedbackId,
  toggleKnowledgeGraph,
  activeMessageForKG,
  setIsMessageExpanded,
  isMessageExpanded,
  submitFeedback,
  // Data props
  conversationTopics,
  showExplanationPanel,
  aiExplanations,
  messageFeedback,
  confidenceDisplay,
  sentimentAnalysis,
  knowledgeGraph,
}) => {
  const isUser = message.sender === 'user';
  const hasExplanation = !isUser && aiExplanations && aiExplanations[message.id];
  const [showFirstGif, setShowFirstGif] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('initial'); // 'initial', 'entering', 'positioned'
  const [showGif, setShowGif] = useState(false);
  const messageRef = useRef(null);
  const previousThinkingState = useRef(isThinking);

  
  // Generate fallback IDs if they're missing
  const messageId = useRef(
    message.id || message.timestamp || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;


  useEffect(() => {
    // If thinking state just became true (was false before)
    if (isThinking && !previousThinkingState.current) {
      // Immediately clear all GIFs when user presses enter
      window.clearAllChatbotGifs();
    }
    
    // If thinking state just became false (new message arrived)
    if (!isThinking && previousThinkingState.current && isLatestBotMessage && !isUser) {
      // This is the new message that should show the GIF
      activeGifMessageId = messageId;
      setShowGif(true);
    }
    
    // Update reference for next comparison
    previousThinkingState.current = isThinking;
  }, [isThinking, isLatestBotMessage, isUser, messageId]);
  
  
  useEffect(() => {
    if (isLatestBotMessage && !isUser && !isThinking) {
      // This is the new latest bot message - it should show the GIF
      // First, clear the previous active GIF message
      activeGifMessageId = messageId;
      
      // Force a re-render of all message components
      document.querySelectorAll('.cyber-message-wrapper').forEach(el => {
        // Use a data attribute to trigger DOM updates
        if (el.dataset.messageId !== messageId) {
          el.dataset.hasGif = 'false';
          
          // Replace GIF containers with static avatars
          const gifContainers = el.querySelectorAll('.cyber-avatar-gif-container');
          gifContainers.forEach(container => {
            // Create a static avatar to replace the GIF
            const staticAvatar = document.createElement('div');
            staticAvatar.className = 'cyber-avatar';
            staticAvatar.innerHTML = `
              <div class="cyber-avatar-icon">
                <i class="fas fa-robot"></i>
              </div>
              <div class="cyber-avatar-ring"></div>
            `;
            
            // Replace the GIF container with the static avatar
            if (container.parentNode) {
              container.parentNode.replaceChild(staticAvatar, container);
            }
          });
        }
      });
      
      // Force this message to show GIF
      setShowGif(true);
    }
  }, [isLatestBotMessage, isUser, messageId, isThinking]);
  


  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.dataset.hasGif = showGif ? 'true' : 'false';
      messageRef.current.dataset.messageId = messageId;
    }
  }, [showGif, messageId]);


  useEffect(() => {
    const checkGifState = () => {
      if (activeGifMessageId !== messageId && showGif) {
        setShowGif(false);
      }
    };
    
    // Run immediately
    checkGifState();
    
    // And set up an interval to keep checking
    const interval = setInterval(checkGifState, 500);
    
    return () => clearInterval(interval);
  }, [messageId, showGif]);
  // ONLY set showGif based on isLatestBotMessage
  // useEffect(() => {
  //   if (isUser) {
  //     setShowGif(false);
  //     return;
  //   }
    
  //   // Only use isLatestBotMessage since IDs might be unreliable
  //   setShowGif(isLatestBotMessage);
    
  //   // When a message stops being the latest, remove its GIF
  //   return () => {
  //     if (!isLatestBotMessage && !isUser) {
  //       setShowGif(false);
  //     }
  //   };
  // }, [isLatestBotMessage, isUser]);
  
  // Effect to handle GIF sequencing when a new bot message appears
  useEffect(() => {
    if (!showGif) return;
    
    // Start from initial state
    setAnimationPhase('initial');
    
    // Wait for initial render
    setTimeout(() => {
      // Begin animation
      setAnimationPhase('entering');
      
      // Wait for animation to complete
      setTimeout(() => {
        // Set final position
        setAnimationPhase('positioned');
      }, 10000); // Match animation duration
    }, 200);
    
    // Set a timeout to switch to the second GIF
    const transitionTimer = setTimeout(() => {
      setShowFirstGif(false);
    }, 10000);
    
    return () => clearTimeout(transitionTimer);
  }, [showGif, messageId]);
  
  // Reset to first GIF and start entry animation when thinking state changes
  useEffect(() => {
    if (isThinking && showGif) {
      setShowFirstGif(true);
      
      // Sequence the animation phases
      setAnimationPhase('initial');
      
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        // Start the entry animation in the next frame
        setTimeout(() => {
          setAnimationPhase('entering');
          
          // After animation completes, update to positioned state
          setTimeout(() => {
            setAnimationPhase('positioned');
          }, 10000); // Animation duration
        }, 0); // Initial delay
      });
    }
  }, [isThinking, showGif]);
  
  
  useEffect(() => {
    console.log('Message', messageId, 'animation phase:', animationPhase);
  }, [animationPhase, messageId]);
  
  // Add custom CSS to handle the animation
  // Custom CSS for improved animation visibility
  const customStyles = `
  @keyframes slideInFromTop {
    0% {
      transform: translateY(-50vh); /* Move up by full viewport height */
      opacity: 0.6;
    } 

    //  25% {
    //   transform: translateY(-80vh); /* Move up by full viewport height */
    //   opacity: 0.4;
    // } 

    //  50% {
    //   transform: translateY(-60vh); /* Move up by full viewport height */
    //   opacity: 0.6;
    // } 

    //  75% {
    //   transform: translateY(-40vh); /* Move up by full viewport height */
    //   opacity: 0.8;
    // } 
    100% {
      transform: translateY(0); /* End at natural position */
      opacity: 1;
    }
  }
  
  /* Position the container for proper context */
  .cyber-message-container {
    position: relative;
  }
  
  /* Initial state - hiding but maintaining position */
  .cyber-gif-initial {
    position: absolute; /* Position relative to nearest positioned ancestor */
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(-50vh); /* Start off-screen but in same horizontal position */
    opacity: 0.2;
    z-index: 1000;
  }
  
  /* Animation state */
  .cyber-gif-entering {
    position: absolute; /* Keep absolute positioning during animation */
    top: 0;
    left: 0;
    width: 100%;
    animation: slideInFromTop 10s ease-out forwards;
    z-index: 1000;
  }
  
  /* Final state */
  .cyber-gif-positioned {
    position: relative; /* Return to normal flow */
    transform: none;
    opacity: 1;
  }
  
  .cyber-avatar-gif-container {
    transition: all 0.5s ease;
  }
`;

const DebugIndicator = () => {
  return <div className="animation-debug-indicator"></div>;
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return <i className="fas fa-smile sentiment-positive"></i>;
    case 'negative':
      return <i className="fas fa-frown sentiment-negative"></i>;
    default:
      return <i className="fas fa-smile sentiment-positive"></i>;
  }
};

  return (
    <div className="cyber-message-wrapper" ref={messageRef}>
      {/* Inject custom animation styles */}
      <style>{customStyles}</style>
      
      <div 
        className={`cyber-message ${isUser ? 'cyber-user-message' : 'cyber-bot-message'}`}
        onClick={() => handleMessageClick(message.id)}
      >
        {!isUser && showGif && animationPhase !== 'positioned' && <DebugIndicator />}
        <div className="cyber-message-container">
          {!isUser && (
            <>
              {showGif ? (
                <div className={`cyber-avatar-gif-container cyber-gif-${animationPhase}`}>
                  {/* Conditional GIF rendering - first during loading or initial sequence */}
                  {(isThinking || showFirstGif) ? (
                    <img 
                      src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745564016/tmpe1gf70c2_jzjml5.gif" 
                      alt="AI Thinking"
                      className="cyber-avatar-gif-large cyber-loading-gif"
                    />
                  ) : (
                    <img 
                      src="https://res.cloudinary.com/dyfmlusbc/image/upload/v1745423184/video_chatbot_lgdiya.gif" 
                      alt="AI Assistant"
                      className="cyber-avatar-gif-large cyber-avatar-gif"
                    />
                  )}
                </div>
              ) : (
                <div className="cyber-avatar">
                  <div className="cyber-avatar-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="cyber-avatar-ring"></div>
                </div>
              )}
            </>
          )}
          
          <div className="cyber-message-content">
          {!isUser && confidenceDisplay && message.confidence !== undefined && (
                <div className="cyber-confidence-indicator" style={{ '--confidence-color': getConfidenceColor(message.confidence) }}>
                  <div className="cyber-confidence-bar">
                    <div 
                      className="cyber-confidence-level" 
                      style={{ width: `${message.confidence}%` }}
                    ></div>
                  </div>
                  <span className="cyber-confidence-value">{message.confidence}%</span>
                </div>
              )}
          <div className={`cyber-message-bubble ${isUser ? 'cyber-user-bubble' : 'cyber-bot-bubble'} ${isLatestBotMessage ? 'cyber-latest-bubble' : ''} ${isThinking ? 'cyber-loading-bubble' : ''} ${isMessageExpanded ? 'cyber-expanded' : ''}`}>
              
            {sentimentAnalysis && message.sentiment && (
              <div className={`cyber-sentiment-indicator cyber-sentiment-${message.sentiment}`}>
                {getSentimentIcon(message.sentiment)}
              </div>
            )}
              <div 
                className="cyber-message-text"
                dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
              />

            
              
              {/* Decorative corners */}
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>
            </div>

            {/* Add message meta section here */}
            <div className="cyber-message-meta">
              <div className="cyber-message-time">
                <svg className="cyber-time-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              {/* Feedback display */}
              {!isUser && messageFeedback && messageFeedback[message.id] !== undefined && (
                <div className="cyber-feedback-display">
                  <i className={`fas fa-thumbs-${messageFeedback[message.id] === 'up' ? 'up' : 'down'} cyber-feedback-${messageFeedback[message.id]}`}></i>
                </div>
              )}
            </div>
            
            {/* Render attachment if present */}
            {message.attachment && <MessageAttachment attachment={message.attachment} />}
            
            {/* Message actions (shown when clicked) */}
            {showActions === message.id && (
  <div className="cyber-message-actions">
    <button 
      className="cyber-action-button" 
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(message.text);
      }}
      title="Copy to clipboard"
    >
      <i className="fas fa-copy"></i>
    </button>
    
    {!isUser && (
      <button 
        className="cyber-action-button" 
        onClick={(e) => {
          e.stopPropagation();
          speakMessage(message.text);
        }}
        title="Read aloud"
      >
        <i className="fas fa-volume-up"></i>
      </button>
    )}
    
    {!isUser && hasExplanation && (
      <button 
        className={`cyber-action-button ${showExplanationPanel === message.id ? 'cyber-action-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleExplanation(message.id);
        }}
        title="Show AI explanation"
      >
        <i className="fas fa-brain"></i>
      </button>
    )}
    
    {!isUser && (
      <button 
        className="cyber-action-button" 
        onClick={(e) => {
          e.stopPropagation();
          setActiveFeedbackId(activeFeedbackId === message.id ? null : message.id);
        }}
        title="Rate response"
      >
        <i className="fas fa-thumbs-up"></i>
      </button>
    )}
    
    {!isUser && conversationTopics && conversationTopics.length > 0 && (
      <button 
        className={`cyber-action-button ${activeMessageForKG === message.id ? 'cyber-action-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleKnowledgeGraph(message.id);
        }}
        title="Show knowledge graph"
      >
        <i className="fas fa-project-diagram"></i>
      </button>
    )}
    
    <button 
      className="cyber-action-button" 
      onClick={(e) => {
        e.stopPropagation();
        setIsMessageExpanded(isMessageExpanded === message.id ? null : message.id);
      }}
      title={isMessageExpanded === message.id ? "Collapse" : "Expand"}
    >
      <i className={`fas fa-${isMessageExpanded === message.id ? 'compress-alt' : 'expand-alt'}`}></i>
    </button>
  </div>
)}
          </div>
          
          {isUser && (
            <div className="cyber-avatar">
              <div className="cyber-avatar-icon">
                <i className="fas fa-user"></i>
              </div>
              <div className="cyber-avatar-ring"></div>
            </div>
          )}


{activeFeedbackId === message.id && (
        <div className="cyber-feedback-ui">
          <div className="cyber-feedback-prompt">Was this response helpful?</div>
          <div className="cyber-feedback-buttons">
            <button 
              className="cyber-feedback-button cyber-feedback-up"
              onClick={() => submitFeedback(message.id, 'up')}
            >
              <i className="fas fa-thumbs-up"></i>
              <span>Helpful</span>
            </button>
            <button 
              className="cyber-feedback-button cyber-feedback-down"
              onClick={() => submitFeedback(message.id, 'down')}
            >
              <i className="fas fa-thumbs-down"></i>
              <span>Not Helpful</span>
            </button>
          </div>
        </div>
      )}


{showExplanationPanel === message.id && aiExplanations && aiExplanations[message.id] && (
  <div className="cyber-explanation-panel">
    <div className="cyber-explanation-header">
      <h3>
        <svg className="cyber-explanation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4m-8 8a4 4 0 0 0 4 4m-4-4a4 4 0 0 1 4-4m-4 4h4m8 0a4 4 0 0 1-4 4m4-4a4 4 0 0 0-4-4m4 4h-4m0-8a4 4 0 0 0-4 4m4-4a4 4 0 0 1 4 4m-4-4v4"></path>
        </svg>
        AI Response Analysis
      </h3>
      <button 
        className="cyber-explanation-close"
        onClick={() => toggleExplanation(null)}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
    
    <div className="cyber-explanation-content">
      <div className="cyber-explanation-section">
        <h4>Confidence</h4>
        <div className="cyber-confidence-detail">
          <div className="cyber-confidence-bar-large">
            <div 
              className="cyber-confidence-level" 
              style={{ 
                width: `${aiExplanations[message.id].confidence}%`,
                backgroundColor: getConfidenceColor(aiExplanations[message.id].confidence)
              }}
            ></div>
          </div>
          <span className="cyber-confidence-text">
            {aiExplanations[message.id].confidence}% confidence
          </span>
        </div>
      </div>
      
      <div className="cyber-explanation-section">
        <h4>AI Reasoning</h4>
        <p className="cyber-reasoning-text">
          {aiExplanations[message.id].reasoning}
        </p>
      </div>
      
      {aiExplanations[message.id].sources && aiExplanations[message.id].sources.length > 0 && (
        <div className="cyber-explanation-section">
          <h4>Sources</h4>
          <ul className="cyber-sources-list">
            {aiExplanations[message.id].sources.map((source, index) => (
              <li key={index} className="cyber-source-item">
                <div className="cyber-source-info">
                  <span className="cyber-source-title">{source.title}</span>
                  <span className="cyber-source-url">{source.url}</span>
                </div>
                <div className="cyber-source-relevance" title={`${Math.round(source.relevance * 100)}% relevant`}>
                  <div 
                    className="cyber-relevance-bar"
                    style={{ width: `${source.relevance * 100}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}


{activeMessageForKG === message.id && (
  <div className="cyber-knowledge-panel" style={{
    background: 'rgba(15, 23, 42, 0.9)',
    border: '2px solid rgba(6, 182, 212, 0.7)',
    borderRadius: '0.5rem',
    padding: '1rem',
    // margin: '1rem 0 1rem 3.5rem',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
    zIndex: 30,
    position: 'relative'
  }}>
    <div style={{ color: 'white', marginBottom: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgb(6, 182, 212)' }}>
        <i className="fas fa-project-diagram"></i>
        Knowledge Network {knowledgeGraph ? '' : '(No data available)'}
      </h3>
      <button 
        onClick={() => toggleKnowledgeGraph(null)}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
    
    {knowledgeGraph ? (
      <div style={{ 
        height: '200px', 
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '0.25rem',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1rem' 
      }}>
        {/* Nodes */}
        {knowledgeGraph.nodes.map(node => (
          <div 
            key={node.id}
            style={{
              position: 'absolute',
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              background: node.color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              zIndex: 2
            }}
          >
            <div style={{
              position: 'absolute', 
              top: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '0.1rem 0.3rem',
              borderRadius: '0.15rem',
              fontSize: '0.7rem'
            }}>
              {node.label}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
        No knowledge graph data available
      </div>
    )}
    
    <div style={{ marginTop: '1rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
        Detected Topics
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {conversationTopics && conversationTopics.length > 0 ? (
          conversationTopics.map((topic, i) => (
            <div key={i} style={{
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem'
            }}>
              {topic}
            </div>
          ))
        ) : (
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic', fontSize: '0.75rem' }}>
            No topics detected
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

/**
 * Intent Detector Component
 * This component listens for intent-specific messages and offers suggested actions
 */
const IntentDetector = ({ messages, onSuggestionClick }) => {
  const lastMessage = messages[messages.length - 1];
  
  // Only show suggestions for bot messages with specific intents
  if (!lastMessage || lastMessage.sender !== 'bot' || !lastMessage.intentCategory) {
    return null;
  }
  
  const intent = lastMessage.intentCategory;
  
  // Generate suggestions based on intent
  const getSuggestions = () => {
    switch (intent) {
      case 'Career_Trajectory_Switch':
        return [
          { text: "Show me career paths in software development", icon: "fa-code-branch" },
          { text: "I want to transition from engineering to management", icon: "fa-users" },
          { text: "What skills do I need for data science?", icon: "fa-chart-bar" }
        ];
      case 'Job_Listing':
        return [
          { text: "Find software engineering jobs in Bangalore", icon: "fa-search" },
          { text: "Show me remote product manager positions", icon: "fa-laptop-house" },
          { text: "Entry level UX designer jobs", icon: "fa-paint-brush" }
        ];
      case 'Mock_Interview':
        return [
          { text: "I want to host a mock interview for frontend developers", icon: "fa-user-plus" },
          { text: "Join interview room ABC123", icon: "fa-sign-in-alt" },
          { text: "Practice interview for a data science role", icon: "fa-chalkboard-teacher" }
        ];
      case 'Coding_Platform':
        return [
          { text: "Show me easy array problems", icon: "fa-th" },
          { text: "I need hard dynamic programming challenges", icon: "fa-code" },
          { text: "Give me binary tree questions", icon: "fa-project-diagram" }
        ];
      default:
        return [];
    }
  };
  
  const suggestions = getSuggestions();
  if (suggestions.length === 0) return null;
  
  return (
    <div className="cyber-intent-suggestions">
      <div className="cyber-intent-header">
        <i className="fas fa-lightbulb"></i>
        <span>Try asking:</span>
      </div>
      <div className="cyber-intent-options">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="cyber-intent-option"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            <i className={`fas ${suggestion.icon}`}></i>
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { MessageAttachment, EnhancedMessage, IntentDetector, formatMessageText };