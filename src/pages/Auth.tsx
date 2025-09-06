import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useSimpleAuth();

  const validatePassword = (password: string) => {
    if (password.length < 3) {
      return "A senha deve ter pelo menos 3 caracteres";
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Erro",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let success = false;
      
      if (isSignUp) {
        success = await register(username, password);
        if (success) {
          toast({
            title: "Sucesso!",
            description: "Conta criada com sucesso!",
          });
        } else {
          toast({
            title: "Erro",
            description: "Nome de usuário já existe",
            variant: "destructive",
          });
        }
      } else {
        success = await login(username, password);
        if (success) {
          toast({
            title: "Sucesso!",
            description: "Login realizado!",
          });
        } else {
          toast({
            title: "Erro",
            description: "Nome de usuário ou senha incorretos",
            variant: "destructive",
          });
        }
      }
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado",
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
              A senha deve ter pelo menos 3 caracteres.
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
              disabled={isLoading}
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
              minLength={3}
              disabled={isLoading}
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
            disabled={isLoading}
          >
            {isSignUp ? 'Entrar' : 'Registrar'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;