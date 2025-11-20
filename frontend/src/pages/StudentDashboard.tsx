import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';

interface Grade {
  unidade: number;
  teste: number;
  prova: number;
  media: number;
}

interface Discipline {
  subjectId: number;
  subjectName: string;
  grades: Grade[];
  mediaFinal: number | null;
  status: string;
  notaRecuperacao?: number | null;
  unidadesFaltantes?: number[];
}

interface Boletim {
  student: {
    id: number;
    nome: string;
    class: {
      nome: string;
    };
  };
  disciplines: Discipline[];
  statusGeral: string;
  totalDisciplinas: number;
  disciplinasAprovadas: number;
  disciplinasRecuperacao: string[];
  message?: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [boletim, setBoletim] = useState<Boletim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoletim();
  }, []);

  const loadBoletim = async () => {
    try {
      const response = await api.get('/boletim/me');
      setBoletim(response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar boletim',
        description: error.response?.data?.error || 'Não foi possível carregar suas notas.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSituationColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'default';
      case 'Reprovado':
        return 'destructive';
      case 'Incompleto':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando seu boletim...</p>
        </div>
      </div>
    );
  }

  if (!boletim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Boletim não encontrado</CardTitle>
            <CardDescription>Não foi possível carregar suas notas.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Meu Boletim</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), {boletim.student.nome}!
          </p>
        </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turma</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boletim.student.class.nome}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boletim.totalDisciplinas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boletim.disciplinasAprovadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Situação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getSituationColor(boletim.statusGeral)}>
              {boletim.statusGeral}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Notas por Disciplina */}
      <div className="space-y-4">
        {boletim.disciplines.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                {boletim.message || 'Nenhuma nota cadastrada ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          boletim.disciplines.map((discipline) => (
            <Card key={discipline.subjectId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{discipline.subjectName}</CardTitle>
                    <CardDescription>
                      {discipline.mediaFinal !== null ? (
                        <>Média Final: {discipline.mediaFinal.toFixed(2)}</>
                      ) : (
                        <>Incompleto - Faltam unidades: {discipline.unidadesFaltantes?.join(', ')}</>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={getSituationColor(discipline.status)}>
                    {discipline.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Teste</TableHead>
                      <TableHead>Prova</TableHead>
                      <TableHead>Média da Unidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discipline.grades.map((grade) => (
                      <TableRow key={`${discipline.subjectId}-${grade.unidade}`}>
                        <TableCell>
                          <Badge variant="outline">{grade.unidade}ª Unidade</Badge>
                        </TableCell>
                        <TableCell>{parseFloat(String(grade.teste)).toFixed(2)}</TableCell>
                        <TableCell>{parseFloat(String(grade.prova)).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grade.media >= 7
                                ? 'default'
                                : grade.media >= 5
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {parseFloat(String(grade.media)).toFixed(2)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </Layout>
  );
}
