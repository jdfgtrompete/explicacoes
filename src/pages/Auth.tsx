
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple health check by getting session
        await supabase.auth.getSession();
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Supabase connection error:", error);
        setConnectionStatus('error');
      }
    };
    
    checkConnection();
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um nome de usuário",
        variant: "destructive",
      });
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Erro de validação",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up - Use username as email with a proper domain
        const { data, error } = await supabase.auth.signUp({
          email: `${username.toLowerCase()}@lovable.dev`,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Registro bem-sucedido!",
          description: "Sua conta foi criada. Você já pode fazer login.",
        });
        setIsSignUp(false);
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username.toLowerCase()}@lovable.dev`,
          password,
        });

        if (error) throw error;

        navigate('/');
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // More user-friendly error messages
      let errorMessage = error.message;
      if (errorMessage.includes("Failed to fetch") || error.code === "NETWORK_ERROR") {
        errorMessage = "Falha na conexão com o servidor. Verifique sua conexão de internet e tente novamente.";
      } else if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Nome de usuário ou senha incorretos.";
      } else if (errorMessage.includes("Email address")) {
        errorMessage = "Nome de usuário inválido. Use apenas letras, números e caracteres básicos.";
      }
      
      toast({
        title: "Erro de autenticação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-8"
      >
        <h1 className="text-2xl font-semibold text-center text-indigo-900 mb-6">
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h1>
        
        {connectionStatus === 'error' && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              Não foi possível conectar ao servidor. Verifique sua conexão de internet e recarregue a página.
            </AlertDescription>
          </Alert>
        )}
        
        {isSignUp && (
          <Alert className="mb-6">
            <AlertDescription>
              A senha deve ter pelo menos 6 caracteres.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="seu_usuario"
              disabled={connectionStatus === 'error' || isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              minLength={6}
              disabled={connectionStatus === 'error' || isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={connectionStatus === 'error' || isLoading}
          >
            {isLoading ? 'Carregando...' : (isSignUp ? 'Registrar' : 'Entrar')}
          </Button>
        </form>

        {connectionStatus !== 'error' && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
            {' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
              disabled={isLoading}
            >
              {isSignUp ? 'Entrar' : 'Registrar'}
            </button>
          </p>
        )}
        
        {connectionStatus === 'error' && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mx-auto"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
