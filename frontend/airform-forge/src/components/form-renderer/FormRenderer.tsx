import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { uploadApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Form, PublicForm, FormSubmission } from '@/types';

interface FormRendererProps {
  form: Form | PublicForm;
  onSubmit: (data: FormSubmission) => void;
  loading?: boolean;
  preview?: boolean;
}

const FormRenderer = ({ form, onSubmit, loading = false, preview = false }: FormRendererProps) => {
  const { toast } = useToast();
  const [schema, setSchema] = useState<z.ZodSchema | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Create validation schema
  useEffect(() => {
    const schemaFields: Record<string, z.ZodType> = {};
    
    form.questions.forEach(question => {
      const isVisible = evaluateVisibility(question.visibleWhen, {});
      
      if (isVisible) {
        let fieldSchema: z.ZodType;
        
        switch (question.fieldType) {
          case 'singleLineText':
          case 'longText':
            fieldSchema = z.string();
            break;
          case 'singleSelect':
            fieldSchema = z.string();
            break;
          case 'multipleSelects':
            fieldSchema = z.array(z.string());
            break;
          case 'multipleAttachments':
            fieldSchema = z.array(z.string());
            break;
          default:
            fieldSchema = z.any();
        }
        
        if (question.required) {
          if (question.fieldType === 'multipleSelects' || question.fieldType === 'multipleAttachments') {
            fieldSchema = (fieldSchema as z.ZodArray<any>).min(1, `${question.label} is required`);
          } else {
            fieldSchema = (fieldSchema as z.ZodString).min(1, `${question.label} is required`);
          }
        } else {
          fieldSchema = fieldSchema.optional();
        }
        
        schemaFields[question.fieldId] = fieldSchema;
      }
    });

    setSchema(z.object(schemaFields));
  }, [form.questions]);

  const formMethods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange'
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;
  const watchedValues = watch();

  // Evaluate visibility conditions
  const evaluateVisibility = (visibleWhen: any, values: Record<string, any>) => {
    if (!visibleWhen.rules || visibleWhen.rules.length === 0) return true;
    
    const evaluateRule = (rule: any) => {
      const fieldValue = values[rule.fieldId];
      
      switch (rule.operator) {
        case 'equals':
          return fieldValue === rule.value;
        case 'notEquals':
          return fieldValue !== rule.value;
        case 'includes':
          return Array.isArray(fieldValue) ? fieldValue.includes(rule.value) : false;
        case 'notIncludes':
          return Array.isArray(fieldValue) ? !fieldValue.includes(rule.value) : true;
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
        case 'notExists':
          return fieldValue === undefined || fieldValue === null || fieldValue === '';
        default:
          return false;
      }
    };
    
    const results = visibleWhen.rules.map(evaluateRule);
    
    return visibleWhen.logic === 'all' 
      ? results.every(Boolean)
      : results.some(Boolean);
  };

  const handleFileUpload = async (fieldId: string, files: FileList) => {
    if (!files.length) return;
    
    setUploading(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      const response = await uploadApi.uploadFiles(files);
      const newUrls = response.urls;
      
      setUploadedFiles(prev => ({
        ...prev,
        [fieldId]: [...(prev[fieldId] || []), ...newUrls]
      }));
      
      setValue(fieldId, [...(uploadedFiles[fieldId] || []), ...newUrls]);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const removeFile = (fieldId: string, urlToRemove: string) => {
    const newFiles = uploadedFiles[fieldId]?.filter(url => url !== urlToRemove) || [];
    setUploadedFiles(prev => ({ ...prev, [fieldId]: newFiles }));
    setValue(fieldId, newFiles);
  };

  const onFormSubmit = (data: Record<string, any>) => {
    // Include uploaded files in submission
    const submissionData = { ...data };
    Object.keys(uploadedFiles).forEach(fieldId => {
      if (uploadedFiles[fieldId].length > 0) {
        submissionData[fieldId] = uploadedFiles[fieldId];
      }
    });
    
    onSubmit({ answers: submissionData });
  };

  const renderField = (question: any, index: number) => {
    const isVisible = evaluateVisibility(question.visibleWhen, watchedValues);
    
    if (!isVisible) return null;

    return (
      <motion.div
        key={question.fieldId}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="field-group"
      >
        <Label htmlFor={question.fieldId} className="field-label">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {question.fieldType === 'singleLineText' && (
          <Input
            id={question.fieldId}
            {...register(question.fieldId)}
            className="field-input"
            placeholder={`Enter ${question.label.toLowerCase()}...`}
          />
        )}
        
        {question.fieldType === 'longText' && (
          <Textarea
            id={question.fieldId}
            {...register(question.fieldId)}
            className="field-input min-h-[100px]"
            placeholder={`Enter ${question.label.toLowerCase()}...`}
          />
        )}
        
        {question.fieldType === 'singleSelect' && (
          <select
            id={question.fieldId}
            {...register(question.fieldId)}
            className="field-input"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        
        {question.fieldType === 'multipleSelects' && (
          <div className="space-y-2">
            {question.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.fieldId}-${option}`}
                  value={option}
                  onCheckedChange={(checked) => {
                    const currentValues = watchedValues[question.fieldId] || [];
                    if (checked) {
                      setValue(question.fieldId, [...currentValues, option]);
                    } else {
                      setValue(question.fieldId, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${question.fieldId}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}
        
        {question.fieldType === 'multipleAttachments' && (
          <div className="space-y-3">
            <div className="drop-zone">
              <input
                type="file"
                multiple
                className="hidden"
                id={`file-${question.fieldId}`}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(question.fieldId, e.target.files);
                  }
                }}
              />
              <label
                htmlFor={`file-${question.fieldId}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading[question.fieldId] ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {uploading[question.fieldId] 
                    ? 'Uploading files...'
                    : 'Drop files here or click to upload'
                  }
                </p>
              </label>
            </div>
            
            {uploadedFiles[question.fieldId] && uploadedFiles[question.fieldId].length > 0 && (
              <div className="space-y-2">
                {uploadedFiles[question.fieldId].map((url, fileIndex) => (
                  <div key={fileIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">
                      {url.split('/').pop()}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(question.fieldId, url)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {errors[question.fieldId] && (
          <p className="text-sm text-destructive mt-1">
            {errors[question.fieldId]?.message as string}
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {form.questions.map((question, index) => renderField(question, index))}
      
      <div className="pt-6 border-t border-border">
        <Button
          type="submit"
          disabled={loading || Object.keys(uploading).some(key => uploading[key])}
          className="btn-hero"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : preview ? (
            'Preview Submission'
          ) : (
            'Submit Form'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormRenderer;