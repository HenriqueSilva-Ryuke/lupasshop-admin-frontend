'use client';

import { useQuery, gql } from '@apollo/client';
import { DollarSign, Wallet, CreditCard, Clock, Download, ArrowUpRight } from 'lucide-react';
import { PageHeader, StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Separator } from '@lupa/design-system';
import { formatCurrency } from '@lupa/design-system/utils';

const FINANCIAL_OVERVIEW = gql`
  query FinancialOverview {
    financialOverview { totalRevenue totalOrders platformFees pendingPayouts }
  }
`;

export default function AdminFinancesPage() {
  const { loading } = useQuery(FINANCIAL_OVERVIEW, { errorPolicy: 'ignore' });

  return (
    <div className="space-y-6">
      <PageHeader title="Visão Financeira" description="Acompanhe receitas, taxas e pagamentos da plataforma"
        actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" />Exportar Relatório</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Receita Total" value={loading ? '—' : formatCurrency(15420000)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: 18, isPositive: true }} description="vs. mês anterior" />
        <StatCard title="Taxas da Plataforma" value={loading ? '—' : formatCurrency(1542000)} icon={<Wallet className="h-5 w-5" />} trend={{ value: 12, isPositive: true }} description="10% de comissão" />
        <StatCard title="Pagamentos Pendentes" value={loading ? '—' : formatCurrency(3250000)} icon={<Clock className="h-5 w-5" />} description="42 vendedores aguardando" />
        <StatCard title="Volume de Transações" value={loading ? '—' : '4.520'} icon={<CreditCard className="h-5 w-5" />} trend={{ value: 23, isPositive: true }} description="transações este mês" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Receita Mensal</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'Janeiro', revenue: 12500000, growth: 15 },
                { month: 'Fevereiro', revenue: 14200000, growth: 13.6 },
                { month: 'Março', revenue: 15420000, growth: 8.6 },
              ].map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.month} 2026</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                  <span className="flex items-center text-xs font-medium text-success">
                    <ArrowUpRight className="h-3 w-3" />{item.growth}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Resumo de Payouts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processados</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(11200000)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pendentes</span>
                <span className="text-sm font-semibold text-warning">{formatCurrency(3250000)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Retidos</span>
                <span className="text-sm font-semibold text-destructive">{formatCurrency(970000)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm text-foreground">Total</span>
                <span className="text-sm text-foreground">{formatCurrency(15420000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transações Recentes</CardTitle>
            <Button variant="ghost" size="sm">Ver todas</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Loja</TableHead><TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'TXN-4523', store: 'Tech Zone Angola', type: 'Venda', amount: 45000, status: 'completed', date: '07 Fev 2026' },
                { id: 'TXN-4522', store: 'Moda Luanda', type: 'Payout', amount: -120000, status: 'processing', date: '07 Fev 2026' },
                { id: 'TXN-4521', store: 'Casa & Decoração', type: 'Venda', amount: 78500, status: 'completed', date: '06 Fev 2026' },
                { id: 'TXN-4520', store: 'Sabores de Angola', type: 'Reembolso', amount: -15000, status: 'completed', date: '06 Fev 2026' },
                { id: 'TXN-4519', store: 'Tech Express AO', type: 'Venda', amount: 230000, status: 'completed', date: '05 Fev 2026' },
              ].map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{txn.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{txn.store}</TableCell>
                  <TableCell>
                    <Badge variant={txn.type === 'Venda' ? 'success' : txn.type === 'Payout' ? 'info' : 'warning'}>{txn.type}</Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${txn.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {txn.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(txn.amount))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'completed' ? 'success' : 'warning'}>
                      {txn.status === 'completed' ? 'Concluído' : 'Processando'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{txn.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
