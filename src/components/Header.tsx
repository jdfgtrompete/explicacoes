
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
  };

  const handleGoogleCalendar = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;

      // Store the state in localStorage to verify when the user returns
      localStorage.setItem('googleCalendarAuthPending', 'true');
      
      // Redirect to Google's authorization page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating Google Calendar auth:', error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao Google Calendar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-indigo-900">Controle de Explicações</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGoogleCalendar}
            variant="outline"
            className="flex items-center gap-1"
            size="sm"
          >
            <Calendar size={16} />
            Google Calendar
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-1"
            size="sm"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
