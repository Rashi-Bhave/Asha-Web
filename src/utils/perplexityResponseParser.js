// src/utils/perplexityResponseParser.js

/**
 * Utility for parsing responses from the Perplexity API
 */
export const parsePerplexityResponse = (content) => {
  if (!content) return [];

  try {
    // First, try to find and parse a JSON array directly
    // This works when Perplexity returns properly formatted JSON
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          return normalizeEvents(parsedJson);
        }
      } catch (e) {
        console.log("Initial JSON parse failed, trying alternative methods");
      }
    }

    // If that fails, try to find individual JSON objects
    const jsonObjectMatches = content.match(/\{[\s\S]*?\}/g);
    if (jsonObjectMatches && jsonObjectMatches.length > 0) {
      const parsedEvents = [];
      for (const jsonStr of jsonObjectMatches) {
        try {
          const eventObj = JSON.parse(jsonStr);
          if (eventObj.title || eventObj.name) {
            parsedEvents.push(eventObj);
          }
        } catch (e) {
          // Skip invalid JSON objects
        }
      }
      
      if (parsedEvents.length > 0) {
        return normalizeEvents(parsedEvents);
      }
    }

    // If structured parsing fails, fall back to text-based extraction
    return extractEventsFromText(content);
  } catch (error) {
    console.error("Error parsing Perplexity response:", error);
    return extractEventsFromText(content);
  }
};

/**
 * Normalize event data structure from various possible formats
 */
const normalizeEvents = (events) => {
  return events.map((event, index) => ({
    id: `perplexity-${Date.now()}-${index}`,
    title: event.title || event.name || "Unnamed Event",
    description: event.description || event.summary || "",
    date: event.date || event.eventDate || event.when || "Date TBD",
    location: event.location || event.venue || event.where || "Location TBD",
    category: event.type || event.category || event.eventType || "Event",
    registrationUrl: event.website || event.url || event.registrationLink || "",
    virtual: event.isVirtual || event.isOnline || event.virtual || 
      (event.location && 
        (event.location.toLowerCase().includes("online") || 
         event.location.toLowerCase().includes("virtual"))),
    price: event.price || event.fee || event.cost || "Free",
    image: event.imageUrl || event.image || `https://picsum.photos/seed/${index}/400/200`,
    organizer: event.organizer || event.organizedBy || event.host || "Unknown Organizer"
  }));
};

/**
 * Extract events from unstructured text
 */
const extractEventsFromText = (text) => {
  const events = [];
  
  // Split into sections that might represent events
  // Look for numbered lists, bullet points, or paragraph breaks
  const sections = text.split(/\n\s*[\d.•\-]+\.\s*|\n\n+/);
  
  sections.forEach((section, index) => {
    // Skip short sections that are likely not events
    if (section.trim().length < 30) return;
    
    // Try to extract event information
    const titleMatch = section.match(/^([^.:\n]{10,}?)(?:[.:]\s|\n|$)/m) || 
                      section.match(/\*\*([^.:\n]{10,}?)\*\*/m) ||
                      section.match(/^(.{10,}?)(?=\s+on\s+|\s+at\s+|\s+in\s+)/m);
                      
    const dateMatch = section.match(/(?:Date|When|on)[\s:]+([^\n,]+(?:\d{1,2}(?:st|nd|rd|th)?(?:,?\s\d{4})?)[^\n,]*)/i) || 
                     section.match(/([A-Z][a-z]+\s\d{1,2}(?:st|nd|rd|th)?(?:,?\s\d{4})?)/);
                     
    const locationMatch = section.match(/(?:Location|Where|Venue|Place)[\s:]+([^\n,]+)/i) ||
                         section.match(/(?:at|in)\s+([A-Z][^\n,]{3,})/);
                         
    const websiteMatch = section.match(/(?:Website|Link|Register|URL)[\s:]+([^\s,]+)/i) || 
                        section.match(/(https?:\/\/[^\s,]+)/i);
    
    const organizerMatch = section.match(/(?:Organizer|Host|by)[\s:]+([^\n,]+)/i) ||
                          section.match(/organized by\s+([^\n,]+)/i);
                        
    let title = titleMatch ? titleMatch[1].trim() : `Event ${index + 1}`;
    
    // Don't include very long titles
    if (title.length > 80) {
      title = `${title.substring(0, 77)}...`;
    }
    
    // Check if this section is about an event
    const isEvent = title.length > 5 && (
      section.toLowerCase().includes("event") ||
      section.toLowerCase().includes("meetup") ||
      section.toLowerCase().includes("workshop") ||
      section.toLowerCase().includes("hackathon") ||
      section.toLowerCase().includes("conference") ||
      section.toLowerCase().includes("webinar") ||
      dateMatch !== null
    );
    
    if (isEvent) {
      const isVirtual = section.toLowerCase().includes("virtual") || 
                       section.toLowerCase().includes("online") || 
                       section.toLowerCase().includes("zoom") ||
                       (locationMatch && locationMatch[1].toLowerCase().includes("online"));
                       
      // Determine event type based on content
      let eventType = "Event";
      if (section.toLowerCase().includes("hackathon")) eventType = "Hackathon";
      else if (section.toLowerCase().includes("webinar")) eventType = "Webinar";
      else if (section.toLowerCase().includes("workshop")) eventType = "Workshop";
      else if (section.toLowerCase().includes("meetup")) eventType = "Meetup";
      else if (section.toLowerCase().includes("conference")) eventType = "Conference";
      else if (section.toLowerCase().includes("community")) eventType = "Community Connect";
      
      events.push({
        id: `perplexity-${Date.now()}-${index}`,
        title: title,
        description: section.trim(),
        date: dateMatch ? dateMatch[1].trim() : "Date TBD",
        location: locationMatch ? locationMatch[1].trim() : (isVirtual ? "Online" : "Location TBD"),
        category: eventType,
        registrationUrl: websiteMatch ? websiteMatch[1].trim() : "",
        virtual: isVirtual,
        price: section.toLowerCase().includes("free") ? "Free" : "Price TBD",
        image: `https://picsum.photos/seed/${index}/400/200`,
        organizer: organizerMatch ? organizerMatch[1].trim() : "Unknown Organizer"
      });
    }
  });
  
  return events;
};

// Create object before export
const perplexityParser = { parsePerplexityResponse };
export default perplexityParser;