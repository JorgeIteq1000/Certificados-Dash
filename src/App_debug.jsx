import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchData, normalizeData, calculateKPIs } from './lib/dataProcessor';
import { Button } from './components/ui/button';
import { RefreshCw } from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [kpis, setKPIs] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Iniciando carregamento de dados...');
      const rawData = await fetchData();
      console.log('Dados brutos carregados:', rawData);
      
      const normalized = normalizeData(rawData);
      console.log('Dados normalizados:', normalized);
      
      setData(rawData);
      setNormalizedData(normalized);
      
      const calculatedKPIs = calculateKPIs(normalized);
      console.log('KPIs calculados:', calculatedKPIs);
      
      setKPIs(calculatedKPIs);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleForceRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#3B8EA5]" />
          <p className="text-[#1F2933]">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro: {error}</p>
          <Button onClick={handleForceRefresh}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2933] mb-2">Dashboard Certificados</h1>
            <p className="text-[#1F2933]/70">
              Última atualização: {lastUpdated ? lastUpdated.toLocaleString() : 'Carregando...'}
            </p>
          </div>
          <Button 
            onClick={handleForceRefresh} 
            disabled={loading}
            className="bg-[#3B8EA5] hover:bg-[#3B8EA5]/90"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Forçar Atualização
          </Button>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Informações de Debug</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F5F7F9] rounded">
              <h3 className="font-semibold">Total de Registros</h3>
              <p className="text-2xl font-bold text-[#3B8EA5]">{normalizedData.length}</p>
            </div>
            <div className="p-4 bg-[#F5F7F9] rounded">
              <h3 className="font-semibold">Total de Alunos</h3>
              <p className="text-2xl font-bold text-[#3B8EA5]">{kpis.totalStudents || 0}</p>
            </div>
            <div className="p-4 bg-[#F5F7F9] rounded">
              <h3 className="font-semibold">% Em Dia</h3>
              <p className="text-2xl font-bold text-[#7FB77E]">{(kpis.percentEmDia || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Sample Data */}
        {normalizedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Primeiros Registros</h2>
            <div className="space-y-4">
              {normalizedData.slice(0, 3).map((item, index) => (
                <div key={index} className="p-4 bg-[#F5F7F9] rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>Nome:</strong> {item.Nome}</div>
                    <div><strong>CPF:</strong> {item.CPF}</div>
                    <div><strong>Curso:</strong> {item.Curso}</div>
                    <div><strong>Status:</strong> {item["Status Inscrição"]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

