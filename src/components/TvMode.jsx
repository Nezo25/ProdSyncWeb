import React, { useState, useEffect } from 'react';
import { Package, Flame, Star, Activity, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const GaugeChart = ({ value }) => {
  const RADIAN = Math.PI / 180;
  // Ranges: 0-300 (Red), 300-325 (Yellow), 325-350 (Green), 350-500 (Blue)
  const data = [
    { name: 'Crítico', value: 300, color: '#ef4444' },     // Vermelho
    { name: 'Atenção', value: 25, color: '#eab308' },      // Amarelo
    { name: 'Bom', value: 25, color: '#22c55e' },          // Verde
    { name: 'Espetacular', value: 150, color: '#3b82f6' }, // Azul
  ];
  const cx = '50%';
  const cy = '75%';
  const iR = '70%';
  const oR = '90%';

  // Pointer math
  const maxVal = 500;
  const needleValue = Math.min(Math.max(value, 0), maxVal);
  const ang = 180 - ((needleValue / maxVal) * 180);
  const length = 60; // radius %
  const sin = Math.sin(-ang * RADIAN);
  const cos = Math.cos(-ang * RADIAN);
  const r = 5;
  const x0 = 50; // cx as percentage (assuming we handle this in SVG directly, but Recharts makes it hard without hardcoding pixels)
  // Recharts custom needle is tricky for responsiveness. Let's do a pure SVG overlay for the needle.

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden flex flex-col items-center justify-end">
      <ResponsiveContainer width="100%" height="200%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Absolute overlay for value */}
      <div className="absolute bottom-0 w-full flex flex-col items-center pb-2">
        <span className="text-6xl font-mono font-black tracking-tighter text-white drop-shadow-md">
          {value}
        </span>
        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Cx / Colab</span>
      </div>
    </div>
  );
};

export default function TvMode({ onExit }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const response = await api.get('/dashboard/matriz-picking?data=' + dateStr);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados para TV:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-slate-400">
        <h1 className="text-xl font-mono tracking-widest animate-pulse uppercase">Sincronizando BI...</h1>
      </div>
    );
  }

  let totalCaixas = 0;
  let totalVisitas = 0;
  let totalHorasTrabalhadas = 0;
  let headcountAtivo = 0;
  
  const operacao = data.map(colab => {
    let caixas = 0;
    let visitas = 0;
    let horas = 0;
    
    const horasPadrao = [8, 9, 10, 11, 13, 14, 15, 16, 17];
    horasPadrao.forEach(h => {
      const reg = colab.registros[h];
      if (reg && (reg.caixa > 0 || reg.visita > 0)) {
        caixas += reg.caixa;
        visitas += reg.visita;
        horas += 1;
      }
    });

    totalCaixas += caixas;
    totalVisitas += visitas;
    totalHorasTrabalhadas += horas;
    if (horas > 0) headcountAtivo++;

    const mediaCaixas = horas > 0 ? Math.round(caixas / horas) : 0;
    const mediaVisitas = horas > 0 ? Math.round(visitas / horas) : 0;
    return { ...colab, caixas, mediaCaixas, mediaVisitas, horas };
  }).filter(c => c.horas > 0).sort((a, b) => b.mediaCaixas - a.mediaCaixas);

  const mediaGlobal = headcountAtivo > 0 ? Math.round(totalCaixas / headcountAtivo) : 0;

  // Header meta estática por enquanto
  const META_TURNO = 12000;

  return (
    <div className="h-screen w-screen bg-[#0b0f19] text-slate-200 overflow-hidden flex flex-col font-sans">
      <button 
        onClick={onExit}
        className="absolute top-0 right-0 h-4 w-4 opacity-0 z-50 cursor-pointer"
        title="Sair do Modo TV"
      />

      {/* Header Compacto Nível SAP */}
      <div className="h-20 border-b border-slate-800 bg-[#0f1423] flex justify-between items-center px-8 shrink-0">
        <div className="flex items-center gap-4">
          <Package className="w-8 h-8 text-blue-500" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">PRODSYNC <span className="text-slate-500 font-light">TV</span></h1>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Visão Logística • Picking</span>
          </div>
        </div>
        
        <div className="flex gap-12 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Headcount Ativo</span>
            <div className="flex items-center gap-2 mt-1">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-mono font-bold text-white">{headcountAtivo}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Meta do Turno</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-mono font-black text-white leading-none">{totalCaixas.toLocaleString('pt-BR')}</span>
              <span className="text-sm font-mono text-slate-500 leading-snug">/ {META_TURNO.toLocaleString('pt-BR')} Cx</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Painel Esquerdo: Velocímetro */}
        <div className="w-[400px] border-r border-slate-800 bg-[#0b0f19] p-8 flex flex-col gap-12 items-center justify-center shrink-0">
          <div className="w-full text-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" /> Ritmo da Operação
            </h2>
          </div>
          
          <div className="w-full max-w-[300px]">
             <GaugeChart value={mediaGlobal} />
          </div>

          <div className="w-full bg-[#0f1423] rounded-lg p-4 border border-slate-800 flex justify-between">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Verde</div>
              <div className="font-mono text-sm text-green-500 font-bold mt-1">≥300</div>
            </div>
            <div className="text-center border-x border-slate-800 px-4">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amarelo</div>
              <div className="font-mono text-sm text-yellow-500 font-bold mt-1">≥325</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Azul</div>
              <div className="font-mono text-sm text-blue-500 font-bold mt-1">≥350</div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Grid de Ritmo da Equipe */}
        <div className="flex-1 flex flex-col bg-[#0f1423]">
          {/* Tabela Cabeçalho */}
          <div className="flex bg-[#161c2d] border-b border-slate-800 px-8 py-3 shrink-0">
            <div className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Colaborador(a)</div>
            <div className="w-32 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cx / Hora</div>
            <div className="w-24 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vi / Hora</div>
            <div className="w-24 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Cx</div>
          </div>

          {/* Lista com scroll animado (via CSS animation se quiser depois, por ora overflow) */}
          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            {operacao.map((colab, idx) => {
              // Determina a cor e ícone da linha baseado na meta
              let rowColor = "border-slate-800";
              let numColor = "text-red-400";
              let badge = null;

              if (colab.caixas >= 350) {
                rowColor = "bg-blue-900/10 border-blue-900/40";
                numColor = "text-blue-400";
                badge = <Flame className="w-4 h-4 text-blue-500" />;
              } else if (colab.caixas >= 325) {
                rowColor = "bg-green-900/10 border-green-900/30";
                numColor = "text-green-400";
                badge = <Star className="w-4 h-4 text-green-500" />;
              } else if (colab.caixas >= 300) {
                rowColor = "border-slate-800";
                numColor = "text-yellow-400";
              }

              return (
                <div key={colab.id} className={`flex items-center px-4 py-3 border-b ${rowColor} transition-colors`}>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-slate-600 font-mono text-xs font-bold w-4">{idx + 1}.</span>
                    <span className="font-semibold text-slate-200 tracking-wide text-sm">{colab.nome}</span>
                    {badge}
                  </div>
                  <div className={`w-32 text-right font-mono text-xl font-bold ${numColor}`}>
                    {colab.mediaCaixas}
                  </div>
                  <div className="w-24 text-right font-mono text-base text-slate-400">
                    {colab.mediaVisitas}
                  </div>
                  <div className="w-24 text-right font-mono text-sm text-slate-500">
                    {colab.caixas}
                  </div>
                </div>
              );
            })}
            
            {operacao.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm uppercase tracking-widest">
                Aguardando início do turno...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollbar styles inject */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f1423; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}} />
    </div>
  );
}
