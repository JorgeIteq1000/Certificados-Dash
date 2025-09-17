import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Download, Filter, X } from 'lucide-react';

const FilterPanel = ({ data, filters, onFiltersChange, onExportPDF, onExportExcel }) => {
  const uniqueCourses = [...new Set(data.map(item => item.Curso).filter(Boolean))];
  const uniqueTurmas = [...new Set(data.map(item => item.Turma).filter(Boolean))];
  const uniqueStatuses = [...new Set(data.map(item => item["Status Inscrição"]).filter(Boolean))];
  const uniqueCertTypes = [
    ...new Set([
      ...data.map(item => item["Tipo Cert. Digital"]).filter(Boolean),
      ...data.map(item => item["Tipo Cert. Impresso"]).filter(Boolean)
    ])
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      curso: '',
      turma: '',
      statusInscricao: '',
      tipoCertificado: '',
      dateRange: { start: null, end: null }
    });
  };

  const hasActiveFilters = filters.curso || filters.turma || filters.statusInscricao || filters.tipoCertificado;

  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#1F2933] flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-[#E57373] border-[#E57373] hover:bg-[#E57373]/10"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="text-[#3B8EA5] border-[#3B8EA5] hover:bg-[#3B8EA5]/10"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              className="text-[#7FB77E] border-[#7FB77E] hover:bg-[#7FB77E]/10"
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Curso Filter */}
          <div>
            <label className="text-sm font-medium text-[#1F2933] mb-2 block">Curso</label>
            <Select value={filters.curso || 'all'} onValueChange={(value) => handleFilterChange('curso', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {uniqueCourses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Turma Filter */}
          <div>
            <label className="text-sm font-medium text-[#1F2933] mb-2 block">Turma</label>
            <Select value={filters.turma || 'all'} onValueChange={(value) => handleFilterChange('turma', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {uniqueTurmas.map(turma => (
                  <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Inscrição Filter */}
          <div>
            <label className="text-sm font-medium text-[#1F2933] mb-2 block">Status Inscrição</label>
            <Select value={filters.statusInscricao || 'all'} onValueChange={(value) => handleFilterChange('statusInscricao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo Certificado Filter */}
          <div>
            <label className="text-sm font-medium text-[#1F2933] mb-2 block">Tipo Certificado</label>
            <Select value={filters.tipoCertificado || 'all'} onValueChange={(value) => handleFilterChange('tipoCertificado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {uniqueCertTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium text-[#1F2933] mb-2 block">Período</label>
            <div className="flex gap-1">
              <Input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="text-xs"
              />
              <Input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-[#A8D0DB]/20 rounded-lg">
            <p className="text-sm text-[#1F2933]/70">
              Filtros ativos: {' '}
              {filters.curso && <span className="inline-block bg-[#3B8EA5] text-white px-2 py-1 rounded text-xs mr-1">Curso: {filters.curso}</span>}
              {filters.turma && <span className="inline-block bg-[#3B8EA5] text-white px-2 py-1 rounded text-xs mr-1">Turma: {filters.turma}</span>}
              {filters.statusInscricao && <span className="inline-block bg-[#3B8EA5] text-white px-2 py-1 rounded text-xs mr-1">Status: {filters.statusInscricao}</span>}
              {filters.tipoCertificado && <span className="inline-block bg-[#3B8EA5] text-white px-2 py-1 rounded text-xs mr-1">Certificado: {filters.tipoCertificado}</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;

