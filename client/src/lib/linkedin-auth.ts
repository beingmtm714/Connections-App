export interface LinkedInSession {
  sessionCookie: string;
  isConnected: boolean;
}

// Initialize LinkedIn session from local storage if available
export const getLinkedInSession = (): LinkedInSession => {
  try {
    const sessionData = localStorage.getItem('linkedInSession');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch (error) {
    console.error('Error reading LinkedIn session from localStorage:', error);
  }
  
  return {
    sessionCookie: '',
    isConnected: false
  };
};

// Save LinkedIn session to local storage
export const saveLinkedInSession = (session: LinkedInSession): void => {
  try {
    localStorage.setItem('linkedInSession', JSON.stringify(session));
  } catch (error) {
    console.error('Error saving LinkedIn session to localStorage:', error);
  }
};

// Connect LinkedIn account
export const connectLinkedIn = async (): Promise<LinkedInSession> => {
  try {
    // In a real application, we would implement OAuth or cookie-based auth
    // For this demo, we'll simulate the connection with a mock session cookie
    const sessionCookie = `li_at=${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Send the session cookie to the backend
    const response = await fetch('/api/linkedin/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionCookie }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect LinkedIn account');
    }
    
    const session: LinkedInSession = {
      sessionCookie,
      isConnected: true
    };
    
    saveLinkedInSession(session);
    return session;
  } catch (error) {
    console.error('LinkedIn connection error:', error);
    throw error;
  }
};

// Disconnect LinkedIn account
export const disconnectLinkedIn = async (): Promise<void> => {
  try {
    const response = await fetch('/api/linkedin/disconnect', {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disconnect LinkedIn account');
    }
    
    // Clear session from localStorage
    localStorage.removeItem('linkedInSession');
  } catch (error) {
    console.error('LinkedIn disconnection error:', error);
    throw error;
  }
};
