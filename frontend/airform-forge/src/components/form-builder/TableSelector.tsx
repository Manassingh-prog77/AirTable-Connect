import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Table, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFormStore } from '@/stores/formStore';
import { useToast } from '@/hooks/use-toast';
import { airtableApi } from '@/services/api';
import { AirtableTable } from '@/types';

const TableSelector = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { 
    tables, 
    setTables, 
    selectedBase,
    selectedTable, 
    setSelectedTable 
  } = useFormStore();

  useEffect(() => {
    if (selectedBase && tables.length === 0) {
      loadTables();
    }
  }, [selectedBase, tables.length]);

  const loadTables = async () => {
    if (!selectedBase) return;
    
    setLoading(true);
    try {
      const response = await airtableApi.getTables(selectedBase.id);
      setTables(response.tables || []);
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast({
        title: "Error",
        description: "Failed to load tables. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table: AirtableTable) => {
    setSelectedTable(table);
  };

  if (!selectedBase) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please select a base first.</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Tables in {selectedBase.name}</h3>
          <p className="text-sm text-muted-foreground">Choose where responses will be saved</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadTables}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-8">
          <Table className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No tables found in this base.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`card-interactive cursor-pointer transition-all duration-200 ${
                  selectedTable?.id === table.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/30'
                }`}
                onClick={() => handleSelectTable(table)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-light p-2 rounded">
                      <Table className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{table.name}</h4>
                      <p className="text-sm text-muted-foreground">Table ID: {table.id}</p>
                    </div>
                    {selectedTable?.id === table.id && (
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

export default TableSelector;