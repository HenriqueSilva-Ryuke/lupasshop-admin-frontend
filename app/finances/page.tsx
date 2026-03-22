'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { DollarSign, TrendingUp, ArrowUpRight, Wallet, Download, Play, CheckCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader, StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, EmptyState, Button,
} from 'lupa-design-system';
import { formatCurrency } from 'lupa-design-system/utils';

const ADMIN_FINANCIAL_QUERY = gql`
  query AdminFinancial {
    getFinancialSummary {
      totalRevenue
      totalSales
      averageOrderValue
    }
    listOrders(limit: 1000) {
      orders {
        id totalAmount status createdAt
        user { fullName email }
        store { name }
      }
      total
    }
    listPayouts {
      id amount status createdAt payoutDate
      store { name }
    }
    getFinancialOverview {
      revenueByMonth { month revenue orders }
      topStores { storeName revenue orders }
    }
  }
`;

const PROCESS_PAYOUT = gql`
  mutation ProcessPayout($payoutId: ID!) {
    processPayout(payoutId: $payoutId)
  }
`;

const PROCESS_ALL_PAYOUTS = gql`
  mutation ProcessAllPendingPayouts {
    processAllPendingPayouts
  }
`;

const STATUS_MAP: Record<string, { variant: any; label: string }> = {
  COMPLETED: { variant: 'success',     label: 'Concluído' },
  DELIVERED: { variant: 'success',     label: 'Entregue' },
  PAID:      { variant: 'success',     label: 'Pago' },
  SHIPPED:   { variant: 'info',        label: 'Enviado' },
  PENDING:   { variant: 'warning',     label: 'Pendente' },
  PROCESSED: { variant: 'success',     label: 'Processado' },
  CANCELLED: { variant: 'destructive', label: 'Cancelado' },
  FAILED:    { variant: 'destructive', label: 'Falhado' },
};

function StatusBadge({ status }: { status: string }) {
  const e = STATUS_MAP[status] ?? { variant: 'secondary' as const, label: status };
  return <Badge variant={e.variant}>{e.label}</Badge>;
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => { const s = String(v ?? ''); return s.includes(',') ? `"${s}"` : s; };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function FinancesPage() {
  const { data, loading, refetch } = useQuery<any>(ADMIN_FINANCIAL_QUERY, { errorPolicy: 'all' });
  const [processPayout, { loading: processingOne }] = useMutation<any>(PROCESS_PAYOUT);
  const [processAll,    { loading: processingAll }] = useMutation<any>(PROCESS_ALL_PAYOUTS);

  const financial   = data?.getFinancialSummary;
  const orders      = data?.listOrders?.orders ?? [];
  const payouts     = data?.listPayouts ?? [];
  const overview    = data?.getFinancialOverview;

  const totalRevenue    = financial?.totalRevenue ?? 0;
  const platformFees    = totalRevenue * 0.1;
  const totalSales      = financial?.totalSales ?? orders.length;
  const avgOrder        = financial?.averageOrderValue ?? 0;
  const pendingPayouts  = payouts.filter((p: any) => p.status === 'PENDING');
  const pendingTotal    = pendingPayouts.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const paidPayouts     = payouts.filter((p: any) => p.status === 'PROCESSED' || p.status === 'PAID' || p.status === 'COMPLETED');

  const handleProcessOne = async (payoutId: string, storeName: string) => {
    try {
      await processPayout({ variables: { payoutId } });
      toast.success(`Payout de "${storeName}" processado`);
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleProcessAll = async () => {
    try {
      const { data: result } = await processAll();
      const count = result?.processAllPendingPayouts ?? 0;
      toast.success(`${count} payout${count !== 1 ? 's' : ''} processado${count !== 1 ? 's' : ''}`);
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleExportOrders = () => {
    const rows = orders.map((o: any) => ({
      id: o.id.slice(-8).toUpperCase(),
      cliente: o.user?.fullName ?? '',
      email: o.user?.email ?? '',
      loja: o.store?.name ?? '',
      valor: Number(o.totalAmount).toFixed(2),
      estado: o.status,
      data: o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-AO') : '',
    }));
    downloadCSV(toCSV(rows), `transacoes_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPayouts = () => {
    const rows = payouts.map((p: any) => ({
      id: p.id.slice(-8).toUpperCase(),
      loja: p.store?.name ?? '',
      valor: Number(p.amount).toFixed(2),
      estado: p.status,
      data: p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-AO') : '',
      dataPagamento: p.payoutDate ? new Date(p.payoutDate).toLocaleDateString('pt-AO') : '',
    }));
    downloadCSV(toCSV(rows), `payouts_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finanças"
        description="Visão financeira completa do marketplace"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportOrders} disabled={loading}>
              <Download className="h-4 w-4" /> Exportar Transacções
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPayouts} disabled={loading}>
              <Download className="h-4 w-4" /> Exportar Payouts
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Receita Total" value={loading ? '—' : formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />} description="volume total transacionado" />
        <StatCard title="Comissão (10%)" value={loading ? '—' : formatCurrency(platformFees)}
          icon={<TrendingUp className="h-5 w-5" />} description="receita da plataforma" />
        <StatCard title="Payouts Pendentes" value={loading ? '—' : formatCurrency(pendingTotal)}
          icon={<Wallet className="h-5 w-5" />}
          description={`${pendingPayouts.length} pagamentos pendentes`} />
        <StatCard title="Total de Vendas" value={loading ? '—' : String(totalSales)}
          icon={<ArrowUpRight className="h-5 w-5" />}
          description={`Ticket médio: ${formatCurrency(avgOrder)}`} />
      </div>

      {/* Revenue by month */}
      {overview?.revenueByMonth?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Receita por Mês</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-28 overflow-x-auto pb-2">
              {overview.revenueByMonth.map((m: any) => {
                const max = Math.max(...overview.revenueByMonth.map((x: any) => x.revenue));
                const pct = max > 0 ? (m.revenue / max) * 100 : 0;
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-[32px] group relative">
                    <div className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all cursor-default"
                      style={{ height: `${Math.max(pct, 2)}%` }} />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {m.month}<br />{formatCurrency(m.revenue)}<br />{m.orders} pedidos
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transactions table */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Transacções Recentes</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : orders.length === 0 ? (
              <EmptyState title="Sem transacções" description="Nenhuma transacção registada." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Pedido</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Loja</th>
                      <th className="pb-3 font-medium">Valor</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 text-right font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 15).map((o: any) => (
                      <tr key={o.id} className="transition-colors hover:bg-accent">
                        <td className="py-3 font-medium">#{o.id?.slice(-6)}</td>
                        <td className="py-3 text-muted-foreground">{o.user?.fullName ?? '—'}</td>
                        <td className="py-3 text-muted-foreground">{o.store?.name ?? '—'}</td>
                        <td className="py-3 font-medium">{formatCurrency(o.totalAmount)}</td>
                        <td className="py-3"><StatusBadge status={o.status} /></td>
                        <td className="py-3 text-right text-muted-foreground">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-AO') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payouts panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payouts</CardTitle>
              {pendingPayouts.length > 0 && (
                <Button size="sm" onClick={handleProcessAll} loading={processingAll}
                  className="text-xs">
                  <CheckCheck className="h-3 w-3" /> Processar Todos
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : payouts.length === 0 ? (
              <EmptyState title="Sem payouts" description="Nenhum payout registado." />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">Pagos</span><Badge variant="success">{paidPayouts.length}</Badge></div>
                    <p className="mt-1 text-base font-bold">{formatCurrency(paidPayouts.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0))}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">Pendentes</span><Badge variant="warning">{pendingPayouts.length}</Badge></div>
                    <p className="mt-1 text-base font-bold">{formatCurrency(pendingTotal)}</p>
                  </div>
                </div>

                {pendingPayouts.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium text-muted-foreground mt-2">Pendentes de processamento</h4>
                    <div className="space-y-2">
                      {pendingPayouts.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-2 text-sm">
                          <div>
                            <p className="font-medium">{p.store?.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(p.amount)}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleProcessOne(p.id, p.store?.name)}
                            loading={processingOne} className="text-xs border-orange-300 text-orange-700">
                            <Play className="h-3 w-3" /> Processar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h4 className="text-sm font-medium text-muted-foreground">Últimos processados</h4>
                <div className="space-y-2">
                  {paidPayouts.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
                      <div>
                        <p className="font-medium">{p.store?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString('pt-AO') : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(p.amount)}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top stores */}
      {overview?.topStores?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Lojas por Receita</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.topStores.map((s: any, i: number) => {
                const max = overview.topStores[0].revenue;
                const pct = max > 0 ? (s.revenue / max) * 100 : 0;
                return (
                  <div key={s.storeId} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{s.storeName}</span>
                        <span className="text-sm font-bold text-primary">{formatCurrency(s.revenue)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
