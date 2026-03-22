'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { ClipboardList, Search, RefreshCw, Loader2 } from 'lucide-react';
import {
  PageHeader, Card, CardContent, Badge, EmptyState,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@lupa/design-system';

const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($limit: Int, $offset: Int, $action: String, $entityType: String) {
    getAuditLogs(limit: $limit, offset: $offset, action: $action, entityType: $entityType) {
      logs {
        id adminId action entityType entityId details createdAt
      }
      total
    }
  }
`;

const ACTION_BADGE: Record<string, { variant: any; label: string }> = {
  APPROVE_STORE:       { variant: 'success',     label: 'Aprovação de Loja' },
  REJECT_STORE:        { variant: 'destructive',  label: 'Rejeição de Loja' },
  UPDATE_USER_ROLE:    { variant: 'info',         label: 'Alteração de Role' },
  BAN_USER:            { variant: 'warning',      label: 'Suspensão de Utilizador' },
  UNBAN_USER:          { variant: 'success',      label: 'Reactivação de Utilizador' },
  DELETE_USER:         { variant: 'destructive',  label: 'Eliminação de Conta' },
  UPDATE_SETTINGS:     { variant: 'secondary',    label: 'Actualização de Config.' },
  PROCESS_PAYOUT:      { variant: 'success',      label: 'Payout Processado' },
  PROCESS_ALL_PAYOUTS: { variant: 'success',      label: 'Payouts em Massa' },
};

const ENTITY_TYPES = ['', 'USER', 'STORE', 'PAYOUT', 'SETTINGS'];
const ACTIONS = ['', ...Object.keys(ACTION_BADGE)];

const limit = 50;

export default function AuditLogPage() {
  const [offset, setOffset]           = useState(0);
  const [actionFilter, setAction]     = useState('');
  const [entityFilter, setEntity]     = useState('');
  const [search, setSearch]           = useState('');

  const { data, loading, refetch } = useQuery<any>(GET_AUDIT_LOGS, {
    variables: {
      limit,
      offset,
      action: actionFilter || undefined,
      entityType: entityFilter || undefined,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const logs: any[]  = data?.getAuditLogs?.logs ?? [];
  const total: number = data?.getAuditLogs?.total ?? 0;

  const filtered = search
    ? logs.filter((l) =>
        l.action.includes(search.toUpperCase()) ||
        l.entityId?.includes(search) ||
        l.adminId?.includes(search),
      )
    : logs;

  const parseDetails = (details: string | null): string => {
    if (!details) return '—';
    try {
      const obj = JSON.parse(details);
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria"
        description="Registo de todas as acções administrativas"
        actions={
          <button onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:border-primary/40 transition-colors">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por acção, ID, admin…"
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <select value={actionFilter} onChange={(e) => { setAction(e.target.value); setOffset(0); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
              <option value="">Todas as acções</option>
              {ACTIONS.filter(Boolean).map((a) => (
                <option key={a} value={a}>{ACTION_BADGE[a]?.label ?? a}</option>
              ))}
            </select>
            <select value={entityFilter} onChange={(e) => { setEntity(e.target.value); setOffset(0); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
              <option value="">Todos os tipos</option>
              {ENTITY_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> A carregar logs…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-8 w-8" />}
              title="Nenhum registo encontrado"
              description="Nenhuma acção administrativa registada ainda." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Acção</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>ID Entidade</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log: any) => {
                    const badge = ACTION_BADGE[log.action] ?? { variant: 'secondary' as const, label: log.action };
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString('pt-AO', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.entityType}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {log.entityId ? log.entityId.slice(0, 8) + '…' : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {parseDetails(log.details)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  <span>{offset + 1}–{Math.min(offset + limit, total)} de {total}</span>
                  <div className="flex gap-2">
                    <button disabled={offset === 0}
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      className="px-3 py-1 rounded border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">
                      Anterior
                    </button>
                    <button disabled={offset + limit >= total}
                      onClick={() => setOffset(offset + limit)}
                      className="px-3 py-1 rounded border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">
                      Seguinte
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
