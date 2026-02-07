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
import { formatCurrency } from '@lupa/design-system/utils';

// Real GraphQL queries to the backend
const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboard {
    listStores(limit: 1000) {
      id
      name
      slug
      createdAt
      isVerified
      category {
        name
      }
      owner {
        id
        fullName
        email
      }
    }
    listUsers {
      id
      role
    }
    listOrders(limit: 1000) {
      orders {
        id
        totalAmount
        status
        createdAt
        user {
          fullName
        }
      }
      total
    }
    getFinancialSummary {
      totalRevenue
      totalSales
      averageOrderValue
    }
    listReviews {
      id
      rating
    }
  }
`;

export default function AdminDashboard() {
  const { data, loading, error } = useQuery(ADMIN_DASHBOARD_QUERY, {
    errorPolicy: 'all',
  });

  const stores = data?.listStores ?? [];
  const users = data?.listUsers ?? [];
  const ordersData = data?.listOrders ?? { orders: [], total: 0 };
  const financialSummary = data?.getFinancialSummary;
  const reviews = data?.listReviews ?? [];

  // Compute real metrics
  const totalStores = stores.length;
  const totalUsers = users.length;
  const totalOrders = ordersData.total || ordersData.orders?.length || 0;
  const totalRevenue = financialSummary?.totalRevenue ?? 0;
  const avgOrderValue = financialSummary?.averageOrderValue ?? 0;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';
  const totalReviews = reviews.length;

  // Pending stores (unverified)
  const pendingStores = stores.filter((s: { isVerified?: boolean }) => !s.isVerified);

  // Recent activity from orders
  const recentOrders = (ordersData.orders ?? []).slice(0, 5);

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
          value={loading ? '—' : String(totalStores)}
          icon={<Store className="h-5 w-5" />}
          description="lojas cadastradas"
        />
        <StatCard
          title="Usuários Cadastrados"
          value={loading ? '—' : String(totalUsers)}
          icon={<Users className="h-5 w-5" />}
          description="na plataforma"
        />
        <StatCard
          title="Total de Pedidos"
          value={loading ? '—' : String(totalOrders)}
          icon={<ShoppingBag className="h-5 w-5" />}
          description="pedidos registrados"
        />
        <StatCard
          title="Volume Transacionado"
          value={loading ? '—' : formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          description="receita total"
        />
      </div>

      {/* Activity + Pending Stores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyState title="Nenhum pedido" description="Ainda não há pedidos registrados." />
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any, i: number) => (
                  <div
                    key={order.id || i}
                    className="flex items-center gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span className="font-medium text-foreground">
                      Pedido #{order.id?.slice(-6) ?? '—'}
                    </span>
                    <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'warning'}>
                      {order.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {order.user?.fullName ?? 'Anônimo'}
                    </span>
                    <span className="ml-auto font-medium text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              Lojas Pendentes de Aprovação
              <Badge variant="warning" className="ml-2">
                {loading ? '—' : pendingStores.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingStores.length === 0 ? (
              <EmptyState title="Nenhuma pendência" description="Todas as lojas foram aprovadas." />
            ) : (
              <div className="space-y-3">
                {pendingStores.slice(0, 5).map((store: any, i: number) => (
                  <div
                    key={store.id || i}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                        {store.name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{store.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {store.category?.name ?? 'Sem categoria'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {store.createdAt
                          ? new Date(store.createdAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                      <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        Revisar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">
                {loading ? '—' : formatCurrency(avgOrderValue)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Valor médio por pedido
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">
                {loading ? '—' : avgRating}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/ 5.0</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(Number(avgRating)) ? 'text-warning' : 'text-muted'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Baseado em {loading ? '—' : totalReviews} avaliações
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lojas Verificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-foreground">
                {loading ? '—' : stores.filter((s: any) => s.isVerified).length}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                / {totalStores}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? '—' : pendingStores.length} aguardando verificação
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
