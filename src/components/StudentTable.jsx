import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Eye } from 'lucide-react';
import { categorizeDelinquency } from '../lib/dataProcessor';
import StudentDetailPanel from './StudentDetailPanel';

const StudentTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(student => 
    student.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.CPF?.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status) => {
    if (status === 1) return '✅';
    if (status === 0) return '❌';
    return '⚠️';
  };

  const getDelinquencyColor = (category) => {
    switch (category) {
      case 'Em dia': return 'text-[#7FB77E]';
      case 'Atraso leve': return 'text-[#F5C96B]';
      case 'Atraso médio': return 'text-[#E57373]';
      case 'Inadimplente grave': return 'text-[#D32F2F]';
      default: return 'text-[#A8D0DB]';
    }
  };

  const handleViewStudent = (student) => {
    console.log('log: Abrindo detalhes para o aluno:', student.Nome);
    setSelectedStudent(student);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    console.log('log: Fechando painel de detalhes.');
    setIsDetailPanelOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1F2933]">
          Lista de Estudantes
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1F2933]/50" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">Nome</th>
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">CPF</th>
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">Curso</th>
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">Situação</th>
                <th className="text-left py-3 px-2 font-semibold text-[#1F2933]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((student, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-[#1F2933]">{student.Nome}</td>
                  <td className="py-3 px-2 text-[#1F2933]/70">{student.CPF}</td>
                  <td className="py-3 px-2 text-[#1F2933]/70">{student.Curso}</td>
                  <td className="py-3 px-2 text-[#1F2933]/70">{student["Status Inscrição"]}</td>
                  <td className={`py-3 px-2 font-medium ${getDelinquencyColor(categorizeDelinquency(student["Cobranças_Percentual"]))}`}>
                    {categorizeDelinquency(student["Cobranças_Percentual"])}
                  </td>
                  <td className="py-3 px-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-[#1F2933]/70">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
        
        {selectedStudent && (
          <StudentDetailPanel 
            student={selectedStudent} 
            open={isDetailPanelOpen}
            onClose={handleCloseDetailPanel} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StudentTable;