import { create } from 'zustand';
import { Form, FormQuestion, AirtableBase, AirtableTable, AirtableField } from '@/types';

interface FormState {
  // Current form being edited
  currentForm: Partial<Form> | null;
  
  // Airtable data
  bases: AirtableBase[];
  tables: AirtableTable[];
  fields: AirtableField[];
  
  // Form builder state
  selectedBase: AirtableBase | null;
  selectedTable: AirtableTable | null;
  
  // Actions
  setCurrentForm: (form: Partial<Form> | null) => void;
  updateFormField: (field: keyof Form, value: any) => void;
  addQuestion: (question: FormQuestion) => void;
  updateQuestion: (index: number, question: FormQuestion) => void;
  removeQuestion: (index: number) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  
  // Airtable data actions
  setBases: (bases: AirtableBase[]) => void;
  setTables: (tables: AirtableTable[]) => void;
  setFields: (fields: AirtableField[]) => void;
  setSelectedBase: (base: AirtableBase | null) => void;
  setSelectedTable: (table: AirtableTable | null) => void;
  
  // Reset actions
  resetBuilder: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  currentForm: null,
  bases: [],
  tables: [],
  fields: [],
  selectedBase: null,
  selectedTable: null,
  
  setCurrentForm: (form) => set({ currentForm: form }),
  
  updateFormField: (field, value) => {
    const { currentForm } = get();
    set({
      currentForm: currentForm ? { ...currentForm, [field]: value } : { [field]: value }
    });
  },
  
  addQuestion: (question) => {
    const { currentForm } = get();
    const questions = currentForm?.questions || [];
    set({
      currentForm: {
        ...currentForm,
        questions: [...questions, question]
      }
    });
  },
  
  updateQuestion: (index, question) => {
    const { currentForm } = get();
    if (!currentForm?.questions) return;
    
    const questions = [...currentForm.questions];
    questions[index] = question;
    set({
      currentForm: {
        ...currentForm,
        questions
      }
    });
  },
  
  removeQuestion: (index) => {
    const { currentForm } = get();
    if (!currentForm?.questions) return;
    
    const questions = currentForm.questions.filter((_, i) => i !== index);
    set({
      currentForm: {
        ...currentForm,
        questions
      }
    });
  },
  
  reorderQuestions: (startIndex, endIndex) => {
    const { currentForm } = get();
    if (!currentForm?.questions) return;
    
    const questions = [...currentForm.questions];
    const [reorderedItem] = questions.splice(startIndex, 1);
    questions.splice(endIndex, 0, reorderedItem);
    
    set({
      currentForm: {
        ...currentForm,
        questions
      }
    });
  },
  
  setBases: (bases) => set({ bases }),
  setTables: (tables) => set({ tables }),
  setFields: (fields) => set({ fields }),
  
  setSelectedBase: (base) => set({ 
    selectedBase: base,
    selectedTable: null,
    tables: [],
    fields: []
  }),
  
  setSelectedTable: (table) => set({ 
    selectedTable: table,
    fields: []
  }),
  
  resetBuilder: () => set({
    currentForm: null,
    bases: [],
    tables: [],
    fields: [],
    selectedBase: null,
    selectedTable: null,
  }),
}));