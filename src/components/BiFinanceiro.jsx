import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Activity, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import api from '../services/api';

export default function BiFinanceiro() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Para fins do MVP, vamos fixar no mês atual (Agosto 2026 baseado no nosso seed de dados)
  const ano = 2026;
  const mes = 8;

  useEffect(() => {
    fetchDadosFinanceiros();
  }, []);

  const fetchDadosFinanceiros = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bi/financeiro/mensal?ano=${ano}&mes=${mes}`);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do BI Financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Custos fixos simulados da operação (salários base, energia, etc) para o cálculo do Custo por Caixa
  const CUSTO_FIXO_TURNO_DIA = 1500; 
  const diasTrabalhados = data.dias.length || 1;
  const custoFixoTotal = CUSTO_FIXO_TURNO_DIA * diasTrabalhados;
  const custoTotalMensal = custoFixoTotal + data.custoBonusAcumulado;
  
  const custoPorCaixa = data.totalCaixasMes > 0 
    ? (custoTotalMensal / data.totalCaixasMes) 
    : 0;

  // Prepara dados pro gráfico (Formatando a data de YYYY-MM-DD para DD/MM)
  const chartData = data.dias.map(d => {
    const day = d.data.split('-')[2];
    const month = d.data.split('-')[1];
    return {
      nome: `${day}/${month}`,
      'Volume (Caixas)': d.totalCaixas,
      'Provisão Bônus (R$)': Math.round(d.custoBonus * 100) / 100
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Análise Financeira e ROI</h1>
          <p className="text-slate-500 text-sm mt-1">Acumulado do Mês (Agosto 2026)</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-md shadow-sm p-1">
          <button className="px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded shadow-sm">Mês Atual</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">Mês Anterior</button>
        </div>
      </div>

      {/* Cards de Métricas (Top-level) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Provisão de Premiação */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Provisão de Bônus</p>
              <h2 className="text-4xl font-black text-slate-800 mt-2">
                R$ {data.custoBonusAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 font-medium">+12%</span>
            <span className="text-slate-400">vs. mês passado</span>
          </div>
        </div>

        {/* Card: Volumetria */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Volume Total</p>
              <h2 className="text-4xl font-black text-blue-600 mt-2">
                {data.totalCaixasMes.toLocaleString('pt-BR')} <span className="text-xl text-slate-400 font-semibold">cx</span>
              </h2>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            Média de <strong className="text-slate-700">{data.mediaCaixasHoraMes}</strong> caixas por hora.
          </div>
        </div>

        {/* Card: Custo por Caixa */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Custo Efetivo por Caixa</p>
              <h2 className="text-4xl font-black text-slate-800 mt-2">
                R$ {custoPorCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Fórmula: (Custo Fixo Mensal Estimado + Bônus Provisão) ÷ Total de Caixas. Ideal manter abaixo de R$ 0,50.</span>
          </div>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-2">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Correlação: Volume Diário vs. Custo de Bônus</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              
              {/* Eixo Y da Esquerda (Caixas) */}
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              
              {/* Eixo Y da Direita (Reais) */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Barras de Volume (Eixo Esquerdo) */}
              <Bar yAxisId="left" dataKey="Volume (Caixas)" barSize={40} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              
              {/* Linha de Custo (Eixo Direito) */}
              <Line yAxisId="right" type="monotone" dataKey="Provisão Bônus (R$)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
