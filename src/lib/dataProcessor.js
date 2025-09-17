import Papa from 'papaparse';

const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ25AYPgZEudDjhakxxgPNt4IjVlrKWmXzrjgcp7M95YPV23Iib4C7bQ8VAXi_AE49cIfg59Ie9z42X/pub?output=csv';
const LOCAL_DATA_URL = '/data.json';

export async function fetchData() {
  try {
    // Try to fetch from Google Sheets first
    const response = await fetch(DATA_URL);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            resolve(results.data);
          } else {
            // Fallback to local data
            fetchLocalData().then(resolve).catch(reject);
          }
        },
        error: (error) => {
          console.warn('Erro ao buscar dados do Google Sheets, usando dados locais:', error);
          fetchLocalData().then(resolve).catch(reject);
        },
      });
    });
  } catch (error) {
    console.warn('Erro ao buscar dados do Google Sheets, usando dados locais:', error);
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
  const parts = dateString.split(/[-\/]/);
  if (parts.length === 3) {
    // Assume DD/MM/YYYY or YYYY-MM-DD
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
    return 'NA'; // Tratar divisão por zero ou valores inválidos
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

export function calculateDelinquencyDistribution(data) {
  const distribution = { 'Em dia': 0, 'Atraso leve': 0, 'Atraso médio': 0, 'Inadimplente grave': 0, 'NA': 0 };
  data.forEach(item => {
    const category = categorizeDelinquency(item["Cobranças_Percentual"]);
    distribution[category]++;
  });
  const total = data.length;
  const result = {};
  for (const category in distribution) {
    result[category] = total > 0 ? (distribution[category] / total) * 100 : 0;
  }
  return result;
}

export function calculateEnrollmentStatusDistribution(data) {
  const distribution = {};
  data.forEach(item => {
    const status = item["Status Inscrição"];
    distribution[status] = (distribution[status] || 0) + 1;
  });
  const total = data.length;
  const result = {};
  for (const status in distribution) {
    result[status] = total > 0 ? (distribution[status] / total) * 100 : 0;
  }
  return result;
}

export function calculateDisciplineProgress(data) {
  const courseTurmaProgress = {}; // { "Curso - Turma": { totalProgress: 0, count: 0 } }
  let totalDisciplineProgress = 0;
  let totalStudentsWithDisciplineProgress = 0;

  data.forEach(item => {
    const course = item["Curso"];
    const turma = item["Turma"];
    const progress = item["Disciplinas_Percentual"];

    if (progress !== 'NA') {
      totalDisciplineProgress += progress;
      totalStudentsWithDisciplineProgress++;

      const key = `${course} - ${turma}`;
      if (!courseTurmaProgress[key]) {
        courseTurmaProgress[key] = { totalProgress: 0, count: 0 };
      }
      courseTurmaProgress[key].totalProgress += progress;
      courseTurmaProgress[key].count++;
    }
  });

  const averageProgressByCourseTurma = {};
  for (const key in courseTurmaProgress) {
    const { totalProgress, count } = courseTurmaProgress[key];
    averageProgressByCourseTurma[key] = count > 0 ? totalProgress / count : 0;
  }

  const overallAverageProgress = totalStudentsWithDisciplineProgress > 0 ? totalDisciplineProgress / totalStudentsWithDisciplineProgress : 0;

  return { averageProgressByCourseTurma, overallAverageProgress };
}

export function calculateCertificateTimeline(data, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeline = {};

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    timeline[dateString] = { digital: 0, impresso: 0 };
  }

  data.forEach(item => {
    const digitalDate = item["Data Solic. Digital"];
    const impressoDate = item["Data Solic. Impresso"];

    if (digitalDate instanceof Date) {
      const diffTime = Math.abs(today - digitalDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= days) {
        const dateString = digitalDate.toISOString().split('T')[0];
        if (timeline[dateString]) {
          timeline[dateString].digital++;
        }
      }
    }

    if (impressoDate instanceof Date) {
      const diffTime = Math.abs(today - impressoDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= days) {
        const dateString = impressoDate.toISOString().split('T')[0];
        if (timeline[dateString]) {
          timeline[dateString].impresso++;
        }
      }
    }
  });

  return timeline;
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

  const certTimeline7d = calculateCertificateTimeline(data, 7);
  const certTimeline30d = calculateCertificateTimeline(data, 30);
  const certTimeline90d = calculateCertificateTimeline(data, 90);

  const totalCertRequests7d = Object.values(certTimeline7d).reduce((sum, { digital, impresso }) => sum + digital + impresso, 0);
  const totalCertRequests30d = Object.values(certTimeline30d).reduce((sum, { digital, impresso }) => sum + digital + impresso, 0);
  const totalCertRequests90d = Object.values(certTimeline90d).reduce((sum, { digital, impresso }) => sum + digital + impresso, 0);

  return {
    totalStudents,
    percentEmDia,
    percentInadimplentes,
    avgDisciplineProgress,
    percentDocsOK,
    totalCertRequests7d,
    totalCertRequests30d,
    totalCertRequests90d,
    lastUpdated: new Date().toLocaleString(), // Placeholder, will be updated by refresh logic
  };
}


