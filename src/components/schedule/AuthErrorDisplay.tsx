
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AuthErrorDisplayProps {
  onLogin: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ onLogin }) => {
  return (
    <div className="container mx-auto py-4 px-2">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso não autorizado</AlertTitle>
        <AlertDescription>
          Você precisa estar logado para acessar esta página.
          <div className="mt-2">
            <Button variant="default" size="sm" onClick={onLogin}>
              Ir para login
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
