import Papa from 'papaparse';

const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ25AYPgZEudDjhakxxgPNt4IjVlrKWmXzrjgcp7M95YPV23Iib4C7bQ8VAXi_AE49cIfg59Ie9z42X/pub?output=csv';
const LOCAL_DATA_URL = '/data.json';

export async function fetchData(forceRefresh = false) {
  const cacheKey = 'googleSheetData';
  
  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('log: Carregando dados do cache da sessão.');
      return Promise.resolve(JSON.parse(cachedData));
    }
  }

  try {
    console.log('log: Buscando dados do Google Sheets.');
    const response = await fetch(DATA_URL);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            console.log('log: Dados do Google Sheets carregados e cacheados.');
            sessionStorage.setItem(cacheKey, JSON.stringify(results.data)); // Salva no cache
            resolve(results.data);
          } else {
            console.log('log: Nenhum dado retornado do Google Sheets, usando dados locais.');
            fetchLocalData().then(resolve).catch(reject);
          }
        },
        error: (error) => {
          console.warn('log: Erro ao processar CSV do Google Sheets, usando dados locais:', error);
          fetchLocalData().then(resolve).catch(reject);
        },
      });
    });
  } catch (error) {
    console.warn('log: Erro ao buscar dados do Google Sheets, usando dados locais:', error);
    return fetchLocalData();
  }
}

async function fetchLocalData() {
  try {
    const response = await fetch(LOCAL_DATA_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados locais:', error);
    return [];
  }
}

export function normalizeData(data) {
  return data.map(item => {
    const newItem = { ...item };

    // Normalizar datas (DD/MM/YYYY ou YYYY-MM-DD)
    if (newItem['Data Início']) {
      newItem['Data Início'] = normalizeDate(newItem['Data Início']);
    }
    if (newItem['Data Solic. Digital']) {
      newItem['Data Solic. Digital'] = normalizeDate(newItem['Data Solic. Digital']);
    }
    if (newItem['Data Solic. Impresso']) {
      newItem['Data Solic. Impresso'] = normalizeDate(newItem['Data Solic. Impresso']);
    }

    // Normalizar campos Financeiro, Avaliação, Tempo mínimo, Documentos
    newItem['Financeiro'] = normalizeStatus(newItem['Financeiro']);
    newItem['Avaliação'] = normalizeStatus(newItem['Avaliação']);
    newItem['Tempo mínimo'] = normalizeStatus(newItem['Tempo mínimo']);
    newItem['Documentos'] = normalizeStatus(newItem['Documentos']);

    // Normalizar Disciplinas e Cobranças (X/Y para percentual)
    newItem['Disciplinas_Percentual'] = parseRatio(newItem['Disciplinas']);
    newItem['Cobranças_Percentual'] = parseRatio(newItem['Cobranças']);

    // Normalizar CPF para string
    if (newItem['CPF']) {
      newItem['CPF'] = String(newItem['CPF']);
    }

    return newItem;
  });
}

function normalizeDate(dateString) {
  if (!dateString || dateString === 'Não Solicitado') return null;
  const parts = String(dateString).split(/[-\/]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    if (p1.length === 4) { // YYYY-MM-DD
      return new Date(p1, p2 - 1, p3);
    } else { // DD/MM/YYYY
      return new Date(p3, p2 - 1, p1);
    }
  }
  return null;
}

function normalizeStatus(status) {
  if (typeof status !== 'string') return 'NA';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'ok') return 1;
  if (lowerStatus === 'x') return 0;
  if (lowerStatus === 'não encontrado') return 'NA';
  return 'NA'; // Default para outros valores
}

function parseRatio(ratioString) {
  if (typeof ratioString !== 'string' || !ratioString.includes('/')) return 'NA';
  const parts = ratioString.split('/');
  const numerator = parseInt(parts[0], 10);
  const denominator = parseInt(parts[1], 10);

  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return 'NA';
  }
  return (numerator / denominator) * 100;
}

export function calculateStatusMetrics(data, fields) {
  const metrics = {};
  fields.forEach(field => {
    const counts = { OK: 0, X: 0, NA: 0 };
    data.forEach(item => {
      if (item[field] === 1) counts.OK++;
      else if (item[field] === 0) counts.X++;
      else counts.NA++;
    });
    const total = data.length;
    metrics[field] = {
      OK: counts.OK,
      X: counts.X,
      NA: counts.NA,
      OK_Percent: total > 0 ? (counts.OK / total) * 100 : 0,
      X_Percent: total > 0 ? (counts.X / total) * 100 : 0,
      NA_Percent: total > 0 ? (counts.NA / total) * 100 : 0,
    };
  });
  return metrics;
}

export function categorizeDelinquency(paidRatio) {
  if (paidRatio === 'NA') return 'NA';
  if (paidRatio === 100) return 'Em dia';
  if (paidRatio >= 80 && paidRatio < 100) return 'Atraso leve';
  if (paidRatio >= 50 && paidRatio < 80) return 'Atraso médio';
  if (paidRatio < 50) return 'Inadimplente grave';
  return 'NA';
}

export function calculateKPIs(data) {
    const totalStudents = data.length;

    const delinquencyDistribution = calculateDelinquencyDistribution(data);
    const percentEmDia = delinquencyDistribution["Em dia"] || 0;
    const percentInadimplentes = (delinquencyDistribution["Atraso leve"] || 0) +
                                 (delinquencyDistribution["Atraso médio"] || 0) +
                                 (delinquencyDistribution["Inadimplente grave"] || 0);

    const { overallAverageProgress: avgDisciplineProgress } = calculateDisciplineProgress(data);

    const statusMetricsDocs = calculateStatusMetrics(data, ["Documentos"]);
    const percentDocsOK = statusMetricsDocs["Documentos"].OK_Percent || 0;

    const certTimeline30d = calculateCertificateTimeline(data, 30);
    const totalCertRequests30d = Object.values(certTimeline30d).reduce((sum, { digital, impresso }) => sum + digital + impresso, 0);

    return {
      totalStudents,
      percentEmDia,
      percentInadimplentes,
      avgDisciplineProgress,
      percentDocsOK,
      totalCertRequests30d,
    };
}

export function calculateDelinquencyDistribution(data) {
  const distribution = { 'Em dia': 0, 'Atraso leve': 0, 'Atraso médio': 0, 'Inadimplente grave': 0, 'NA': 0 };
  data.forEach(item => {
    const category = categorizeDelinquency(item["Cobranças_Percentual"]);
    if (distribution[category] !== undefined) {
      distribution[category]++;
    }
  });
  const total = data.length;
  return Object.keys(distribution).reduce((acc, key) => {
    acc[key] = total > 0 ? (distribution[key] / total) * 100 : 0;
    return acc;
  }, {});
}

export function calculateDisciplineProgress(data) {
    let totalDisciplineProgress = 0;
    let totalStudentsWithDisciplineProgress = 0;

    data.forEach(item => {
        const progress = item["Disciplinas_Percentual"];
        if (progress !== 'NA') {
            totalDisciplineProgress += progress;
            totalStudentsWithDisciplineProgress++;
        }
    });

    const overallAverageProgress = totalStudentsWithDisciplineProgress > 0 ? totalDisciplineProgress / totalStudentsWithDisciplineProgress : 0;
    return { overallAverageProgress };
}

export function calculateCertificateTimeline(data, days = 30) {
    const timeline = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        timeline[dateString] = { digital: 0, impresso: 0 };
    }

    data.forEach(item => {
        const digitalDate = item["Data Solic. Digital"];
        if (digitalDate instanceof Date) {
            const dateString = digitalDate.toISOString().split('T')[0];
            if (timeline[dateString]) {
                timeline[dateString].digital++;
            }
        }

        const impressoDate = item["Data Solic. Impresso"];
        if (impressoDate instanceof Date) {
            const dateString = impressoDate.toISOString().split('T')[0];
            if (timeline[dateString]) {
                timeline[dateString].impresso++;
            }
        }
    });
    return timeline;
}