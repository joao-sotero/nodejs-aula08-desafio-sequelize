import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { token, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar aluno para student-dashboard se tentar acessar páginas de admin
  if (user?.role === 'student' && location.pathname !== '/student-dashboard') {
    return <Navigate to="/student-dashboard" replace />;
  }

  // Redirecionar admin para dashboard se tentar acessar student-dashboard
  if (user?.role === 'admin' && location.pathname === '/student-dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se a rota é adminOnly e o usuário não é admin
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return <>{children}</>;
}
