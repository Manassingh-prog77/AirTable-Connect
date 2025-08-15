import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FormInput, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // Handle OAuth callback
    const ok = searchParams.get('ok');
    if (ok === '1') {
      setUser({ id: 'authenticated' });
      toast({
        title: 'Welcome to AirForm Forge!',
        description: 'Successfully connected to Airtable.',
      });
      navigate('/dashboard');
    }
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [searchParams, isAuthenticated, setUser, navigate, toast]);

  const handleConnect = () => {
    authApi.login();
  };

  const features = [
    {
      icon: FormInput,
      title: 'Visual Form Builder',
      description: 'Drag and drop interface to build forms from your Airtable fields',
    },
    {
      icon: Zap,
      title: 'Conditional Logic',
      description: 'Show or hide fields based on user responses with powerful logic rules',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays in your Airtable. We never store sensitive information',
    },
    {
      icon: BarChart3,
      title: 'Instant Sync',
      description: 'Responses automatically sync to your Airtable base in real-time',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 font-inter text-gray-800 dark:from-gray-900 dark:to-indigo-900 dark:text-gray-200">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-indigo-900 dark:text-indigo-300 mb-6 leading-tight">
            Build Beautiful Forms from Your{' '}
            <span className="text-gradient font-semibold">Airtable Data</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Transform your Airtable bases into powerful, conditional forms. Collect responses
            that sync directly back to your tables with ease and style.
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={handleConnect}
              className="inline-flex items-center bg-indigo-700 hover:bg-indigo-800 focus:ring-indigo-600 text-white rounded-lg shadow-lg px-10 py-4 font-semibold text-lg transition-transform duration-300 transform hover:scale-[1.06]"
            >
              Connect to Airtable
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mt-28 max-w-6xl mx-auto"
        >
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-transform duration-300 cursor-default group"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 mb-5 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-700 transition-colors">
                <Icon className="w-8 h-8 text-indigo-700 dark:text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* How it works Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32 max-w-5xl mx-auto text-center px-4"
        >
          <h2 className="text-4xl font-serif font-bold text-indigo-900 dark:text-indigo-300 mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[{
              number: '1',
              title: 'Connect Your Airtable',
              description: 'Securely connect your Airtable account and choose which base to work with',
            },{
              number: '2',
              title: 'Build Your Form',
              description: 'Select fields, add conditional logic, and customize labels to create the perfect form',
            },{
              number: '3',
              title: 'Collect Responses',
              description: 'Share your form and watch responses flow directly into your Airtable base',
            }].map(({ number, title, description }) => (
              <div key={number} className="space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-700 text-white flex items-center justify-center font-serif font-bold text-2xl">
                  {number}
                </div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
