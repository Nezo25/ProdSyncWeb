import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import api from '../services/api';
import { Truck, Package, CheckCircle, AlertTriangle } from 'lucide-react';

export default function OperacaoTerminal() {
  const [separadorId, setSeparadorId] = useState(1);
  const [empilhadeiristaId, setEmpilhadeiristaId] = useState(2);
  const [endereco, setEndereco] = useState('');
  
  const [meuChamado, setMeuChamado] = useState(null);
  const [chamadosGlobais, setChamadosGlobais] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // WebSocket Connection
  useEffect(() => {
    const socket = new SockJS('https://prodsync-xpef.onrender.com/ws-prodsync');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');

      // TÃ³pico Global (Para Empilhadeiristas)
      client.subscribe('/topic/chamados', (msg) => {
        const chamado = JSON.parse(msg.body);
        setChamadosGlobais(prev => {
          // Remove if not PENDENTE, else add/update
          if (chamado.status !== 'PENDENTE') {
            return prev.filter(c => c.id !== chamado.id);
          }
          const exists = prev.find(c => c.id === chamado.id);
          if (exists) return prev.map(c => c.id === chamado.id ? chamado : c);
          return [...prev, chamado];
        });
      });

      // TÃ³pico Privado (Para Separador atual)
      client.subscribe(`/topic/chamados/${separadorId}`, (msg) => {
        const chamado = JSON.parse(msg.body);
        setMeuChamado(chamado);
        if (chamado.status === 'CONCLUIDO') {
          setTimeout(() => setMeuChamado(null), 5000); // clear after 5s
        }
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [separadorId]);

  // Fetch initial pendentes
  useEffect(() => {
    // We would fetch existing pendentes here, but for simplicity we rely on WS or manual fetch
  }, []);

  const abrirChamado = async () => {
    try {
      setErrorMsg('');
      const res = await api.post('/chamados', { separadorId, endereco });
      setMeuChamado(res.data);
      setEndereco('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao abrir chamado');
    }
  };

  const aceitarChamado = async (chamadoId) => {
    try {
      setErrorMsg('');
      await api.put(`/chamados/${chamadoId}/aceitar`, { empilhadeiristaId });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setErrorMsg(err.response.data.erro || 'Chamado jÃ¡ assumido!');
      } else {
        setErrorMsg('Erro ao aceitar chamado');
      }
    }
  };

  const concluirChamado = async (chamadoId) => {
    try {
      setErrorMsg('');
      await api.put(`/chamados/${chamadoId}/concluir`);
    } catch (err) {
      setErrorMsg('Erro ao concluir');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* SEPARADOR (COLABORADOR 1) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Package className="w-5 h-5 text-blue-600" />
            Terminal do Separador (ID: {separadorId})
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-4">
          {!meuChamado || meuChamado.status === 'CONCLUIDO' ? (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-700">EndereÃ§o (Ex: Rua A, Pos 10)</label>
              <input 
                type="text" 
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="EndereÃ§o de descida"
              />
              <button 
                onClick={abrirChamado}
                disabled={!endereco}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                Solicitar Empilhadeira
              </button>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${meuChamado.status === 'PENDENTE' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className="font-semibold text-slate-800 mb-2">Chamado Ativo: {meuChamado.endereco}</h3>
              {meuChamado.status === 'PENDENTE' ? (
                <div className="flex items-center gap-2 text-yellow-700">
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
                  Aguardando um operador aceitar...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Operador {meuChamado.empilhadeirista?.nome || meuChamado.empilhadeirista?.id} estÃ¡ a caminho!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EMPILHADEIRA (COLABORADOR 2) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Truck className="w-5 h-5 text-slate-600" />
            Painel da Empilhadeira (ID: {empilhadeiristaId})
          </div>
        </div>

        <div className="p-6 flex-1 bg-slate-50/50">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5" />
              {errorMsg}
            </div>
          )}

          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Chamados Pendentes ({chamadosGlobais.length})</h3>
          
          <div className="flex flex-col gap-3">
            {chamadosGlobais.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Nenhum chamado pendente no galpÃ£o.</p>
            ) : (
              chamadosGlobais.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{c.endereco}</p>
                    <p className="text-xs text-slate-500">Separador ID: {c.separador?.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => aceitarChamado(c.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
                    >
                      Aceitar
                    </button>
                    <button 
                      onClick={() => concluirChamado(c.id)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
