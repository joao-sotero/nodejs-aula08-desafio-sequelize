import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Grades() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unidade, setUnidade] = useState('');
  const [teste, setTeste] = useState('');
  const [prova, setProva] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await api.get('/grades');
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

  // Busca disciplinas filtradas pela turma do aluno selecionado
  const selectedStudent = students?.find((s: any) => s.id === parseInt(studentId));
  const { data: subjects } = useQuery({
    queryKey: ['subjects', selectedStudent?.classId],
    queryFn: async () => {
      const params = selectedStudent?.classId ? `?classId=${selectedStudent.classId}` : '';
      const response = await api.get(`/subjects${params}`);
      return response.data;
    },
    enabled: !editingGrade, // Só busca ao criar nova nota
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/grades', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Nota lançada com sucesso!' });
      resetForm();
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      toast({
        variant: 'destructive',
        title: 'Erro ao lançar nota',
        description: errorData?.details?.mensagem || errorData?.error || 'Erro desconhecido',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/grades/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Nota atualizada com sucesso!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar nota',
        description: error.response?.data?.error,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/grades/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Nota deletada com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar nota',
        description: error.response?.data?.error,
      });
    },
  });

  const resetForm = () => {
    setStudentId('');
    setSubjectId('');
    setUnidade('');
    setTeste('');
    setProva('');
    setEditingGrade(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      studentId: parseInt(studentId),
      subjectId: parseInt(subjectId),
      unidade: parseInt(unidade),
      teste: parseFloat(teste),
      prova: parseFloat(prova),
    };
    
    if (editingGrade) {
      updateMutation.mutate({ id: editingGrade.id, data: { teste: data.teste, prova: data.prova } });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setTeste(grade.teste.toString());
    setProva(grade.prova.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta nota?')) {
      deleteMutation.mutate(id);
    }
  };

  const calculateMedia = (teste: number, prova: number) => {
    return ((teste + prova) / 2).toFixed(2);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas</h1>
            <p className="text-muted-foreground mt-1">Gerencie as notas dos alunos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Lançar Nota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGrade ? 'Editar Nota' : 'Lançar Nota'}</DialogTitle>
                <DialogDescription>
                  {editingGrade ? 'Atualize as notas do aluno' : 'Preencha os dados para lançar uma nova nota'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingGrade && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Aluno</Label>
                      <Select 
                        value={studentId} 
                        onValueChange={(value) => {
                          setStudentId(value);
                          setSubjectId(''); // Limpa a disciplina ao trocar de aluno
                        }} 
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um aluno" />
                        </SelectTrigger>
                        <SelectContent>
                          {students?.map((student: any) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.nome} - {student.class?.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectId">Disciplina</Label>
                      <Select 
                        value={subjectId} 
                        onValueChange={setSubjectId} 
                        required
                        disabled={!studentId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !studentId 
                              ? "Selecione um aluno primeiro" 
                              : subjects?.length === 0
                              ? "Nenhuma disciplina vinculada"
                              : "Selecione uma disciplina"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {studentId && subjects?.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          A turma deste aluno não possui disciplinas vinculadas
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade</Label>
                      <Select value={unidade} onValueChange={setUnidade} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1ª Unidade</SelectItem>
                          <SelectItem value="2">2ª Unidade</SelectItem>
                          <SelectItem value="3">3ª Unidade</SelectItem>
                          <SelectItem value="4">4ª Unidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teste">Nota do Teste (0-10)</Label>
                    <Input
                      id="teste"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={teste}
                      onChange={(e) => setTeste(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prova">Nota da Prova (0-10)</Label>
                    <Input
                      id="prova"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={prova}
                      onChange={(e) => setProva(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingGrade ? 'Atualizar' : 'Lançar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : !grades?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma nota lançada. Clique em "Lançar Nota" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Teste</TableHead>
                  <TableHead>Prova</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade: any) => {
                  const teste = parseFloat(grade.teste);
                  const prova = parseFloat(grade.prova);
                  const media = parseFloat(calculateMedia(grade.teste, grade.prova));
                  return (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.student?.nome}</TableCell>
                      <TableCell>{grade.subject?.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grade.unidade}ª Unidade</Badge>
                      </TableCell>
                      <TableCell>{teste.toFixed(2)}</TableCell>
                      <TableCell>{prova.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={media >= 7 ? 'default' : media >= 5 ? 'secondary' : 'destructive'}>
                          {media.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(grade)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(grade.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
