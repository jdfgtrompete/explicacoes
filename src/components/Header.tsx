
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, CalendarClock } from 'lucide-react';

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-indigo-900">Controle de Explicações</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/agenda')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CalendarClock size={16} />
            Agenda Semanal
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
