// Company API service

// API base URL - adjust this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Company {
  id: string;
  name: string | null;
  industry: string | null;
  location: string | null;
  email: string;
  phone: string | null;
}

export interface ImportResponse {
  status: string;
  inserted: number;
  updated: number;
  skipped: number;
}

/**
 * Upload and import companies from a file
 * @param file CSV or XLSX file to upload
 * @param mode Import mode
 * @returns Promise with import results
 */
export const importCompanies = async (file: File, mode: string): Promise<ImportResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    const response = await fetch(`${API_BASE_URL}/companies/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to import companies');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};

/**
 * Fetch all companies
 * @returns Promise with array of companies
 */
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch companies');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};
