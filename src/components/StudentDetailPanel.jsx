import React from 'react';
import { Button } from './ui/button';
import { categorizeDelinquency } from '../lib/dataProcessor';

const StudentDetailPanel = ({ student, onClose }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[#1F2933]">{student.Nome}</h3>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[#1F2933] mb-2">Informações Básicas</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">CPF:</span> {student.CPF}</p>
                <p><span className="font-medium">Curso:</span> {student.Curso}</p>
                <p><span className="font-medium">Turma:</span> {student.Turma}</p>
                <p><span className="font-medium">Status:</span> {student["Status Inscrição"]}</p>
                <p><span className="font-medium">Data Início:</span> {student["Data Início"]}</p>
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
                  <p>Data Solicitação: {student["Data Solic. Digital"]}</p>
                  <p>Tipo: {student["Tipo Cert. Digital"]}</p>
                  <p>Status: {student["Status Cert. Digital"]}</p>
                </div>
                <div>
                  <p className="font-medium">Impresso:</p>
                  <p>Data Solicitação: {student["Data Solic. Impresso"]}</p>
                  <p>Tipo: {student["Tipo Cert. Impresso"]}</p>
                  <p>Status: {student["Status Cert. Impresso"]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPanel;


