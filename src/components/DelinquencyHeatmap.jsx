import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { categorizeDelinquency } from '../lib/dataProcessor';

const DelinquencyHeatmap = ({ data }) => {
  // Group by Course and Turma
  const groupedData = {};
  
  data.forEach(item => {
    const course = item.Curso || 'Sem Curso';
    const turma = item.Turma || 'Sem Turma';
    const key = `${course} - ${turma}`;
    
    if (!groupedData[key]) {
      groupedData[key] = {
        name: key,
        course: course,
        turma: turma,
        total: 0,
        inadimplentes: 0
      };
    }
    
    groupedData[key].total++;
    const delinquencyCategory = categorizeDelinquency(item["Cobranças_Percentual"]);
    if (delinquencyCategory !== 'Em dia' && delinquencyCategory !== 'NA') {
      groupedData[key].inadimplentes++;
    }
  });

  // Convert to treemap format
  const treemapData = Object.values(groupedData).map(group => ({
    name: group.name,
    size: group.total,
    inadimplencyRate: group.total > 0 ? (group.inadimplentes / group.total) * 100 : 0,
    inadimplentes: group.inadimplentes,
    total: group.total
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-[#1F2933]">{data.name}</p>
          <p className="text-sm text-[#1F2933]/70">
            Total: {data.total} alunos
          </p>
          <p className="text-sm text-[#1F2933]/70">
            Inadimplentes: {data.inadimplentes} ({data.inadimplencyRate.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const getColor = (inadimplencyRate) => {
    if (inadimplencyRate === 0) return '#7FB77E'; // Green
    if (inadimplencyRate < 20) return '#F5C96B'; // Yellow
    if (inadimplencyRate < 50) return '#E57373'; // Light Red
    return '#D32F2F'; // Dark Red
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1F2933]">
          Inadimplência por Curso e Turma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            strokeWidth={2}
            content={({ root, depth, x, y, width, height, index, payload, colors, name }) => {
              if (depth === 1) {
                const color = getColor(payload.inadimplencyRate);
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: color,
                        stroke: "#fff",
                        strokeWidth: 2,
                        strokeOpacity: 1,
                      }}
                    />
                    {width > 60 && height > 40 && (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {name}
                      </text>
                    )}
                  </g>
                );
              }
            }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7FB77E] rounded"></div>
            <span className="text-[#1F2933]/70">0% Inadimplência</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F5C96B] rounded"></div>
            <span className="text-[#1F2933]/70">&lt;20% Inadimplência</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#E57373] rounded"></div>
            <span className="text-[#1F2933]/70">20-50% Inadimplência</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#D32F2F] rounded"></div>
            <span className="text-[#1F2933]/70">&gt;50% Inadimplência</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DelinquencyHeatmap;

