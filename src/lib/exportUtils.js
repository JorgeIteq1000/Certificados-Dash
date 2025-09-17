import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { calculateKPIs, categorizeDelinquency } from './dataProcessor';

export const exportToPDF = (data, kpis) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Dashboard Certificados - Relatório', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
  doc.text(`Total de registros: ${data.length}`, 20, 40);
  
  // KPIs Section
  doc.setFontSize(16);
  doc.text('KPIs Principais', 20, 55);
  
  doc.setFontSize(12);
  let yPos = 65;
  doc.text(`Total de Alunos: ${kpis.totalStudents || 0}`, 20, yPos);
  yPos += 10;
  doc.text(`% Em Dia: ${(kpis.percentEmDia || 0).toFixed(1)}%`, 20, yPos);
  yPos += 10;
  doc.text(`Progresso Médio: ${(kpis.avgDisciplineProgress || 0).toFixed(1)}%`, 20, yPos);
  yPos += 10;
  doc.text(`Docs Completos: ${(kpis.percentDocsOK || 0).toFixed(1)}%`, 20, yPos);
  yPos += 10;
  doc.text(`Certificados (30d): ${kpis.totalCertRequests30d || 0}`, 20, yPos);
  
  // Student Table
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Lista de Estudantes', 20, yPos);
  
  const tableData = data.map(student => [
    student.Nome || '',
    student.CPF || '',
    student.Curso || '',
    student["Status Inscrição"] || '',
    categorizeDelinquency(student["Cobranças_Percentual"]),
    student.Disciplinas || '',
    student.Cobranças || ''
  ]);
  
  doc.autoTable({
    head: [['Nome', 'CPF', 'Curso', 'Status', 'Situação Financeira', 'Disciplinas', 'Cobranças']],
    body: tableData,
    startY: yPos + 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 142, 165] },
    margin: { top: 20 }
  });
  
  doc.save('dashboard-certificados-relatorio.pdf');
};

export const exportToExcel = (data, kpis) => {
  const workbook = XLSX.utils.book_new();
  
  // KPIs Sheet
  const kpisData = [
    ['KPI', 'Valor'],
    ['Total de Alunos', kpis.totalStudents || 0],
    ['% Em Dia', `${(kpis.percentEmDia || 0).toFixed(1)}%`],
    ['% Inadimplentes', `${(kpis.percentInadimplentes || 0).toFixed(1)}%`],
    ['Progresso Médio Disciplinas', `${(kpis.avgDisciplineProgress || 0).toFixed(1)}%`],
    ['% Docs Completos', `${(kpis.percentDocsOK || 0).toFixed(1)}%`],
    ['Certificados (7d)', kpis.totalCertRequests7d || 0],
    ['Certificados (30d)', kpis.totalCertRequests30d || 0],
    ['Certificados (90d)', kpis.totalCertRequests90d || 0],
    ['Última Atualização', new Date().toLocaleString('pt-BR')]
  ];
  
  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
  
  // Students Data Sheet
  const studentsData = data.map(student => ({
    'Nome': student.Nome || '',
    'CPF': student.CPF || '',
    'Curso': student.Curso || '',
    'Turma': student.Turma || '',
    'Status Inscrição': student["Status Inscrição"] || '',
    'Data Início': student["Data Início"] || '',
    'Financeiro': getStatusText(student.Financeiro),
    'Avaliação': getStatusText(student.Avaliação),
    'Tempo Mínimo': getStatusText(student["Tempo mínimo"]),
    'Documentos': getStatusText(student.Documentos),
    'Disciplinas': student.Disciplinas || '',
    'Disciplinas %': student["Disciplinas_Percentual"] !== 'NA' ? `${student["Disciplinas_Percentual"].toFixed(1)}%` : 'N/A',
    'Cobranças': student.Cobranças || '',
    'Cobranças %': student["Cobranças_Percentual"] !== 'NA' ? `${student["Cobranças_Percentual"].toFixed(1)}%` : 'N/A',
    'Situação Financeira': categorizeDelinquency(student["Cobranças_Percentual"]),
    'Data Solic. Digital': student["Data Solic. Digital"] || '',
    'Tipo Cert. Digital': student["Tipo Cert. Digital"] || '',
    'Status Cert. Digital': student["Status Cert. Digital"] || '',
    'Data Solic. Impresso': student["Data Solic. Impresso"] || '',
    'Tipo Cert. Impresso': student["Tipo Cert. Impresso"] || '',
    'Status Cert. Impresso': student["Status Cert. Impresso"] || ''
  }));
  
  const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Estudantes');
  
  XLSX.writeFile(workbook, 'dashboard-certificados-dados.xlsx');
};

const getStatusText = (status) => {
  if (status === 1) return 'OK';
  if (status === 0) return 'Pendente';
  return 'N/A';
};

