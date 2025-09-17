import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateEnrollmentStatusDistribution, calculateDelinquencyDistribution } from '../lib/dataProcessor';

const StatusDistribution = ({ data }) => {
  const enrollmentDistribution = calculateEnrollmentStatusDistribution(data);
  const delinquencyDistribution = calculateDelinquencyDistribution(data);
  
  // Combine data for stacked bar chart
  const chartData = Object.keys(enrollmentDistribution).map(status => {
    const statusData = data.filter(item => item["Status Inscrição"] === status);
    const statusDelinquency = calculateDelinquencyDistribution(statusData);
    
    return {
      status: status,
      'Em dia': statusDelinquency['Em dia'] || 0,
      'Atraso leve': statusDelinquency['Atraso leve'] || 0,
      'Atraso médio': statusDelinquency['Atraso médio'] || 0,
      'Inadimplente grave': statusDelinquency['Inadimplente grave'] || 0
    };
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1F2933]">
          Status de Inscrição vs Situação Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="status" 
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, '']}
            />
            <Legend />
            <Bar dataKey="Em dia" stackId="a" fill="#7FB77E" name="Em dia" />
            <Bar dataKey="Atraso leve" stackId="a" fill="#F5C96B" name="Atraso leve" />
            <Bar dataKey="Atraso médio" stackId="a" fill="#E57373" name="Atraso médio" />
            <Bar dataKey="Inadimplente grave" stackId="a" fill="#E57373" name="Inadimplente grave" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;

