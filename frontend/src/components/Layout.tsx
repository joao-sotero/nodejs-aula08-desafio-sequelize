import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  LogOut,
  UserPlus,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/classes', icon: Users, label: 'Turmas' },
    { path: '/subjects', icon: BookOpen, label: 'Disciplinas' },
    { path: '/students', icon: GraduationCap, label: 'Alunos' },
    { path: '/grades', icon: ClipboardList, label: 'Notas' },
    { path: '/users', icon: UserPlus, label: 'Usuários' },
    { path: '/report-cards', icon: FileText, label: 'Boletins' },
  ];

  // Se for aluno, não mostrar sidebar de navegação
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-sidebar-border bg-sidebar">
          <div className="container mx-auto p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-sidebar-foreground">Sistema Escolar</h1>
            <div className="flex items-center gap-4">
              <div className="text-sidebar-foreground text-right">
                <p className="text-sm font-medium">{user?.nome}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Sistema Escolar</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="text-sidebar-foreground">
              <p className="text-sm font-medium">{user?.nome}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
