import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateCertificateTimeline } from '../lib/dataProcessor';

const CertificateTimeline = ({ data }) => {
  const timeline30d = calculateCertificateTimeline(data, 30);
  
  const chartData = Object.entries(timeline30d)
    .map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      digital: counts.digital,
      impresso: counts.impresso,
      total: counts.digital + counts.impresso
    }))
    .reverse(); // Reverse to show chronological order

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1F2933]">
          Solicitações de Certificados (30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="digital" 
              stroke="#3B8EA5" 
              strokeWidth={2}
              name="Digital"
              dot={{ fill: '#3B8EA5', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="impresso" 
              stroke="#7FB77E" 
              strokeWidth={2}
              name="Impresso"
              dot={{ fill: '#7FB77E', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CertificateTimeline;

