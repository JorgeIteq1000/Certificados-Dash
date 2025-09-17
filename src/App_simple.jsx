import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setData([
        { nome: 'João', curso: 'Engenharia' },
        { nome: 'Maria', curso: 'Administração' }
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#3B8EA5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1F2933]">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1F2933] mb-6">Dashboard Certificados</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Dados Carregados</h2>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="p-3 bg-[#F5F7F9] rounded">
                <p><strong>Nome:</strong> {item.nome}</p>
                <p><strong>Curso:</strong> {item.curso}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

