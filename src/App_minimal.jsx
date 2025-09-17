import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchData, normalizeData, calculateCertificateTimeline } from './lib/dataProcessor';
import CertificateTimeline from './components/CertificateTimeline';
import { RefreshCw } from 'lucide-react';

function App() {
  const [normalizedData, setNormalizedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await fetchData();
      const normalized = normalizeData(rawData);
      setNormalizedData(normalized);
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
        </div>
      </div>
    );
  }

  const certificateTimelineData = calculateCertificateTimeline(normalizedData);

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1F2933] mb-6">Dashboard Certificados - Teste de Gráfico</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Timeline de Certificados</h2>
          <CertificateTimeline data={normalizedData} />
        </div>
      </div>
    </div>
  );
}

export default App;

