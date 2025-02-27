
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: `${username.toLowerCase()}@example.com`,
          password,
          options: {
            data: { username }
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
          email: `${username.toLowerCase()}@example.com`,
          password,
        });

        if (error) throw error;

        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
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
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : (isSignUp ? 'Registrar' : 'Entrar')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
          {' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isSignUp ? 'Entrar' : 'Registrar'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
