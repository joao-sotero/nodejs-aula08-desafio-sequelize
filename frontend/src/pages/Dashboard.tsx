import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

export default function Dashboard() {
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/classes');
      return response.data;
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await api.get('/subjects');
      return response.data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    },
  });

  const { data: grades } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await api.get('/grades');
      return response.data;
    },
  });

  const stats = [
    {
      title: 'Turmas',
      value: classes?.length || 0,
      icon: Users,
      color: 'bg-primary',
    },
    {
      title: 'Disciplinas',
      value: subjects?.length || 0,
      icon: BookOpen,
      color: 'bg-secondary',
    },
    {
      title: 'Alunos',
      value: students?.length || 0,
      icon: GraduationCap,
      color: 'bg-accent',
    },
    {
      title: 'Notas Lançadas',
      value: grades?.length || 0,
      icon: ClipboardList,
      color: 'bg-success',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema escolar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Turmas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classes?.slice(0, 5).map((classe: any) => (
                  <div key={classe.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{classe.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {classe.studentCount || 0} alunos
                    </span>
                  </div>
                ))}
                {!classes?.length && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma turma cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disciplinas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subjects?.slice(0, 5).map((subject: any) => (
                  <div key={subject.id} className="py-2 border-b last:border-0">
                    <span className="font-medium">{subject.nome}</span>
                  </div>
                ))}
                {!subjects?.length && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma disciplina cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
