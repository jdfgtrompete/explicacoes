
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Calendar } from 'lucide-react';

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const handleGoogleCalendar = () => {
    window.open('https://calendar.google.com/', '_blank');
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
