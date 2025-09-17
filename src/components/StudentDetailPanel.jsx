import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import { categorizeDelinquency } from '../lib/dataProcessor';

const StudentDetailPanel = ({ student, open, onClose }) => {
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

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1F2933]">{student.Nome}</DialogTitle>
           <DialogClose asChild>
              <Button variant="outline" size="sm">✕</Button>
          </DialogClose>
        </DialogHeader>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[#1F2933] mb-2">Informações Básicas</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">CPF:</span> {student.CPF}</p>
                <p><span className="font-medium">Curso:</span> {student.Curso}</p>
                <p><span className="font-medium">Turma:</span> {student.Turma}</p>
                <p><span className="font-medium">Status:</span> {student["Status Inscrição"]}</p>
                <p><span className="font-medium">Data Início:</span> {student["Data Início"] ? new Date(student["Data Início"]).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1F2933] mb-2">Status dos Pilares</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Financeiro:</span> {getStatusIcon(student.Financeiro)}</p>
                <p><span className="font-medium">Avaliação:</span> {getStatusIcon(student.Avaliação)}</p>
                <p><span className="font-medium">Tempo mínimo:</span> {getStatusIcon(student["Tempo mínimo"])}</p>
                <p><span className="font-medium">Documentos:</span> {getStatusIcon(student.Documentos)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1F2933] mb-2">Progresso</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Disciplinas:</span> {student.Disciplinas}</p>
                <p><span className="font-medium">Cobranças:</span> {student.Cobranças}</p>
                <p>
                  <span className="font-medium">Situação Financeira:</span> 
                  <span className={`ml-1 ${getDelinquencyColor(categorizeDelinquency(student["Cobranças_Percentual"]))}`}>
                    {categorizeDelinquency(student["Cobranças_Percentual"])}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1F2933] mb-2">Certificados</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Digital:</p>
                  <p>Data Solicitação: {student["Data Solic. Digital"] ? new Date(student["Data Solic. Digital"]).toLocaleDateString() : 'Não Solicitado'}</p>
                  <p>Tipo: {student["Tipo Cert. Digital"]}</p>
                  <p>Status: {student["Status Cert. Digital"]}</p>
                </div>
                <div>
                  <p className="font-medium">Impresso:</p>
                  <p>Data Solicitação: {student["Data Solic. Impresso"] ? new Date(student["Data Solic. Impresso"]).toLocaleDateString() : 'Não Solicitado'}</p>
                  <p>Tipo: {student["Tipo Cert. Impresso"]}</p>
                  <p>Status: {student["Status Cert. Impresso"]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailPanel;