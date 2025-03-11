
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

export const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authPending = localStorage.getItem('googleCalendarAuthPending');

      if (!code || !authPending) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-calendar', {
          body: { action: 'getToken', code }
        });

        if (error) throw error;

        // Store the access token securely (you might want to improve this)
        localStorage.setItem('googleCalendarToken', data.access_token);
        localStorage.removeItem('googleCalendarAuthPending');

        toast({
          title: "Sucesso!",
          description: "Conectado ao Google Calendar com sucesso!",
        });
      } catch (error) {
        console.error('Error getting token:', error);
        toast({
          title: "Erro",
          description: "Não foi possível completar a autenticação com o Google Calendar.",
          variant: "destructive",
        });
      } finally {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Conectando ao Google Calendar...</h2>
        <p className="text-gray-600">Por favor, aguarde...</p>
      </div>
    </div>
  );
};
