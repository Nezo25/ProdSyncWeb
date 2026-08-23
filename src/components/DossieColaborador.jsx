import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend,
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { User, Users } from 'lucide-react';
import api from '../services/api';

export default function DossieColaborador() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lista de colaboradores para o Dropdown
  const [colaboradores, setColaboradores] = useState([]);
  const [selectedColaborador, setSelectedColaborador] = useState(id || 'geral');

  // Buscar lista de colaboradores ao montar o componente
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const response = await api.get('/colaboradores');
        setColaboradores(response.data);
      } catch (error) {
        console.error('Erro ao buscar lista de colaboradores:', error);
      }
    };
    fetchColaboradores();
  }, []);

  useEffect(() => {
    fetchDossie();
  }, [selectedColaborador]);

  const fetchDossie = async () => {
    try {
      setLoading(true);
      
      // Se for "geral", poderiamos chamar um endpoint especifico, 
      // ou passar id=0 para o backend entender que eh o consolidado da empresa
      const queryId = selectedColaborador === 'geral' ? 0 : selectedColaborador;
      
      const response = await api.get(`/bi/colaboradores/${queryId}/dossie?ano=2026&mes=8`);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dossiê:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
    </div>
  );

  const isGeral = selectedColaborador === 'geral';

  const radarData = [
    { subject: 'Caixas (Vol)', A: data.radar.mediaCaixasColaborador, B: data.radar.mediaCaixasEmpresa, fullMark: 400 },
    { subject: 'Visitas', A: data.radar.mediaVisitasColaborador * 10, B: data.radar.mediaVisitasEmpresa * 10, fullMark: 400 },
    { subject: 'Assiduidade (%)', A: data.radar.assiduidadeColaborador, B: data.radar.assiduidadeEmpresa, fullMark: 100 },
  ];

  const pieData = [
    { name: 'Azul', value: data.hitRate.diasAzul, color: '#3b82f6' },
    { name: 'Verde', value: data.hitRate.diasVerde, color: '#10b981' },
    { name: 'Amarelo', value: data.hitRate.diasAmarelo, color: '#f59e0b' },
    { name: 'Sem Bônus', value: data.hitRate.diasSemMeta, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  const absenteismoData = data.absenteismo;

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header com Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-burgundy text-white rounded-lg">
            {isGeral ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isGeral ? 'Visão Geral (Galpão)' : data.nome}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Dossiê Analítico - Agosto 2026</p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selecionar Visão</label>
          <select 
            className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-burgundy"
            value={selectedColaborador}
            onChange={(e) => setSelectedColaborador(e.target.value)}
          >
            <option value="geral">Geral (Toda a Operação)</option>
            {colaboradores.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase self-start mb-2">
            {isGeral ? 'Perfil da Operação' : 'Perfil vs Operação'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                
                {isGeral ? (
                  <Radar name="Média Empresa" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
                ) : (
                  <>
                    <Radar name={data.nome} dataKey="A" stroke="#881337" fill="#881337" fillOpacity={0.5} />
                    <Radar name="Média Empresa" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                  </>
                )}
                
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Metas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase self-start mb-2">Constância de Produtividade</h3>
          <div className="h-64 w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-black text-slate-800">
                 {data.hitRate.diasTotal > 0 ? Math.round(((data.hitRate.diasAzul + data.hitRate.diasVerde) / data.hitRate.diasTotal) * 100) : 0}%
               </span>
               <span className="text-xs text-slate-500 uppercase font-bold">Dias na Meta</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center w-full flex-wrap text-xs font-semibold text-slate-600">
             {pieData.map(p => (
               <div key={p.name} className="flex items-center gap-1">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>{p.name}
               </div>
             ))}
          </div>
        </div>

        {/* Absenteísmo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">
            {isGeral ? 'Absenteísmo Global (Faltas)' : 'Absenteísmo (Faltas)'}
          </h3>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenteismoData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="diaSemana" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="totalFaltas" name="Faltas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
