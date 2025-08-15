import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formsApi } from '@/services/api';
import { Form } from '@/types';
import FormRenderer from '@/components/form-renderer/FormRenderer';

const FormPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const formData = await formsApi.getById(formId);
      setForm(formData);
    } catch (error) {
      console.error('Failed to load form:', error);
      toast({
        title: "Error",
        description: "Failed to load form. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    if (!form) return;
    
    setUpdating(true);
    try {
      const updatedForm = await formsApi.update(form._id, { isPublic });
      setForm(updatedForm);
      toast({
        title: isPublic ? "Form published" : "Form unpublished",
        description: isPublic 
          ? "Your form is now public and can be shared with others."
          : "Your form is now private and no longer accessible via public link.",
      });
    } catch (error) {
      console.error('Failed to update form:', error);
      toast({
        title: "Error",
        description: "Failed to update form visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyLink = () => {
    if (!form?.publicId) return;
    
    const url = `${window.location.origin}/form/${form.publicId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "The form link has been copied to your clipboard.",
    });
  };

  const handleExportPdf = async () => {
    if (!form) return;
    
    try {
      const blob = await formsApi.exportPdf(form._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF exported",
        description: "The form PDF has been downloaded.",
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Form not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
                  Preview: {form.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {form.tableName} • {form.questions?.length || 0} questions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExportPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => navigate(`/forms/${form._id}/edit`)}
                className="btn-hero"
              >
                Edit Form
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Form Preview */}
          <div className="col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="card-elevated">
                <CardHeader className="border-b border-border">
                  <CardTitle>Form Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This is how your form will appear to users
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <FormRenderer 
                    form={form} 
                    onSubmit={(data) => {
                      console.log('Preview submission:', data);
                      toast({
                        title: "Preview submission",
                        description: "This is just a preview. No data was actually submitted.",
                      });
                    }}
                    preview={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Settings Sidebar */}
          <div className="col-span-4">
            <div className="space-y-6">
              {/* Publishing Settings */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="public-toggle" className="text-sm font-medium">
                        Make form public
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Allow anyone with the link to submit responses
                      </p>
                    </div>
                    <Switch
                      id="public-toggle"
                      checked={form.isPublic}
                      onCheckedChange={handleTogglePublic}
                      disabled={updating}
                    />
                  </div>
                  
                  {form.isPublic && form.publicId && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Public Form URL</Label>
                        <div className="mt-1 p-2 bg-muted rounded text-sm font-mono text-muted-foreground break-all">
                          {window.location.origin}/form/{form.publicId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLink}
                          className="flex-1"
                        >
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/form/${form.publicId}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Stats */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Form Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Questions</span>
                      <span className="text-sm font-medium">{form.questions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Required fields</span>
                      <span className="text-sm font-medium">
                        {form.questions?.filter(q => q.required).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conditional fields</span>
                      <span className="text-sm font-medium">
                        {form.questions?.filter(q => q.visibleWhen.rules.length > 0).length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;