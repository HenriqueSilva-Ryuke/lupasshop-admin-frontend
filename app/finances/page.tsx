'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
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

const ADMIN_FINANCIAL_QUERY = gql`
  query AdminFinancial {
    getFinancialSummary {
      totalRevenue
      totalSales
      averageOrderValue
    }
    listOrders(limit: 1000) {
      orders {
        id
        totalAmount
        status
        createdAt
        user {
          fullName
          email
        }
        store {
          name
        }
      }
      total
    }
    listPayouts {
      id
      amount
      status
      createdAt
      store {
        name
      }
    }
  }
`;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary'; label: string }> = {
    COMPLETED: { variant: 'success', label: 'Concluído' },
    DELIVERED: { variant: 'success', label: 'Entregue' },
    PAID: { variant: 'success', label: 'Pago' },
    PENDING: { variant: 'warning', label: 'Pendente' },
    PROCESSING: { variant: 'warning', label: 'Processando' },
    CANCELLED: { variant: 'destructive', label: 'Cancelado' },
    REJECTED: { variant: 'destructive', label: 'Rejeitado' },
  };
  const entry = map[status] ?? { variant: 'secondary' as const, label: status };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export default function FinancesPage() {
  const { data, loading, error } = useQuery<any>(ADMIN_FINANCIAL_QUERY, {
    errorPolicy: 'all',
  });

  const financial = data?.getFinancialSummary;
  const ordersData = data?.listOrders ?? { orders: [], total: 0 };
  const orders = ordersData.orders ?? [];
  const payouts = data?.listPayouts ?? [];

  // Computed values
  const totalRevenue = financial?.totalRevenue ?? 0;
  const platformFees = totalRevenue * 0.1; // 10% platform commission
  const netRevenue = totalRevenue - platformFees;
  const totalSales = financial?.totalSales ?? orders.length;
  const avgOrder = financial?.averageOrderValue ?? 0;
  const pendingPayouts = payouts
    .filter((p: any) => p.status === 'PENDING')
    .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

  // Recent transactions from orders
  const recentTransactions = orders.slice(0, 10);

  // Payout summary
  const paidPayouts = payouts.filter((p: any) => p.status === 'PAID' || p.status === 'COMPLETED');
  const pendingPayoutList = payouts.filter((p: any) => p.status === 'PENDING');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finanças"
        description="Visão financeira completa do marketplace"
      />

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={loading ? '—' : formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          description="volume total transacionado"
        />
        <StatCard
          title="Comissão da Plataforma (10%)"
          value={loading ? '—' : formatCurrency(platformFees)}
          icon={<TrendingUp className="h-5 w-5" />}
          description="receita da plataforma"
        />
        <StatCard
          title="Payouts Pendentes"
          value={loading ? '—' : formatCurrency(pendingPayouts)}
          icon={<Wallet className="h-5 w-5" />}
          description={`${pendingPayoutList.length} pagamentos pendentes`}
        />
        <StatCard
          title="Total de Vendas"
          value={loading ? '—' : String(totalSales)}
          icon={<ArrowUpRight className="h-5 w-5" />}
          description={`Ticket médio: ${formatCurrency(avgOrder)}`}
        />
      </div>

      {/* Transactions + Payouts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transactions table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <EmptyState title="Sem transações" description="Nenhuma transação registrada." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Pedido</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Loja</th>
                      <th className="pb-3 font-medium">Valor</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentTransactions.map((order: any) => (
                      <tr key={order.id} className="transition-colors hover:bg-accent">
                        <td className="py-3 font-medium text-foreground">
                          #{order.id?.slice(-6) ?? '—'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {order.user?.fullName ?? 'Anônimo'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {order.store?.name ?? '—'}
                        </td>
                        <td className="py-3 font-medium text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payouts summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <EmptyState title="Sem payouts" description="Nenhum payout registrado." />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pagos</span>
                    <Badge variant="success">{paidPayouts.length}</Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {formatCurrency(
                      paidPayouts.reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pendentes</span>
                    <Badge variant="warning">{pendingPayoutList.length}</Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {formatCurrency(pendingPayouts)}
                  </p>
                </div>

                <h4 className="mt-4 text-sm font-medium text-muted-foreground">
                  Últimos Payouts
                </h4>
                <div className="space-y-2">
                  {payouts.slice(0, 5).map((payout: any) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {payout.store?.name ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.createdAt
                            ? new Date(payout.createdAt).toLocaleDateString('pt-BR')
                            : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatCurrency(payout.amount)}
                        </p>
                        <StatusBadge status={payout.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
