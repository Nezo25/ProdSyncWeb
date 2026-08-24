import React, { useState, useEffect } from 'react';
import { User, Check, X, Stethoscope, Plane, Loader2 } from 'lucide-react';
import api from '../services/api';

const STATUS_CONFIG = {
  PRESENTE: { label: 'Presente', icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
  FALTA: { label: 'Falta', icon: X, color: 'text-red-600', bg: 'bg-red-50' },
  ATESTADO: { label: 'Atestado', icon: Stethoscope, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  FERIAS: { label: 'Férias', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function Equipe() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('ROLE_SEPARADOR');

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    try {
      setLoading(true);
      await api.post('/colaboradores', { nome, role, ativo: true });
      setNome('');
      fetchColaboradores();
      alert('Colaborador cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar colaborador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      // For MVP, we will assume everyone is PRESENTE unless we save otherwise.
      // But we should fetch real data from our backend. We don't have an endpoint for ALL collaborators yet,
      // Build local date string
      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const response = await api.get('/dashboard/matriz-picking?data=' + dateStr);
      
      const list = response.data.map(c => ({
        id: c.id,
        nome: c.nome,
        status: 'PRESENTE' // Mocking initial status for MVP UI
      }));
      setColaboradores(list);
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setColaboradores(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );
    // Here we would call the API: api.post(`/presenca`, { colaboradorId: id, status: newStatus })
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md border border-gray-200">
        <Loader2 className="w-10 h-10 animate-spin text-brand-burgundy mb-4" />
        <p className="text-gray-500 font-medium">Carregando equipe...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Gestão de Equipe (Floor Check)</h2>
        <p className="text-gray-500 mt-1">Aponte presenças e cadastre novos funcionários no check floor.</p>

        <form onSubmit={handleCadastrar} className="mt-6 flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Colaborador</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-brand-burgundy focus:border-brand-burgundy bg-white" 
              placeholder="Ex: João da Silva" 
              required
            />
          </div>
          <div className="w-full md:w-48 flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-brand-burgundy focus:border-brand-burgundy bg-white"
            >
              <option value="ROLE_SEPARADOR">Separador</option>
              <option value="ROLE_EMPILHADEIRA">Empilhadeira</option>
              <option value="ROLE_INVENTARIO">Inventário</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full md:w-auto bg-brand-burgundy text-white px-6 py-2 rounded-md hover:bg-brand-burgundy/90 text-sm font-medium transition-colors shadow-sm"
          >
            Cadastrar
          </button>
        </form>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
            <th className="px-6 py-4 font-medium border-b border-gray-200">Colaborador</th>
            <th className="px-6 py-4 font-medium border-b border-gray-200">Status Atual</th>
            <th className="px-6 py-4 font-medium border-b border-gray-200 text-right">Ação Rápida</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {colaboradores.map(colab => {
            const CurrentIcon = STATUS_CONFIG[colab.status].icon;
            return (
              <tr key={colab.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="font-semibold text-gray-900">{colab.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[colab.status].bg} ${STATUS_CONFIG[colab.status].color}`}>
                    <CurrentIcon className="w-4 h-4" />
                    {STATUS_CONFIG[colab.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={colab.status}
                    onChange={(e) => handleStatusChange(colab.id, e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-burgundy focus:border-brand-burgundy p-2 shadow-sm"
                  >
                    <option value="PRESENTE">Marcar como Presente</option>
                    <option value="FALTA">Apontar Falta</option>
                    <option value="ATESTADO">Atestado Médico</option>
                    <option value="FERIAS">Em Férias</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
