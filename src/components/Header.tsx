
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, CalendarClock } from 'lucide-react';

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-indigo-900">Controle de Explicações</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/horarios')}
            variant={location.pathname === '/horarios' ? 'default' : 'outline'}
            className="flex items-center gap-1"
            size="sm"
          >
            <CalendarClock size={16} />
            Horários
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
