import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, TrendingUp, BookOpen, FileCheck, Award } from 'lucide-react';

const KPICards = ({ kpis }) => {
  const kpiData = [
    {
      title: 'Total de Alunos',
      value: kpis.totalStudents || 0,
      icon: Users,
      color: 'text-[#3B8EA5]',
      bgColor: 'bg-[#A8D0DB]/20'
    },
    {
      title: '% Em Dia',
      value: `${(kpis.percentEmDia || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-[#7FB77E]',
      bgColor: 'bg-[#7FB77E]/20'
    },
    {
      title: 'Progresso Médio',
      value: `${(kpis.avgDisciplineProgress || 0).toFixed(1)}%`,
      icon: BookOpen,
      color: 'text-[#3B8EA5]',
      bgColor: 'bg-[#A8D0DB]/20'
    },
    {
      title: 'Docs Completos',
      value: `${(kpis.percentDocsOK || 0).toFixed(1)}%`,
      icon: FileCheck,
      color: 'text-[#7FB77E]',
      bgColor: 'bg-[#7FB77E]/20'
    },
    {
      title: 'Certificados (30d)',
      value: kpis.totalCertRequests30d || 0,
      icon: Award,
      color: 'text-[#F5C96B]',
      bgColor: 'bg-[#F5C96B]/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1F2933]/70">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1F2933]">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;

