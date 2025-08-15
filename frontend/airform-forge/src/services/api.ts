import axios from 'axios';
import { 
  BasesResponse, 
  TablesResponse, 
  FieldsResponse, 
  Form, 
  FormsResponse, 
  PublicForm, 
  FormSubmission,
  UploadResponse 
} from '@/types';

const API_URL = 'https://airtable-connect.onrender.com';

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authApi = {
  login: () => {
    window.location.href = `${API_URL}/api/auth/airtable/login`;
  },
  
  logout: async () => {
    return api.post('/api/auth/logout');
  },
  
  // Check session status by attempting to fetch forms
  checkSession: async () => {
    try {
      await api.get('/api/forms');
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Airtable metadata endpoints
export const airtableApi = {
  getBases: async (): Promise<BasesResponse> => {
    const response = await api.get('/api/airtable/bases');
    return response.data;
  },
  
  getTables: async (baseId: string): Promise<TablesResponse> => {
    const response = await api.get(`/api/airtable/tables?baseId=${baseId}`);
    return response.data;
  },
  
  getFields: async (baseId: string, tableId: string): Promise<FieldsResponse> => {
    const response = await api.get(`/api/airtable/fields?baseId=${baseId}&tableId=${tableId}`);
    return response.data;
  },
};

// Form management endpoints
export const formsApi = {
  create: async (form: Partial<Form>): Promise<Form> => {
    const response = await api.post('/api/forms', form);
    return response.data;
  },
  
  getAll: async (): Promise<Form[]> => {
    const response = await api.get('/api/forms');
    return response.data.forms || response.data;
  },
  
  getById: async (id: string): Promise<Form> => {
    const response = await api.get(`/api/forms/${id}`);
    return response.data;
  },
  
  update: async (id: string, form: Partial<Form>): Promise<Form> => {
    const response = await api.put(`/api/forms/${id}`, form);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/forms/${id}`);
  },
  
  submit: async (id: string, submission: FormSubmission): Promise<void> => {
    await api.post(`/api/forms/${id}/submit`, submission);
  },
  
  exportPdf: async (id: string, answers?: any): Promise<Blob> => {
    const endpoint = answers 
      ? `/api/forms/${id}/export/pdf`
      : `/api/forms/${id}/export/pdf`;
    
    const response = await api({
      method: answers ? 'POST' : 'GET',
      url: endpoint,
      data: answers ? { answers } : undefined,
      responseType: 'blob',
    });
    
    return response.data;
  },
};

// Public form endpoints
export const publicApi = {
  getForm: async (publicId: string): Promise<PublicForm> => {
    const response = await axios.get(`${API_URL}/api/public/forms/${publicId}`);
    return response.data;
  },
  
  submit: async (publicId: string, submission: FormSubmission): Promise<void> => {
    await axios.post(`${API_URL}/api/public/forms/${publicId}/submit`, submission);
  },
};

// File upload endpoint
export const uploadApi = {
  uploadFiles: async (files: FileList): Promise<UploadResponse> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Export default api instance for interceptors
export default api;