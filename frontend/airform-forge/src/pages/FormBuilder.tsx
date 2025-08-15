import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStore } from '@/stores/formStore';
import { useToast } from '@/hooks/use-toast';
import { formsApi, airtableApi } from '@/services/api';
import BaseSelector from '@/components/form-builder/BaseSelector';
import TableSelector from '@/components/form-builder/TableSelector';
import FieldSelector from '@/components/form-builder/FieldSelector';
import FormCanvas from '@/components/form-builder/FormCanvas';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'base' | 'table' | 'fields' | 'build'>('base');
  
  const {
    currentForm,
    setCurrentForm,
    updateFormField,
    selectedBase,
    selectedTable,
    resetBuilder
  } = useFormStore();

  useEffect(() => {
    if (id && id !== 'new') {
      loadForm(id);
    } else {
      resetBuilder();
      setCurrentForm({
        title: '',
        questions: [],
        isPublic: false
      });
    }
  }, [id, resetBuilder, setCurrentForm]);

  const loadForm = async (formId: string) => {
    try {
      const form = await formsApi.getById(formId);
      setCurrentForm(form);
      // Set step to build if form already exists
      setStep('build');
    } catch (error) {
      console.error('Failed to load form:', error);
      toast({
        title: "Error",
        description: "Failed to load form. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    if (!currentForm?.title?.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a form title before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBase || !selectedTable) {
      toast({
        title: "Missing selection",
        description: "Please select a base and table before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const formData = {
        ...currentForm,
        baseId: selectedBase.id,
        tableId: selectedTable.id,
        tableName: selectedTable.name,
      };

      if (id && id !== 'new') {
        await formsApi.update(id, formData);
        toast({
          title: "Form updated",
          description: "Your form has been successfully updated.",
        });
      } else {
        const newForm = await formsApi.create(formData);
        navigate(`/forms/${newForm._id}/edit`);
        toast({
          title: "Form created",
          description: "Your form has been successfully created.",
        });
      }
    } catch (error) {
      console.error('Failed to save form:', error);
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (id && id !== 'new') {
      navigate(`/forms/${id}/preview`);
    } else {
      toast({
        title: "Save first",
        description: "Please save your form before previewing.",
        variant: "destructive",
      });
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 'base':
        return !!selectedBase;
      case 'table':
        return !!selectedTable;
      case 'fields':
        return currentForm?.questions && currentForm.questions.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    switch (step) {
      case 'base':
        setStep('table');
        break;
      case 'table':
        setStep('fields');
        break;
      case 'fields':
        setStep('build');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {id === 'new' ? 'Create New Form' : 'Edit Form'}
                </h1>
                {currentForm?.title && (
                  <p className="text-sm text-muted-foreground">{currentForm.title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!id || id === 'new'}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !currentForm?.title?.trim()}
                className="btn-hero"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {step === 'build' ? (
          /* Full Form Builder */
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Form Settings */}
            <div className="col-span-3">
              <Card className="card-elevated sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Form Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="form-title">Form Title</Label>
                    <Input
                      id="form-title"
                      value={currentForm?.title || ''}
                      onChange={(e) => updateFormField('title', e.target.value)}
                      placeholder="Enter form title..."
                      className="field-input"
                    />
                  </div>
                  
                  <div>
                    <Label>Base & Table</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBase?.name} → {selectedTable?.name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('base')}
                      className="mt-2"
                    >
                      Change Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center - Form Canvas */}
            <div className="col-span-6">
              <FormCanvas />
            </div>

            {/* Right Sidebar - Field Palette */}
            <div className="col-span-3">
              <FieldSelector onStepChange={setStep} />
            </div>
          </div>
        ) : (
          /* Step-by-step Setup */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                {['base', 'table', 'fields', 'build'].map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === stepName
                          ? 'bg-primary text-primary-foreground'
                          : ['base', 'table', 'fields', 'build'].indexOf(step) > index
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="w-8 h-px bg-border mx-2" />
                    )}
                  </div>
                ))}
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {step === 'base' && 'Select Your Airtable Base'}
                {step === 'table' && 'Choose a Table'}
                {step === 'fields' && 'Add Form Fields'}
              </h2>
              <p className="text-muted-foreground">
                {step === 'base' && 'Choose which Airtable base contains the data you want to collect'}
                {step === 'table' && 'Select the table where form responses should be saved'}
                {step === 'fields' && 'Select which fields to include in your form'}
              </p>
            </div>

            <Card className="card-elevated">
              <CardContent className="p-6">
                {step === 'base' && <BaseSelector />}
                {step === 'table' && <TableSelector />}
                {step === 'fields' && <FieldSelector onStepChange={setStep} />}
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === 'table') setStep('base');
                      else if (step === 'fields') setStep('table');
                    }}
                    disabled={step === 'base'}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="btn-hero"
                  >
                    {step === 'fields' ? 'Start Building' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;