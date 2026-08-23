import React, { useState, useEffect, forwardRef } from 'react';
import { getDay } from 'date-fns';
import { User, Target, Calendar, Loader2 } from 'lucide-react';
import api from '../services/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

const MatrizProdutividadeTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Lógica para determinar se é sexta-feira
  const isFriday = getDay(selectedDate) === 5;
  const horasPadrao = [8, 9, 10, 11, 13, 14, 15, 16, 17];
  const horasSexta = [8, 9, 10, 11, 13, 14, 15, 16];
  
  const colunasHoras = isFriday ? horasSexta : horasPadrao;

  useEffect(() => {
    // Formata a data para YYYY-MM-DD considerando o fuso local (evitando bug do toISOString de madrugada)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    fetchData(dateStr);
  }, [selectedDate]);

  const fetchData = async (dateStr) => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/matriz-picking?data=${dateStr}`);
      
      const sortedData = response.data.sort((a, b) => {
        let totalCaixasA = 0; let totalVisitasA = 0;
        let totalCaixasB = 0; let totalVisitasB = 0;
        
        colunasHoras.forEach(h => {
          if (a.registros[h]) { totalCaixasA += a.registros[h].caixa || 0; totalVisitasA += a.registros[h].visita || 0; }
          if (b.registros[h]) { totalCaixasB += b.registros[h].caixa || 0; totalVisitasB += b.registros[h].visita || 0; }
        });

        const mediaCxA = a.horasTrabalhadas > 0 ? totalCaixasA / a.horasTrabalhadas : 0;
        const mediaViA = a.horasTrabalhadas > 0 ? totalVisitasA / a.horasTrabalhadas : 0;
        
        const mediaCxB = b.horasTrabalhadas > 0 ? totalCaixasB / b.horasTrabalhadas : 0;
        const mediaViB = b.horasTrabalhadas > 0 ? totalVisitasB / b.horasTrabalhadas : 0;

        const getTier = (cx, vi) => {
          if (cx >= 350 || vi >= 30) return 3; // Azul
          if (cx >= 325 || vi >= 28) return 2; // Verde
          if (cx >= 300 || vi >= 26) return 1; // Amarelo
          return 0; // Nenhum
        };

        const tierA = getTier(mediaCxA, mediaViA);
        const tierB = getTier(mediaCxB, mediaViB);

        // Primeiro desempata pela Meta alcançada (Azul ganha de todos)
        if (tierA !== tierB) {
          return tierB - tierA; // Maior tier primeiro
        }
        
        // Se empatar na meta, desempata pela média de Caixas
        return mediaCxB - mediaCxA;
      });

      setData(sortedData);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCaixasColor = (media) => {
    if (media >= 350) return 'text-blue-600 font-bold';
    if (media >= 325) return 'text-green-600 font-bold';
    if (media >= 300) return 'text-yellow-500 font-bold';
    return 'text-gray-800 font-semibold';
  };

  const getVisitasColor = (media) => {
    if (media >= 30) return 'text-blue-600 font-bold';
    if (media >= 28) return 'text-green-600 font-bold';
    if (media >= 26) return 'text-yellow-500 font-bold';
    return 'text-gray-800 font-semibold';
  };

  // Botão customizado para o DatePicker
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer" onClick={onClick} ref={ref}>
      <Calendar className="w-4 h-4 text-brand-burgundy" />
      <span className="text-sm font-semibold text-gray-700">{value}</span>
    </div>
  ));

  return (
    <div className="bg-brand-light min-h-screen p-6 font-sans text-brand-dark">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-burgundy flex items-center gap-2">
              <Target className="w-7 h-7" />
              Painel de Picking (Separação)
            </h1>
            <div className="text-gray-500 mt-2 flex items-center gap-3">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                customInput={<CustomInput />}
              />
              <span className="text-sm border-l border-gray-300 pl-3">
                {isFriday ? 'Turno Sexta-feira (8h às 16h)' : 'Turno Padrão (8h às 17h)'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="text-sm bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md border border-yellow-100">
              <strong className="block">Meta Amarela (R$ 500)</strong>
              &ge; 300 Cx | &ge; 26 Vi
            </div>
            <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-100">
              <strong className="block">Meta Verde (R$ 700)</strong>
              &ge; 325 Cx | &ge; 28 Vi
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-100">
              <strong className="block">Meta Azul (R$ 900)</strong>
              &ge; 350 Cx | &ge; 30 Vi
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md border border-gray-200">
          <Loader2 className="w-10 h-10 animate-spin text-brand-burgundy mb-4" />
          <p className="text-gray-500 font-medium">Buscando produtividade em tempo real...</p>
        </div>
      ) : (
        /* Tabela */
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              {/* Primeira linha do header (Horas) */}
              <tr className="bg-brand-burgundy text-white">
                <th rowSpan="2" className="px-2 py-2 text-left font-semibold border-b border-brand-burgundy/20 min-w-[150px] max-w-[200px] truncate text-xs">
                  COLABORADOR(A)
                </th>
                {colunasHoras.map(h => (
                  <th key={h} colSpan="2" className="px-1 py-1 text-xs font-semibold border-l border-white/20 border-b border-brand-burgundy/20">
                    {h}h
                  </th>
                ))}
                <th rowSpan="2" className="px-2 py-2 text-xs font-semibold border-l border-white/20 border-b border-brand-burgundy/20 w-14">
                  CAIXAS
                </th>
                <th rowSpan="2" className="px-2 py-2 text-xs font-semibold border-l border-white/20 border-b border-brand-burgundy/20 w-14">
                  VISITAS
                </th>
                <th rowSpan="2" className="px-2 py-2 text-xs font-semibold border-l border-white/20 border-b border-brand-burgundy/20 w-16">
                  CX/H
                </th>
                <th rowSpan="2" className="px-2 py-2 text-xs font-semibold border-l border-white/20 border-b border-brand-burgundy/20 w-16">
                  VI/H
                </th>
              </tr>
              {/* Segunda linha do header (Métricas) */}
              <tr className="bg-brand-burgundy text-brand-pink/90 text-[10px]">
                {colunasHoras.map(h => (
                  <React.Fragment key={`${h}-sub`}>
                    <th className="px-1 py-1 border-l border-white/20 font-medium tracking-tighter">CX</th>
                    <th className="px-1 py-1 font-medium tracking-tighter">VI</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={colunasHoras.length * 2 + 5} className="py-8 text-center text-gray-500">
                    Nenhum registro de produtividade encontrado para hoje.
                  </td>
                </tr>
              ) : (
                data.map((colab, index) => {
                  // Cálculos de totais
                  let totalCaixas = 0;
                  let totalVisitas = 0;
                  let horasTrabalhadas = 0;

                  colunasHoras.forEach(h => {
                    const reg = colab.registros[h];
                    if (reg && (reg.caixa > 0 || reg.visita > 0)) {
                      totalCaixas += reg.caixa;
                      totalVisitas += reg.visita;
                      horasTrabalhadas += 1;
                    }
                  });

                  const mediaCaixas = horasTrabalhadas > 0 ? Math.round(totalCaixas / horasTrabalhadas) : 0;
                  const mediaVisitas = horasTrabalhadas > 0 ? Math.round(totalVisitas / horasTrabalhadas) : 0;

                  return (
                    <tr key={colab.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-[#F9F6F0] hover:bg-[#F3EFE6]'}>
                      <td className="px-2 py-2 text-left text-gray-800 font-medium uppercase truncate border-r border-gray-200 text-xs max-w-[200px]">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{colab.nome}</span>
                        </div>
                      </td>
                      
                      {/* Células de Horas */}
                      {colunasHoras.map(h => {
                        const reg = colab.registros[h];
                        return (
                          <React.Fragment key={`${colab.id}-${h}`}>
                            <td className="px-1 py-2 border-r border-dashed border-gray-200 text-gray-600 text-xs">
                              {reg?.caixa > 0 ? reg.caixa : '-'}
                            </td>
                            <td className="px-1 py-2 border-r border-gray-200 text-gray-600 text-xs">
                              {reg?.visita > 0 ? reg.visita : '-'}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Resumo */}
                      <td className="p-2 text-center font-bold bg-gray-50 border-x border-gray-200 text-brand-burgundy text-xs">
                        {totalCaixas}
                      </td>
                      <td className="p-2 text-center font-bold bg-gray-50 border-r border-gray-200 text-brand-burgundy text-xs">
                        {totalVisitas}
                      </td>
                      <td className={`p-2 text-center font-bold bg-white text-xs ${getCaixasColor(totalCaixas / (colab.horasTrabalhadas || 1))}`}>
                        {colab.horasTrabalhadas > 0 ? Math.round(totalCaixas / colab.horasTrabalhadas) : 0}
                      </td>
                      <td className={`p-2 text-center font-bold bg-white text-xs ${getVisitasColor(totalVisitas / (colab.horasTrabalhadas || 1))}`}>
                        {colab.horasTrabalhadas > 0 ? Math.round(totalVisitas / colab.horasTrabalhadas) : 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatrizProdutividadeTable;
