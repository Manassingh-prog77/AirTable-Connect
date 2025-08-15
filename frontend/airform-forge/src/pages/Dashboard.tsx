import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Edit, Download, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { formsApi, authApi } from '@/services/api';
import { Form } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const formsData = await formsApi.getAll();
      setForms(Array.isArray(formsData) ? formsData : []);
    } catch (error) {
      console.error('Failed to load forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your forms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      logout(); // Logout locally anyway
      navigate('/');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await formsApi.delete(formId);
      setForms(forms.filter(form => form._id !== formId));
      toast({
        title: 'Form deleted',
        description: 'The form has been successfully deleted.',
      });
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = (publicId: string) => {
    const url = `${window.location.origin}/form/${publicId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'The form link has been copied to your clipboard.',
    });
  };

  const handleExportPdf = async (formId: string) => {
    try {
      const blob = await formsApi.exportPdf(formId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${formId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF exported',
        description: 'The form PDF has been downloaded.',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-400 dark:text-gray-500 font-inter font-semibold text-lg animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter text-gray-700 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
          <h1 className="text-3xl font-serif font-bold text-indigo-900 dark:text-indigo-300">
            AirForm Forge
          </h1>
          <div className="flex items-center space-x-6">
            <span className="font-medium text-gray-600 dark:text-gray-300 select-none">
              {user?.email || 'Welcome back!'}
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-indigo-700 text-indigo-700 hover:bg-indigo-700 hover:text-white transition-colors duration-300 rounded-md px-4 py-2 font-semibold"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-serif font-semibold text-indigo-900 dark:text-indigo-300 leading-tight mb-2">
              Your Forms
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto md:mx-0">
              Create and manage beautifully designed forms synchronized with your Airtable bases.
            </p>
          </div>
          <Button
            onClick={() => navigate('/forms/new')}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 focus:ring-indigo-500 text-white rounded-lg shadow-md transition-transform duration-300 transform hover:scale-[1.05] px-6 py-3 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Form
          </Button>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="mx-auto max-w-sm">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6">
                <Plus className="w-14 h-14 text-indigo-700 dark:text-indigo-300" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
                No forms yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                Get started by creating your first premium form from an Airtable base.
              </p>
              <Button
                onClick={() => navigate('/forms/new')}
                className="bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md px-8 py-3 font-semibold transition duration-300"
              >
                Create Your First Form
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {forms.map((form, index) => (
              <motion.div
                key={form._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-serif font-semibold text-indigo-900 dark:text-indigo-300 truncate max-w-xs group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors">
                          {form.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                          {form.tableName} • {form.questions?.length || 0} questions
                        </p>
                      </div>
                      {form.isPublic && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold select-none">
                          Published
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/forms/${form._id}/edit`)}
                        className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/forms/${form._id}/preview`)}
                        className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      {form.isPublic && form.publicId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyUrl(form.publicId!)}
                          className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPdf(form._id)}
                        className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteForm(form._id)}
                        className="text-red-600 hover:text-red-700 border border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.isPublic && form.publicId && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                        <a
                          href={`/form/${form.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-400 text-sm flex items-center gap-1 font-medium"
                        >
                          View public form
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
