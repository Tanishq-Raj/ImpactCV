// API service for resume data

// Default user ID for demo purposes - in a real app, this would come from authentication
const DEFAULT_USER_ID = 1;

// Base API URL
const API_URL = 'https://impactcv-backend.onrender.com/api';

// Types
interface ResumeData {
  id?: number;
  userId: number;
  title: string;
  theme: string;
  data: any;
}

// Get all resumes for the current user
export const getResumes = async (): Promise<ResumeData[]> => {
  try {
    const response = await fetch(`${API_URL}/resumes/${DEFAULT_USER_ID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
};

// Get a specific resume by ID
export const getResumeById = async (id: number): Promise<ResumeData | null> => {
  try {
    const response = await fetch(`${API_URL}/resume/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch resume');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching resume ${id}:`, error);
    return null;
  }
};

// Save a new resume
export const createResume = async (resumeData: Omit<ResumeData, 'id'>): Promise<ResumeData | null> => {
  try {
    const response = await fetch(`${API_URL}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create resume');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating resume:', error);
    return null;
  }
};

// Update an existing resume
export const updateResume = async (id: number, resumeData: Partial<ResumeData>): Promise<ResumeData | null> => {
  try {
    const response = await fetch(`${API_URL}/resume/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update resume');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating resume ${id}:`, error);
    return null;
  }
};

// Delete a resume
export const deleteResume = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/resume/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting resume ${id}:`, error);
    return false;
  }
};