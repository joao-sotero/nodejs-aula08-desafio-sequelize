import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';

export default function ReportCards() {
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    },
  });

  const { data: boletim, isLoading } = useQuery({
    queryKey: ['boletim', selectedStudent],
    queryFn: async () => {
      const response = await api.get(`/boletim/${selectedStudent}`);
      return response.data;
    },
    enabled: !!selectedStudent,
  });

  const getStatusColor = (status: string) => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Boletins</h1>
          <p className="text-muted-foreground mt-1">Visualize os boletins dos alunos</p>
        </div>

        <div className="max-w-md">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
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

        {selectedStudent && (
          <>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando boletim...</div>
            ) : boletim ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Aluno</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{boletim.student?.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Turma</p>
                        <p className="font-medium">{boletim.student?.class?.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status Geral</p>
                        <Badge variant={getStatusColor(boletim.statusGeral)}>
                          {boletim.statusGeral}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disciplinas Aprovadas</p>
                        <p className="font-medium">
                          {boletim.disciplinasAprovadas} / {boletim.totalDisciplinas}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {boletim.disciplines?.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notas por Disciplina</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Disciplina</TableHead>
                            <TableHead>1ª Un.</TableHead>
                            <TableHead>2ª Un.</TableHead>
                            <TableHead>3ª Un.</TableHead>
                            <TableHead>4ª Un.</TableHead>
                            <TableHead>Média Final</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {boletim.disciplines.map((discipline: any) => {
                            const gradesByUnit = discipline.grades.reduce((acc: any, g: any) => {
                              acc[g.unidade] = g.media;
                              return acc;
                            }, {});

                            return (
                              <TableRow key={discipline.subjectId}>
                                <TableCell className="font-medium">
                                  {discipline.subjectName}
                                </TableCell>
                                <TableCell>
                                  {gradesByUnit[1] ? gradesByUnit[1].toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>
                                  {gradesByUnit[2] ? gradesByUnit[2].toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>
                                  {gradesByUnit[3] ? gradesByUnit[3].toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>
                                  {gradesByUnit[4] ? gradesByUnit[4].toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>
                                  {discipline.mediaFinal !== null ? (
                                    <span className="font-semibold">
                                      {discipline.mediaFinal.toFixed(2)}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getStatusColor(discipline.status)}>
                                    {discipline.status}
                                  </Badge>
                                  {discipline.unidadesFaltantes?.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Faltam: {discipline.unidadesFaltantes.join(', ')}ª unidade(s)
                                    </p>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {boletim.message || 'Nenhuma nota lançada para este aluno.'}
                    </CardContent>
                  </Card>
                )}

                {boletim.disciplinasRecuperacao?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Disciplinas em Recuperação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {boletim.disciplinasRecuperacao.map((disc: string, idx: number) => (
                          <li key={idx}>{disc}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Não foi possível carregar o boletim
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
