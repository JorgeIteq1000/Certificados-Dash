import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { categorizeDelinquency } from '../lib/dataProcessor';

const DisciplineVsPayments = ({ data }) => {
  const scatterData = data
    .filter(item => 
      item["Disciplinas_Percentual"] !== 'NA' && 
      item["Cobranças_Percentual"] !== 'NA'
    )
    .map(item => ({
      disciplinas: item["Disciplinas_Percentual"],
      cobrancas: item["Cobranças_Percentual"],
      nome: item.Nome,
      curso: item.Curso,
      delinquencyCategory: categorizeDelinquency(item["Cobranças_Percentual"])
    }));

  const getColor = (category) => {
    switch (category) {
      case 'Em dia': return '#7FB77E';
      case 'Atraso leve': return '#F5C96B';
      case 'Atraso médio': return '#E57373';
      case 'Inadimplente grave': return '#D32F2F';
      default: return '#A8D0DB';
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-[#1F2933]">{data.nome}</p>
          <p className="text-sm text-[#1F2933]/70">Curso: {data.curso}</p>
          <p className="text-sm text-[#1F2933]/70">
            Disciplinas: {data.disciplinas.toFixed(1)}%
          </p>
          <p className="text-sm text-[#1F2933]/70">
            Pagamentos: {data.cobrancas.toFixed(1)}%
          </p>
          <p className="text-sm text-[#1F2933]/70">
            Status: {data.delinquencyCategory}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1F2933]">
          Progresso de Disciplinas vs Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={scatterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number" 
              dataKey="disciplinas" 
              name="Disciplinas (%)"
              stroke="#6B7280"
              fontSize={12}
              domain={[0, 100]}
            />
            <YAxis 
              type="number" 
              dataKey="cobrancas" 
              name="Pagamentos (%)"
              stroke="#6B7280"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={scatterData} 
              fill={(entry) => getColor(entry.delinquencyCategory)}
              shape={(props) => {
                const { cx, cy, payload } = props;
                const color = getColor(payload.delinquencyCategory);
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill={color} 
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.7}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7FB77E] rounded-full"></div>
            <span className="text-[#1F2933]/70">Em dia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F5C96B] rounded-full"></div>
            <span className="text-[#1F2933]/70">Atraso leve</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#E57373] rounded-full"></div>
            <span className="text-[#1F2933]/70">Atraso médio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#D32F2F] rounded-full"></div>
            <span className="text-[#1F2933]/70">Inadimplente grave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisciplineVsPayments;

