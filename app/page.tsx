'use client';

import { useQuery, gql } from '@apollo/client';
import { Users, Store, ShoppingBag, DollarSign, Activity } from 'lucide-react';

const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    listUsers(role: ADMIN) { id } # Just to check connectivity
    # Real stats would need a specific resolver
  }
`;

export default function AdminDashboard() {
  const { data, loading, error } = useQuery(ADMIN_STATS_QUERY);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Visão Geral da Plataforma</h1>
        <p className="text-slate-500">Monitoramento em tempo real do ecossistema LupaShop.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total de Lojas" value="156" icon={Store} color="bg-blue-500" />
        <StatCard title="Usuários Ativos" value="2,340" icon={Users} color="bg-emerald-500" />
        <StatCard title="Pedidos (Mês)" value="45,200" icon={ShoppingBag} color="bg-violet-500" />
        <StatCard title="Volume Transacionado" value="Kz 12.5M" icon={DollarSign} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-medium">Nova loja registrada:</span>
                <span className="text-slate-500">Tech Zone {i}</span>
                <span className="ml-auto text-xs text-slate-400">Há {i * 5} min</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Lojas Pendentes de Aprovação</h3>
          <div className="text-slate-500 text-center py-8">
            <Store className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p>Nenhuma loja pendente no momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );
}
