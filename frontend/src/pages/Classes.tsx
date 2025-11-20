import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';

export default function Classes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [managingClassSubjects, setManagingClassSubjects] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [nome, setNome] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes, isLoading } = useQuery({
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

  const { data: classDetails } = useQuery({
    queryKey: ['class', managingClassSubjects?.id],
    queryFn: async () => {
      if (!managingClassSubjects?.id) return null;
      const response = await api.get(`/classes/${managingClassSubjects.id}`);
      return response.data;
    },
    enabled: !!managingClassSubjects?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: { nome: string }) => api.post('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Turma criada com sucesso!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar turma',
        description: error.response?.data?.error,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nome: string } }) =>
      api.put(`/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Turma atualizada com sucesso!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar turma',
        description: error.response?.data?.error,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Turma deletada com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar turma',
        description: error.response?.data?.error || error.response?.data?.details,
      });
    },
  });

  const updateSubjectsMutation = useMutation({
    mutationFn: ({ classId, subjectIds }: { classId: number; subjectIds: number[] }) =>
      api.post(`/classes/${classId}/subjects`, { subjectIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', managingClassSubjects?.id] });
      toast({ title: 'Disciplinas atualizadas com sucesso!' });
      setIsSubjectsDialogOpen(false);
      setManagingClassSubjects(null);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar disciplinas',
        description: error.response?.data?.error,
      });
    },
  });

  const resetForm = () => {
    setNome('');
    setEditingClass(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: { nome } });
    } else {
      createMutation.mutate({ nome });
    }
  };

  const handleEdit = (classe: any) => {
    setEditingClass(classe);
    setNome(classe.nome);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta turma?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleManageSubjects = (classe: any) => {
    setManagingClassSubjects(classe);
    setIsSubjectsDialogOpen(true);
  };

  const handleToggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSaveSubjects = () => {
    if (!managingClassSubjects) return;
    updateSubjectsMutation.mutate({
      classId: managingClassSubjects.id,
      subjectIds: selectedSubjects,
    });
  };

  // Quando abrir o dialog, carregar as disciplinas já vinculadas
  const handleOpenSubjectsDialog = (classe: any) => {
    handleManageSubjects(classe);
  };

  // Atualizar selectedSubjects quando classDetails carregar
  useEffect(() => {
    if (classDetails?.subjects) {
      setSelectedSubjects(classDetails.subjects.map((s: any) => s.id));
    }
  }, [classDetails]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Turmas</h1>
            <p className="text-muted-foreground mt-1">Gerencie as turmas da escola</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
                <DialogDescription>
                  {editingClass ? 'Atualize os dados da turma' : 'Preencha os dados para criar uma nova turma'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Turma</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: 1º Ano A"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingClass ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : !classes?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma turma cadastrada. Clique em "Nova Turma" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número de Alunos</TableHead>
                  <TableHead>Disciplinas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classe: any) => (
                  <TableRow key={classe.id}>
                    <TableCell className="font-medium">{classe.nome}</TableCell>
                    <TableCell>{classe.studentCount || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSubjectsDialog(classe)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Gerenciar
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(classe)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(classe.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Dialog de Gerenciar Disciplinas */}
        <Dialog open={isSubjectsDialogOpen} onOpenChange={(open) => {
          setIsSubjectsDialogOpen(open);
          if (!open) {
            setManagingClassSubjects(null);
            setSelectedSubjects([]);
          } else if (classDetails?.subjects) {
            setSelectedSubjects(classDetails.subjects.map((s: any) => s.id));
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Disciplinas - {managingClassSubjects?.nome}</DialogTitle>
              <DialogDescription>
                Selecione as disciplinas que fazem parte desta turma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {classDetails?.subjects && classDetails.subjects.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2">Disciplinas Vinculadas Atualmente:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {classDetails.subjects.map((subject: any) => (
                      <Badge key={subject.id} variant="secondary">
                        {subject.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {subjects && subjects.length > 0 ? (
                  <div className="space-y-3">
                    {subjects.map((subject: any) => (
                      <div key={subject.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded">
                        <Checkbox
                          id={`subject-${subject.id}`}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={() => handleToggleSubject(subject.id)}
                        />
                        <Label
                          htmlFor={`subject-${subject.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {subject.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma disciplina cadastrada. Cadastre disciplinas primeiro.
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSubjectsDialogOpen(false);
                    setManagingClassSubjects(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveSubjects}
                  disabled={updateSubjectsMutation.isPending}
                >
                  {updateSubjectsMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
