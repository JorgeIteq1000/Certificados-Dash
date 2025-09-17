import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { calculateStatusMetrics } from '../lib/dataProcessor';

const StatusCounters = ({ data }) => {
  const statusFields = ['Financeiro', 'Avaliação', 'Tempo mínimo', 'Documentos'];
  const metrics = calculateStatusMetrics(data, statusFields);

  const getIcon = (type) => {
    switch (type) {
      case 'OK': return CheckCircle;
      case 'X': return XCircle;
      case 'NA': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'OK': return 'text-[#7FB77E]';
      case 'X': return 'text-[#E57373]';
      case 'NA': return 'text-[#F5C96B]';
      default: return 'text-[#A8D0DB]';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'OK': return 'bg-[#7FB77E]/20';
      case 'X': return 'bg-[#E57373]/20';
      case 'NA': return 'bg-[#F5C96B]/20';
      default: return 'bg-[#A8D0DB]/20';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Status dos Pilares</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusFields.map(field => (
          <Card key={field} className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1F2933]">
                {field}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['OK', 'X', 'NA'].map(status => {
                  const IconComponent = getIcon(status);
                  const count = metrics[field]?.[status] || 0;
                  const percent = metrics[field]?.[`${status}_Percent`] || 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${getBgColor(status)}`}>
                          <IconComponent className={`h-4 w-4 ${getColor(status)}`} />
                        </div>
                        <span className="text-sm font-medium text-[#1F2933]">
                          {status === 'OK' ? '✅ OK' : status === 'X' ? '❌ Pendente' : '⚠️ N/A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1F2933]">{count}</div>
                        <div className="text-xs text-[#1F2933]/70">{percent.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatusCounters;

