import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Type, AlignLeft, List, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { useToast } from '@/hooks/use-toast';
import { airtableApi } from '@/services/api';
import { AirtableField, FormQuestion } from '@/types';

interface FieldSelectorProps {
  onStepChange: (step: 'base' | 'table' | 'fields' | 'build') => void;
}

const fieldTypeIcons = {
  singleLineText: Type,
  longText: AlignLeft,
  singleSelect: List,
  multipleSelects: List,
  multipleAttachments: Paperclip,
};

const fieldTypeLabels = {
  singleLineText: 'Single Line Text',
  longText: 'Long Text',
  singleSelect: 'Single Select',
  multipleSelects: 'Multiple Select',
  multipleAttachments: 'File Attachments',
};

const FieldSelector = ({ onStepChange }: FieldSelectorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { 
    fields, 
    setFields, 
    selectedBase,
    selectedTable,
    currentForm,
    addQuestion
  } = useFormStore();

  useEffect(() => {
    if (selectedBase && selectedTable && fields.length === 0) {
      loadFields();
    }
  }, [selectedBase, selectedTable, fields.length]);

  const loadFields = async () => {
    if (!selectedBase || !selectedTable) return;
    
    setLoading(true);
    try {
      const response = await airtableApi.getFields(selectedBase.id, selectedTable.id);
      // Filter to only supported field types
      const supportedFields = (response.fields || []).filter(field => 
        ['singleLineText', 'longText', 'singleSelect', 'multipleSelects', 'multipleAttachments'].includes(field.type)
      );
      setFields(supportedFields);
    } catch (error) {
      console.error('Failed to load fields:', error);
      toast({
        title: "Error",
        description: "Failed to load fields. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (field: AirtableField) => {
    const question: FormQuestion = {
      fieldId: field.id,
      fieldName: field.name,
      fieldType: field.type,
      label: field.name,
      required: false,
      visibleWhen: { logic: 'all', rules: [] },
      options: field.options
    };
    
    addQuestion(question);
    
    toast({
      title: "Field added",
      description: `${field.name} has been added to your form.`,
    });
  };

  const isFieldAdded = (fieldId: string) => {
    return currentForm?.questions?.some(q => q.fieldId === fieldId) || false;
  };

  if (!selectedBase || !selectedTable) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please select a base and table first.</p>
          <Button
            variant="outline"
            onClick={() => onStepChange('base')}
            className="mt-4"
          >
            Go Back to Base Selection
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Available Fields
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add fields from {selectedTable.name} to your form
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFields}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <Type className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No supported fields found in this table.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supported types: Single Line Text, Long Text, Single Select, Multiple Select, File Attachments
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const Icon = fieldTypeIcons[field.type];
                const isAdded = isFieldAdded(field.id);
                
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`card-interactive ${isAdded ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-primary-light p-2 rounded">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{field.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {fieldTypeLabels[field.type]}
                                </Badge>
                                {field.options && field.options.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {field.options.length} options
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddField(field)}
                            disabled={isAdded}
                            className={isAdded ? '' : 'btn-hero'}
                            variant={isAdded ? 'outline' : 'default'}
                          >
                            {isAdded ? 'Added' : 'Add to Form'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {currentForm?.questions && currentForm.questions.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {currentForm.questions.length} field(s) added to your form
            </p>
            <div className="space-y-2">
              {currentForm.questions.map((question, index) => (
                <div key={question.fieldId} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="font-medium">{question.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {fieldTypeLabels[question.fieldType]}
                  </Badge>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FieldSelector;