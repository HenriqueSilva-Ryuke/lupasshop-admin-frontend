'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { CheckCircle, XCircle, Search, Store, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Modal,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Avatar,
} from '@lupa/design-system';
import { formatDate } from '@lupa/design-system/utils';

const GET_PENDING_STORES = gql`
  query GetPendingStores {
    getPendingStores(limit: 50) {
      id
      name
      description
      createdAt
      approvalStatus
      ownerId
      location
    }
  }
`;

const APPROVE_STORE = gql`
  mutation ApproveStore($id: ID!, $input: ApproveStoreInput) {
    approveStore(id: $id, input: $input) {
      id
      approvalStatus
      approvedAt
    }
  }
`;

const REJECT_STORE = gql`
  mutation RejectStore($id: ID!, $input: RejectStoreInput!) {
    rejectStore(id: $id, input: $input) {
      id
      approvalStatus
      rejectedAt
    }
  }
`;

export default function StoresPage() {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, refetch } = useQuery<any>(GET_PENDING_STORES, {
    errorPolicy: 'ignore',
  });
  const [approveStore, { loading: approving }] = useMutation(APPROVE_STORE);
  const [rejectStore, { loading: rejecting }] = useMutation(REJECT_STORE);

  const handleApprove = async () => {
    if (!selectedStore) return;
    try {
      await approveStore({
        variables: {
          id: selectedStore.id,
          input: approvalNotes ? { approvalNotes } : undefined,
        },
      });
      toast.success('Loja aprovada com sucesso!');
      closeModal();
      refetch();
    } catch {
      toast.error('Erro ao aprovar loja');
    }
  };

  const handleReject = async () => {
    if (!selectedStore) return;
    if (!approvalNotes.trim()) {
      toast.error('Motivo da rejeição é obrigatório');
      return;
    }
    try {
      await rejectStore({
        variables: { id: selectedStore.id, input: { approvalNotes } },
      });
      toast.success('Loja rejeitada');
      closeModal();
      refetch();
    } catch {
      toast.error('Erro ao rejeitar loja');
    }
  };

  const closeModal = () => {
    setSelectedStore(null);
    setModalAction(null);
    setApprovalNotes('');
  };

  const stores = data?.getPendingStores || [];
  const filteredStores = stores.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovação de Lojas"
        description="Analise e aprove novas solicitações de parceiros"
        actions={
          <Badge variant="warning">{stores.length} pendentes</Badge>
        }
      />

      <Card>
        <CardContent className="p-0">
          {/* Search bar */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar loja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <EmptyState
              icon={<Store className="h-8 w-8" />}
              title="Nenhuma solicitação pendente"
              description="Todas as lojas foram processadas."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={store.name?.[0] || 'L'} size="sm" />
                        <span className="font-medium text-foreground">{store.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {store.description || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {store.location || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {store.createdAt
                        ? formatDate(new Date(parseInt(store.createdAt)))
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStore(store);
                            setModalAction('reject');
                          }}
                          title="Rejeitar"
                        >
                          <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStore(store);
                            setModalAction('approve');
                          }}
                          title="Aprovar"
                        >
                          <CheckCircle className="h-5 w-5 text-success" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval/Rejection Modal */}
      <Modal
        open={!!modalAction}
        onClose={closeModal}
        title={
          modalAction === 'approve'
            ? `Aprovar "${selectedStore?.name}"`
            : `Rejeitar "${selectedStore?.name}"`
        }
        description={
          modalAction === 'approve'
            ? 'A loja será ativada e poderá começar a vender.'
            : 'Informe o motivo da rejeição. O vendedor será notificado.'
        }
      >
        <div className="space-y-4">
          <Textarea
            label={modalAction === 'approve' ? 'Notas (opcional)' : 'Motivo da rejeição *'}
            placeholder={
              modalAction === 'approve'
                ? 'Observações para o registro interno...'
                : 'Explique o motivo da rejeição...'
            }
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            {modalAction === 'approve' ? (
              <Button
                variant="success"
                onClick={handleApprove}
                loading={approving}
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar Loja
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                loading={rejecting}
              >
                <XCircle className="h-4 w-4" />
                Rejeitar Loja
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
