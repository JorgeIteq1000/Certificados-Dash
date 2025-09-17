import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchData, normalizeData, calculateKPIs, calculateStatusMetrics, calculateDelinquencyDistribution, calculateEnrollmentStatusDistribution, calculateDisciplineProgress, calculateCertificateTimeline } from './lib/dataProcessor';
import { exportToPDF, exportToExcel } from './lib/exportUtils';
import KPICards from './components/KPICards';
import CertificateTimeline from './components/CertificateTimeline';
import StatusDistribution from './components/StatusDistribution';
import DelinquencyHeatmap from './components/DelinquencyHeatmap';
import DisciplineVsPayments from './components/DisciplineVsPayments';
import StudentTable from './components/StudentTable';
import StatusCounters from './components/StatusCounters';
import FilterPanel from './components/FilterPanel';
import { Button } from './components/ui/button';
import { RefreshCw } from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [kpis, setKPIs] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    curso: '',
    turma: '',
    statusInscricao: '',
    tipoCertificado: '',
    dateRange: { start: null, end: null }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const rawData = await fetchData();
      const normalized = normalizeData(rawData);
      setData(rawData);
      setNormalizedData(normalized);
      
      const calculatedKPIs = calculateKPIs(normalized);
      setKPIs(calculatedKPIs);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      loadData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleForceRefresh = () => {
    loadData();
  };

  const applyFilters = (data) => {
    return data.filter(item => {
      if (filters.curso && item.Curso !== filters.curso) return false;
      if (filters.turma && item.Turma !== filters.turma) return false;
      if (filters.statusInscricao && item["Status Inscrição"] !== filters.statusInscricao) return false;
      if (filters.tipoCertificado && 
          item["Tipo Cert. Digital"] !== filters.tipoCertificado && 
          item["Tipo Cert. Impresso"] !== filters.tipoCertificado) return false;
      
      // Date range filter
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        const itemStartDate = item["Data Início"] ? new Date(item["Data Início"]) : null;
        
        if (startDate && itemStartDate && itemStartDate < startDate) return false;
        if (endDate && itemStartDate && itemStartDate > endDate) return false;
      }
      
      return true;
    });
  };

  const filteredData = applyFilters(normalizedData);
  const filteredKPIs = calculateKPIs(filteredData);

  const handleExportPDF = () => {
    exportToPDF(filteredData, filteredKPIs);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, filteredKPIs);
  };

  if (loading && normalizedData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#3B8EA5]" />
          <p className="text-[#1F2933]">Carregando dados...</p>
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

        {/* Filters */}
        <FilterPanel 
          data={normalizedData}
          filters={filters}
          onFiltersChange={setFilters}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        {/* KPI Cards */}
        <KPICards kpis={filteredKPIs} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CertificateTimeline data={filteredData} />
          <StatusDistribution data={filteredData} />
          <DelinquencyHeatmap data={filteredData} />
          <DisciplineVsPayments data={filteredData} />
        </div>

        {/* Status Counters */}
        <StatusCounters data={filteredData} />

        {/* Student Table */}
        <StudentTable data={filteredData} />
      </div>
    </div>
  );
}

export default App;


