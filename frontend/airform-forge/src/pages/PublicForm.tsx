import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { publicApi } from '@/services/api';
import { PublicForm as PublicFormType, FormSubmission } from '@/types';
import FormRenderer from '@/components/form-renderer/FormRenderer';

const PublicForm = () => {
  const { publicId } = useParams();
  const [form, setForm] = useState<PublicFormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicId) {
      loadForm(publicId);
    }
  }, [publicId]);

  const loadForm = async (formId: string) => {
    try {
      const formData = await publicApi.getForm(formId);
      setForm(formData);
    } catch (error: any) {
      console.error('Failed to load form:', error);
      if (error.response?.status === 404) {
        setError('Form not found or no longer available.');
      } else {
        setError('Failed to load form. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submission: FormSubmission) => {
    if (!publicId) return;
    
    setSubmitting(true);
    try {
      await publicApi.submit(publicId, submission);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Failed to submit form:', error);
      setError(error.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary-light/10 flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary-light/10 flex items-center justify-center">
        <Card className="card-elevated max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary-light/10 flex items-center justify-center">
        <Card className="card-elevated max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Form not found
            </h2>
            <p className="text-muted-foreground">
              This form may have been removed or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-success-light/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="card-elevated max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Thank you!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your response has been successfully submitted and saved to the database.
              </p>
              <Button 
                onClick={handleSubmitAnother}
                className="btn-hero"
              >
                Submit Another Response
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-light/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {form.title}
            </h1>
            <p className="text-muted-foreground">
              Please fill out all required fields
            </p>
          </div>

          {/* Form */}
          <Card className="card-elevated">
            <CardContent className="p-8">
              <FormRenderer 
                form={form}
                onSubmit={handleSubmit}
                loading={submitting}
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <span className="font-medium text-primary">AirForm Forge</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicForm;