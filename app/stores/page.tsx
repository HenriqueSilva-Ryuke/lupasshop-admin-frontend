'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  CheckCircle, XCircle, Search, Store, Eye, History,
  Building2, User, MapPin, Calendar, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  PageHeader, Card, CardContent, CardHeader, CardTitle,
  Badge, Button, EmptyState,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Avatar,
} from '@lupa/design-system';

const GET_PENDING_STORES = gql`
  query GetPendingStores {
    getPendingStores(limit: 100) {
      id name description createdAt approvalStatus ownerId location
      owner { fullName email }
      category { name }
    }
  }
`;

const GET_ALL_STORES = gql`
  query GetAllStores($approvalStatus: StoreApprovalStatus) {
    listStores(limit: 200, approvalStatus: $approvalStatus) {
      id name description approvalStatus isVerified createdAt location ownerId
      owner { fullName email }
      category { name }
    }
  }
`;

const APPROVE_STORE = gql`
  mutation ApproveStore($id: ID!, $input: ApproveStoreInput) {
    approveStore(id: $id, input: $input) { id approvalStatus }
  }
`;

const REJECT_STORE = gql`
  mutation RejectStore($id: ID!, $input: RejectStoreInput!) {
    rejectStore(id: $id, input: $input) { id approvalStatus }
  }
`;

type Tab = 'pending' | 'approved' | 'rejected';

export default function StoresPage() {
  const [tab, setTab]               = useState<Tab>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [modalAction, setModalAction]     = useState<'approve' | 'reject' | 'details' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } =
    useQuery<any>(GET_PENDING_STORES, { errorPolicy: 'ignore' });

  const statusMap: Record<Tab, string | undefined> = {
    pending: undefined, // uses getPendingStores
    approved: 'APPROVED',
    rejected: 'REJECTED',
  };

  const { data: allData, loading: allLoading, refetch: refetchAll } =
    useQuery<any>(GET_ALL_STORES, {
      variables: { approvalStatus: statusMap[tab] },
      errorPolicy: 'ignore',
      skip: tab === 'pending',
    });

  const [approveStore, { loading: approving }] = useMutation(APPROVE_STORE);
  const [rejectStore, { loading: rejecting }]  = useMutation(REJECT_STORE);

  const pendingStores: any[] = pendingData?.getPendingStores ?? [];
  const tabStores: any[]     = tab === 'pending' ? pendingStores : (allData?.listStores ?? []);
  const loading = tab === 'pending' ? pendingLoading : allLoading;

  const filtered = tabStores.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (action: typeof modalAction, store: any) => {
    setSelectedStore(store);
    setModalAction(action);
    setApprovalNotes('');
  };
  const closeModal = () => { setSelectedStore(null); setModalAction(null); setApprovalNotes(''); };

  const handleApprove = async () => {
    try {
      await approveStore({
        variables: { id: selectedStore.id, input: approvalNotes ? { approvalNotes } : undefined },
      });
      toast.success(`"${selectedStore.name}" aprovada`);
      closeModal(); refetchPending(); refetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async () => {
    if (!approvalNotes.trim()) { toast.error('Motivo obrigatório'); return; }
    try {
      await rejectStore({
        variables: { id: selectedStore.id, input: { approvalNotes } },
      });
      toast.success(`"${selectedStore.name}" rejeitada`);
      closeModal(); refetchPending(); refetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-primary text-primary'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lojas & Aprovação"
        description="Analise e aprove novas solicitações de parceiros"
        actions={<Badge variant="warning">{pendingStores.length} pendentes</Badge>}
      />

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        <button className={tabClass('pending')} onClick={() => setTab('pending')}>
          Pendentes {pendingStores.length > 0 && <span className="ml-1 rounded-full bg-warning/20 text-warning text-[10px] font-bold px-1.5">{pendingStores.length}</span>}
        </button>
        <button className={tabClass('approved')} onClick={() => setTab('approved')}>
          Aprovadas
        </button>
        <button className={tabClass('rejected')} onClick={() => setTab('rejected')}>
          Rejeitadas
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Pesquisar loja ou proprietário..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Store className="h-8 w-8" />}
              title={tab === 'pending' ? 'Nenhuma solicitação pendente' : 'Nenhuma loja encontrada'}
              description="Todas as lojas foram processadas." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  {tab !== 'pending' && <TableHead>Estado</TableHead>}
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {store.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{store.name}</p>
                          {store.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{store.location}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{store.owner?.fullName ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{store.owner?.email ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {store.category?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString('pt-AO') : '—'}
                    </TableCell>
                    {tab !== 'pending' && (
                      <TableCell>
                        <Badge variant={store.approvalStatus === 'APPROVED' ? 'success' : 'destructive'}>
                          {store.approvalStatus === 'APPROVED' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Ver detalhes"
                          onClick={() => openModal('details', store)}>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        {tab === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" title="Aprovar"
                              onClick={() => openModal('approve', store)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Rejeitar"
                              onClick={() => openModal('reject', store)}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}

      {/* Details */}
      {modalAction === 'details' && selectedStore && (
        <ModalOverlay onClose={closeModal} title={selectedStore.name}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Proprietário" value={selectedStore.owner?.fullName} />
              <Field label="Email" value={selectedStore.owner?.email} />
              <Field label="Categoria" value={selectedStore.category?.name} />
              <Field label="Localização" value={selectedStore.location} />
              <Field label="Estado" value={selectedStore.approvalStatus} />
              <Field label="Registada em" value={selectedStore.createdAt ? new Date(selectedStore.createdAt).toLocaleDateString('pt-AO') : undefined} />
            </div>
            {selectedStore.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm border border-border rounded-lg p-3 bg-muted/20">{selectedStore.description}</p>
              </div>
            )}
            {selectedStore.approvalStatus === 'PENDING' && (
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { closeModal(); openModal('approve', selectedStore); }}>
                  <CheckCircle className="h-4 w-4" /> Aprovar
                </Button>
                <Button className="flex-1" variant="destructive"
                  onClick={() => { closeModal(); openModal('reject', selectedStore); }}>
                  <XCircle className="h-4 w-4" /> Rejeitar
                </Button>
              </div>
            )}
          </div>
        </ModalOverlay>
      )}

      {/* Approve */}
      {modalAction === 'approve' && selectedStore && (
        <ModalOverlay onClose={closeModal} title={`Aprovar — ${selectedStore.name}`}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} rows={3}
                placeholder="Mensagem para o vendedor…"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleApprove} loading={approving}
                className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4" /> Aprovar Loja
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Reject */}
      {modalAction === 'reject' && selectedStore && (
        <ModalOverlay onClose={closeModal} title={`Rejeitar — ${selectedStore.name}`}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo da rejeição *</label>
              <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} rows={4}
                placeholder="Descreva o motivo da rejeição…"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleReject} loading={rejecting} variant="destructive">
                <XCircle className="h-4 w-4" /> Rejeitar Loja
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose, title }: {
  children: React.ReactNode; onClose: () => void; title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card border border-border shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground text-sm">{value ?? '—'}</p>
    </div>
  );
}
