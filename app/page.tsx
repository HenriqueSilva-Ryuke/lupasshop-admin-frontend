'use client';

import { useQuery, gql } from '@apollo/client';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
  EmptyState,
} from '@lupa/design-system';

const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboard {
    listUsers(role: ADMIN) {
      id
    }
  }
`;

export default function AdminDashboard() {
  const { data, loading } = useQuery(ADMIN_DASHBOARD_QUERY, {
    errorPolicy: 'ignore',
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visão Geral"
        description="Monitoramento em tempo real do ecossistema LupaShop"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Lojas"
          value={loading ? '—' : '156'}
          icon={<Store className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          description="vs. mês anterior"
        />
        <StatCard
          title="Usuários Ativos"
          value={loading ? '—' : '2.340'}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
          description="vs. mês anterior"
        />
        <StatCard
          title="Pedidos (Mês)"
          value={loading ? '—' : '45.200'}
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={{ value: 23, isPositive: true }}
          description="vs. mês anterior"
        />
        <StatCard
          title="Volume Transacionado"
          value={loading ? '—' : 'Kz 12.5M'}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 15, isPositive: true }}
          description="vs. mês anterior"
        />
      </div>

      {/* Activity + Pending Stores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Nova loja registrada', target: 'Tech Zone Angola', time: '5 min' },
                { action: 'Pedido concluído', target: '#ORD-4523', time: '12 min' },
                { action: 'Novo vendedor aprovado', target: 'Maria Silva', time: '30 min' },
                { action: 'Pagamento processado', target: 'Kz 45.000', time: '1 hora' },
                { action: 'Review moderada', target: 'Produto #892', time: '2 horas' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">{item.action}:</span>
                  <span className="text-muted-foreground">{item.target}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              Lojas Pendentes de Aprovação
              <Badge variant="warning" className="ml-2">3</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Moda Luanda', category: 'Moda', date: 'Há 2 dias' },
                { name: 'Tech Express AO', category: 'Eletrônicos', date: 'Há 3 dias' },
                { name: 'Sabores de Angola', category: 'Alimentação', date: 'Há 5 dias' },
              ].map((store, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                      {store.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{store.date}</span>
                    <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                      Revisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">3.2%</span>
              <span className="mb-1 flex items-center text-sm text-success">
                <TrendingUp className="mr-1 h-4 w-4" />
                +0.5%
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Média de conversão do marketplace
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">Kz 8.500</span>
              <span className="mb-1 flex items-center text-sm text-success">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                +12%
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Valor médio por pedido este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">4.6</span>
              <span className="mb-1 text-sm text-muted-foreground">/ 5.0</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${star <= 4 ? 'text-warning' : 'text-muted'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              NPS baseado em 1.250 avaliações
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
