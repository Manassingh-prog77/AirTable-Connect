import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { FormQuestion } from '@/types';

const FormCanvas = () => {
  const { 
    currentForm, 
    updateQuestion, 
    removeQuestion, 
    reorderQuestions 
  } = useFormStore();

  const questions = currentForm?.questions || [];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    reorderQuestions(result.source.index, result.destination.index);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Are you sure you want to remove this field?')) {
      removeQuestion(index);
    }
  };

  const handleToggleRequired = (index: number, question: FormQuestion) => {
    updateQuestion(index, { ...question, required: !question.required });
  };

  const getQuestionPreview = (question: FormQuestion) => {
    switch (question.fieldType) {
      case 'singleLineText':
        return <input className="field-input" placeholder="Single line text input" disabled />;
      case 'longText':
        return <textarea className="field-input min-h-[80px]" placeholder="Long text area" disabled />;
      case 'singleSelect':
        return (
          <select className="field-input" disabled>
            <option>Select an option...</option>
            {question.options?.map(option => (
              <option key={option}>{option}</option>
            ))}
          </select>
        );
      case 'multipleSelects':
        return (
          <div className="space-y-2">
            {question.options?.slice(0, 3).map(option => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input type="checkbox" disabled />
                {option}
              </label>
            ))}
            {question.options && question.options.length > 3 && (
              <span className="text-sm text-muted-foreground">
                ...and {question.options.length - 3} more
              </span>
            )}
          </div>
        );
      case 'multipleAttachments':
        return (
          <div className="drop-zone">
            <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
          </div>
        );
      default:
        return <div className="field-input bg-muted">Unknown field type</div>;
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Edit className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Building Your Form
            </h3>
            <p className="text-muted-foreground">
              Add fields from the right panel to start building your form. 
              You can drag and drop to reorder them later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag and drop to reorder fields
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {currentForm?.title || 'Untitled Form'}
            </h2>
            <p className="text-muted-foreground">
              Please fill out all required fields marked with an asterisk (*)
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="form-questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {questions.map((question, index) => (
                    <Draggable
                      key={question.fieldId}
                      draggableId={question.fieldId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group ${
                            snapshot.isDragging ? 'shadow-large' : ''
                          }`}
                        >
                          <Card className="card-interactive bg-card-elevated">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="drag-handle pt-2"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Question Content */}
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <label className="field-label">
                                          {question.label}
                                          {question.required && (
                                            <span className="text-destructive ml-1">*</span>
                                          )}
                                        </label>
                                        <Badge variant="outline" className="text-xs">
                                          {question.fieldType}
                                        </Badge>
                                        {question.visibleWhen.rules.length > 0 && (
                                          <Badge variant="secondary" className="text-xs">
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Conditional
                                          </Badge>
                                        )}
                                      </div>
                                      {getQuestionPreview(question)}
                                    </div>

                                    {/* Question Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleRequired(index, question)}
                                        className={question.required ? 'text-destructive' : 'text-muted-foreground'}
                                      >
                                        {question.required ? 'Required' : 'Optional'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteQuestion(index)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Conditional Logic Preview */}
                                  {question.visibleWhen.rules.length > 0 && (
                                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                      <Eye className="w-3 h-3 inline mr-1" />
                                      Visible when: {question.visibleWhen.logic === 'all' ? 'All' : 'Any'} of the following conditions are met
                                      <div className="mt-1 space-y-1">
                                        {question.visibleWhen.rules.map((rule, ruleIndex) => (
                                          <div key={ruleIndex} className="text-muted-foreground">
                                            • Field "{rule.fieldId}" {rule.operator} "{rule.value}"
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Submit Button Preview */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button className="btn-hero" disabled>
              Submit Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormCanvas;