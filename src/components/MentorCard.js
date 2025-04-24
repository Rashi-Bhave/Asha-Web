// src/components/MentorCard.js
import React, { useState } from 'react';

const MentorCard = ({ mentor }) => {
  // State for handling loading state during search
  const [isSearching, setIsSearching] = useState(false);
  
  // Generate deterministic avatar URL based on name
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=7B3FA9&color=fff&size=100`;

  // Handle booking session - search and open first result
  const handleBookSession = async () => {
    try {
      setIsSearching(true);
      
      // Create search query using mentor data
      const searchQuery = `${mentor.name} ${mentor.category || ''} ${mentor.subcategories ? mentor.subcategories[0] || '' : ''} topmate`;
      
      // Use a CORS proxy to search Google and get results
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
      )}`;
      
      // Fetch search results
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data && data.contents) {
        // Parse the HTML to extract the first result URL
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Look for the first link in search results
        // The actual selector might vary depending on Google's HTML structure
        const links = doc.querySelectorAll('a');
        let firstResultUrl = null;
        
        // Find the first valid result link (not a Google internal link)
        for (const link of links) {
          const href = link.getAttribute('href');
          if (href && 
              href.startsWith('http') && 
              !href.includes('google.com') && 
              !href.includes('/search') &&
              !href.includes('/url?')) {
            firstResultUrl = href;
            break;
          } else if (href && href.startsWith('/url?q=')) {
            // Google sometimes uses redirects - extract the actual URL
            const url = href.substring(7); // Remove '/url?q='
            const endIndex = url.indexOf('&');
            firstResultUrl = endIndex > 0 ? url.substring(0, endIndex) : url;
            break;
          }
        }
        
        // If we couldn't find a result with the above selectors, try a different approach
        if (!firstResultUrl) {
          const resultLinks = doc.querySelectorAll('div.g div.yuRUbf a');
          if (resultLinks.length > 0) {
            firstResultUrl = resultLinks[0].href;
          }
        }
        
        // If we still couldn't find any result, try one more selector
        if (!firstResultUrl) {
          const citeLinkElements = Array.from(doc.querySelectorAll('cite'));
          if (citeLinkElements.length > 0) {
            // Extract URL from cite element's parent link
            const parentLink = citeLinkElements[0].closest('a');
            if (parentLink) {
              firstResultUrl = parentLink.href;
            } else {
              // Use the text content of the cite element as a fallback
              const citeText = citeLinkElements[0].textContent.trim();
              if (citeText.startsWith('http')) {
                firstResultUrl = citeText;
              } else {
                firstResultUrl = `https://${citeText}`;
              }
            }
          }
        }
        
        // Open the first result URL if found
        if (firstResultUrl) {
          window.open(firstResultUrl, '_blank');
        } else {
          // Fallback to normal Google search if no result is found
          window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
        }
      } else {
        // Fallback to normal Google search
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
      }
    } catch (error) {
      console.error('Error searching for mentor:', error);
      // Fallback to normal Google search on error
      const searchQuery = `${mentor.name} ${mentor.category || ''} ${mentor.subcategories ? mentor.subcategories[0] || '' : ''} topmate`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-container">
          <h3 className="card-title">{mentor.name}</h3>
          {/* Title removed as requested */}
        </div>
        
        <img
          src={avatarUrl}
          alt={mentor.name}
          className="card-logo mentor-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${mentor.name.length * 5}/100/100`;
          }}
        />
      </div>
      
      <div className="card-content">
        <div className="card-details">
          {mentor.rating !== null && (
            <div className="card-detail-item">
              <i className="fas fa-star"></i>
              <span className="card-detail-text">
                {mentor.rating ? `Rating: ${mentor.rating}` : 'New Mentor'}
              </span>
            </div>
          )}
          
          {mentor.bookings && (
            <div className="card-detail-item">
              <i className="fas fa-calendar-check"></i>
              <span className="card-detail-text">{mentor.bookings}</span>
            </div>
          )}
          
          <div className="card-detail-item">
            <i className="fas fa-phone-alt"></i>
            <span className="card-detail-text">{mentor.callInfo || mentor.call_type || "1:1 Call"}</span>
          </div>
        </div>
        
        <div className="tags-container">
          {mentor.priorityDM && (
            <span className="tag">Priority DM</span>
          )}
          {mentor.isNew && (
            <span className="tag">New</span>
          )}
          {mentor.subcategories && mentor.subcategories.length > 0 && (
            mentor.subcategories.map((subcat, index) => (
              <span key={index} className="tag">{subcat}</span>
            ))
          )}
        </div>
      </div>
      
      <div className="card-actions">
        <button className="action-button">
          <i className="far fa-bookmark"></i>
          <span>Save</span>
        </button>
        
        <button className="action-button">
          <i className="fas fa-share"></i>
          <span>Share</span>
        </button>
        
        <button 
          className="primary-button"
          onClick={handleBookSession}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Searching...
            </>
          ) : (
            'Book Session'
          )}
        </button>
      </div>
    </div>
  );
};

export default MentorCard;