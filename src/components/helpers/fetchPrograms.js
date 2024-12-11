// helpers/fetchPrograms.js
export const fetchPrograms = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/programs', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  };
  