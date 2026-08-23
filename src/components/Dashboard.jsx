import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Users, Package, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const MOCK_DATA = [
  { hora: '08:00', headcount: 45, caixas: 1200, media: 26.6 },
  { hora: '09:00', headcount: 48, caixas: 1450, media: 30.2 },
  { hora: '10:00', headcount: 48, caixas: 1600, media: 33.3 },
  { hora: '11:00', headcount: 47, caixas: 1550, media: 32.9 },
  { hora: '12:00', headcount: 25, caixas: 600, media: 24.0 }, // Horário de almoço
  { hora: '13:00', headcount: 46, caixas: 1300, media: 28.2 },
  { hora: '14:00', headcount: 48, caixas: 1500, media: 31.2 },
  { hora: '15:00', headcount: 48, caixas: 1580, media: 32.9 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '+' : '-'}{trend}
        </span>
        <span className="text-gray-400 ml-2">vs hora anterior</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  // Exemplo de chamada real à API (comentado para o scaffolding rodar sem o backend)
  /*
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // GET /api/v1/dashboards/metricas
        // const response = await axios.get('http://localhost:8080/api/v1/dashboards/metricas?faixaHoraria=...');
        // setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  */

  const currentStats = data[data.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Resumo (Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Headcount Ativo" 
          value={currentStats.headcount} 
          icon={Users} 
          trend="4.3%" 
          trendUp={true} 
        />
        <StatCard 
          title="Produtividade (Caixas)" 
          value={currentStats.caixas.toLocaleString()} 
          icon={Package} 
          trend="5.3%" 
          trendUp={true} 
        />
        <StatCard 
          title="Média (Caixas/HC)" 
          value={`${currentStats.media.toFixed(1)}`} 
          icon={TrendingUp} 
          trend="1.2%" 
          trendUp={true} 
        />
        <StatCard 
          title="Hora da Última Leitura" 
          value={currentStats.hora} 
          icon={Clock} 
        />
      </div>

      {/* Gráfico Principal (HC vs Caixas) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Oscilação: Headcount vs Movimentações</h2>
          <span className="px-3 py-1 bg-brand-pink/20 text-brand-burgundy rounded-full text-xs font-medium">Tempo Real</span>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
              
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar yAxisId="left" dataKey="caixas" name="Caixas Separadas" fill="#800020" radius={[4, 4, 0, 0]} barSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="headcount" name="Headcount (HC)" stroke="#FFC0CB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
