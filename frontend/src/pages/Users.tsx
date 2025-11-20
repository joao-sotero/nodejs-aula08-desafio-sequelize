import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Student {
  id: number;
  nome: string;
  class?: {
    id: number;
    nome: string;
  };
}

interface RegisterPayload {
  nome: string;
  email: string;
  password: string;
  role?: 'admin' | 'student';
  studentId?: number;
}

type ApiError = { response?: { data?: { error?: string } } };

export default function Users() {
  const { toast } = useToast();

  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const {
    data: students,
    isLoading: isLoadingStudents,
  } = useQuery<Student[]>({
    queryKey: ['students', 'for-user-creation'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    },
  });

  const selectedStudent = useMemo(
    () => students?.find((student) => student.id === Number(studentId)),
    [students, studentId]
  );

  const resetAdminForm = () => {
    setAdminNome('');
    setAdminEmail('');
    setAdminPassword('');
  };

  const resetStudentForm = () => {
    setStudentId('');
    setStudentEmail('');
    setStudentPassword('');
  };

  const createUserMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => api.post('/auth/register', payload),
    onSuccess: (_, variables) => {
      if (variables.role === 'student') {
        toast({
          title: 'Usuário do aluno criado com sucesso!',
          description: 'O aluno agora pode acessar o sistema com as novas credenciais.',
        });
        resetStudentForm();
      } else {
        toast({
          title: 'Usuário admin criado com sucesso!',
          description: 'O novo usuário já pode acessar o painel administrativo.',
        });
        resetAdminForm();
      }
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: error.response?.data?.error || 'Não foi possível concluir a operação.',
      });
    },
  });

  const handleCreateAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createUserMutation.mutate({
      nome: adminNome.trim(),
      email: adminEmail.trim(),
      password: adminPassword,
      role: 'admin',
    });
  };

  const handleCreateStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentId) {
      toast({
        variant: 'destructive',
        title: 'Selecione um aluno',
        description: 'É necessário escolher um aluno para vincular a conta.',
      });
      return;
    }

    if (!selectedStudent) {
      toast({
        variant: 'destructive',
        title: 'Aluno inválido',
        description: 'Não foi possível localizar o aluno selecionado.',
      });
      return;
    }

    createUserMutation.mutate({
      nome: selectedStudent.nome,
      email: studentEmail.trim(),
      password: studentPassword,
      role: 'student',
      studentId: selectedStudent.id,
    });
  };

  const isSubmittingAdmin = createUserMutation.isPending && createUserMutation.variables?.role === 'admin';
  const isSubmittingStudent = createUserMutation.isPending && createUserMutation.variables?.role === 'student';

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Cadastre novos usuários administradores e habilite contas de acesso para alunos já matriculados.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Novo usuário admin</CardTitle>
              <CardDescription>Crie uma conta administrativa com acesso completo ao painel.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateAdmin}>
                <div className="space-y-2">
                  <Label htmlFor="admin-nome">Nome completo</Label>
                  <Input
                    id="admin-nome"
                    value={adminNome}
                    onChange={(event) => setAdminNome(event.target.value)}
                    placeholder="Ex: Maria Oliveira"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="admin@escola.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="********"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingAdmin}>
                  {isSubmittingAdmin ? 'Criando usuário...' : 'Criar usuário admin'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conta para aluno</CardTitle>
              <CardDescription>Vincule um aluno existente a uma conta de acesso ao portal.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="text-muted-foreground">Carregando alunos cadastrados...</div>
              ) : !students?.length ? (
                <div className="text-muted-foreground">
                  Nenhum aluno disponível. Cadastre alunos antes de criar usuários vinculados.
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleCreateStudent}>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Aluno</Label>
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger id="studentId">
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.nome}{student.class ? ` - ${student.class.nome}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudent && (
                    <div className="space-y-2">
                      <Label>Aluno selecionado</Label>
                      <div className="rounded-md border bg-muted/50 p-3 text-sm">
                        <p className="font-medium">{selectedStudent.nome}</p>
                        <p className="text-muted-foreground">
                          {selectedStudent.class?.nome ? `Turma: ${selectedStudent.class.nome}` : 'Sem turma vinculada'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email do aluno</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
                      placeholder="aluno@escola.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Senha temporária</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentPassword}
                      onChange={(event) => setStudentPassword(event.target.value)}
                      placeholder="********"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmittingStudent}>
                    {isSubmittingStudent ? 'Criando usuário...' : 'Criar acesso para aluno'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
