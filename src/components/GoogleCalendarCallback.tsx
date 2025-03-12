
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

export const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      const authPending = localStorage.getItem('googleCalendarAuthPending');

      if (errorParam) {
        console.error('Error returned from Google:', errorParam);
        setError(`Erro na autenticação do Google: ${errorParam}`);
        setLoading(false);
        return;
      }

      if (!code) {
        console.error('No code parameter found in URL');
        setError('Código de autorização não encontrado na URL');
        setLoading(false);
        return;
      }

      if (!authPending) {
        console.error('No auth pending flag in localStorage');
        setError('Sessão de autenticação expirada ou inválida');
        setLoading(false);
        return;
      }

      try {
        console.log('Exchanging code for token...');
        const { data, error } = await supabase.functions.invoke('google-calendar', {
          body: { action: 'getToken', code }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Erro ao obter token');
        }

        if (!data || !data.access_token) {
          console.error('No access token in response:', data);
          throw new Error('Token de acesso não recebido');
        }

        console.log('Successfully received token');
        
        // Store the access token securely
        localStorage.setItem('googleCalendarToken', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('googleCalendarRefreshToken', data.refresh_token);
        }
        localStorage.removeItem('googleCalendarAuthPending');

        toast({
          title: "Sucesso!",
          description: "Conectado ao Google Calendar com sucesso!",
        });
        
        // Small delay to ensure toast is shown before redirect
        setTimeout(() => navigate('/'), 1000);
      } catch (error) {
        console.error('Error getting token:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        toast({
          title: "Erro",
          description: "Não foi possível completar a autenticação com o Google Calendar.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erro na autenticação</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button 
            onClick={() => navigate('/')}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Conectando ao Google Calendar...</h2>
        <p className="text-gray-600">Por favor, aguarde{loading ? '...' : ''}</p>
        {!loading && (
          <button 
            onClick={() => navigate('/')}
            className="mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        )}
      </div>
    </div>
  );
};
