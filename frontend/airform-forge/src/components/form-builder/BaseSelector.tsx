import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFormStore } from '@/stores/formStore';
import { useToast } from '@/hooks/use-toast';
import { airtableApi } from '@/services/api';
import { AirtableBase } from '@/types';

const BaseSelector = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { 
    bases, 
    setBases, 
    selectedBase, 
    setSelectedBase 
  } = useFormStore();

  useEffect(() => {
    if (bases.length === 0) {
      loadBases();
    }
  }, [bases.length]);

  const loadBases = async () => {
    setLoading(true);
    try {
      const response = await airtableApi.getBases();
      setBases(response.bases || []);
    } catch (error) {
      console.error('Failed to load bases:', error);
      toast({
        title: "Error",
        description: "Failed to load Airtable bases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBase = (base: AirtableBase) => {
    setSelectedBase(base);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Available Bases</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadBases}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {bases.length === 0 ? (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No bases found. Make sure you have Airtable bases in your account.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {bases.map((base, index) => (
            <motion.div
              key={base.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`card-interactive cursor-pointer transition-all duration-200 ${
                  selectedBase?.id === base.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/30'
                }`}
                onClick={() => handleSelectBase(base)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-light p-2 rounded">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{base.name}</h4>
                      <p className="text-sm text-muted-foreground">Base ID: {base.id}</p>
                    </div>
                    {selectedBase?.id === base.id && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseSelector;