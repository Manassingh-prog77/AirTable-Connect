// This is a fallback - the app should redirect to Landing page

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse-soft text-muted-foreground">Redirecting...</div>
    </div>
  );
};

export default Index;
