'use client';

import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Search, Shield, UserCog, Users as UsersIcon, ShieldCheck,
  ShoppingBag, X, ChevronDown, AlertTriangle, Trash2, RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  PageHeader, Card, CardContent, Badge, Button,
  EmptyState, Avatar, StatCard,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@lupa/design-system';
import { formatDate } from '@lupa/design-system/utils';

const LIST_USERS = gql`
  query GetAllUsers($role: Role, $search: String, $limit: Int, $offset: Int) {
    getAllUsers(role: $role, search: $search, limit: $limit, offset: $offset) {
      users { id email fullName role createdAt }
      total hasMore
    }
  }
`;

const GET_USER_ACTIVITY = gql`
  query GetUserActivity($userId: ID!) {
    getUserActivity(userId: $userId)
  }
`;

const UPDATE_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $input: UpdateUserRoleInput!) {
    updateUserRole(userId: $userId, input: $input) { id role fullName }
  }
`;

const BAN_USER = gql`
  mutation BanUser($userId: ID!, $input: BanUserInput!) {
    banUser(userId: $userId, input: $input)
  }
`;

const UNBAN_USER = gql`
  mutation UnbanUser($userId: ID!) {
    unbanUser(userId: $userId)
  }
`;

const DELETE_USER = gql`
  mutation DeleteUserAccount($userId: ID!) {
    deleteUserAccount(userId: $userId)
  }
`;

const roleBadgeMap: Record<string, { variant: any; label: string }> = {
  BUYER:  { variant: 'info',    label: 'Comprador' },
  SELLER: { variant: 'success', label: 'Vendedor' },
  ADMIN:  { variant: 'warning', label: 'Administrador' },
};

type ModalType = 'details' | 'role' | 'ban' | 'delete' | null;

export default function AdminUsersPage() {
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [offset, setOffset]         = useState(0);
  const limit = 50;

  // Modal state
  const [modal, setModal]               = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole]           = useState('');
  const [banReason, setBanReason]       = useState('');

  const { data, loading, refetch } = useQuery<any>(LIST_USERS, {
    variables: { role: roleFilter || undefined, search: search || undefined, limit, offset },
    errorPolicy: 'ignore',
  });

  const [loadActivity, { data: activityData, loading: activityLoading }] =
    useLazyQuery<any>(GET_USER_ACTIVITY, { errorPolicy: 'ignore' });

  const [updateRole,  { loading: updatingRole }]  = useMutation(UPDATE_ROLE);
  const [banUser,     { loading: banning }]       = useMutation(BAN_USER);
  const [unbanUser,   { loading: unbanning }]     = useMutation(UNBAN_USER);
  const [deleteUser,  { loading: deleting }]      = useMutation(DELETE_USER);

  const users: any[] = data?.getAllUsers?.users ?? [];
  const total: number = data?.getAllUsers?.total ?? 0;

  const openModal = (type: ModalType, user: any) => {
    setSelectedUser(user);
    setModal(type);
    setNewRole(user.role);
    setBanReason('');
    if (type === 'details') loadActivity({ variables: { userId: user.id } });
  };
  const closeModal = () => { setModal(null); setSelectedUser(null); };

  const handleUpdateRole = async () => {
    try {
      await updateRole({ variables: { userId: selectedUser.id, input: { role: newRole } } });
      toast.success(`Role actualizado para ${newRole}`);
      closeModal(); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleBan = async () => {
    if (!banReason.trim()) { toast.error('Motivo obrigatório'); return; }
    try {
      await banUser({ variables: { userId: selectedUser.id, input: { reason: banReason } } });
      toast.success(`${selectedUser.fullName} suspenso`);
      closeModal(); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUnban = async (user: any) => {
    try {
      await unbanUser({ variables: { userId: user.id } });
      toast.success(`${user.fullName} reactivado`);
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    try {
      await deleteUser({ variables: { userId: selectedUser.id } });
      toast.success(`Conta de ${selectedUser.fullName} eliminada`);
      closeModal(); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const activity = activityData?.getUserActivity;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Utilizadores"
        description="Visualize, edite roles e gira contas de utilizadores"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total de Utilizadores" value={loading ? '—' : String(total)}
          icon={<UsersIcon className="h-5 w-5" />} />
        <StatCard title="Vendedores"
          value={loading ? '—' : String(users.filter((u) => u.role === 'SELLER').length)}
          icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard title="Administradores"
          value={loading ? '—' : String(users.filter((u) => u.role === 'ADMIN').length)}
          icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                placeholder="Pesquisar por nome ou email..."
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <select value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="">Todos os papéis</option>
              <option value="BUYER">Compradores</option>
              <option value="SELLER">Vendedores</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={<UsersIcon className="h-8 w-8" />}
              title="Nenhum utilizador encontrado"
              description={search ? 'Ajuste os filtros.' : 'Nenhum utilizador cadastrado.'} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Registo</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => {
                    const roleInfo = roleBadgeMap[user.role] ?? roleBadgeMap.BUYER;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar fallback={user.fullName?.[0] || user.email?.[0] || '?'} size="sm" />
                            <span className="font-medium text-foreground">{user.fullName || 'Sem nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-AO') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Ver detalhes"
                              onClick={() => openModal('details', user)}>
                              <UserCog className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Alterar role"
                              onClick={() => openModal('role', user)}>
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Suspender"
                              onClick={() => openModal('ban', user)}>
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Eliminar conta"
                              onClick={() => openModal('delete', user)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  <span>A mostrar {offset + 1}–{Math.min(offset + limit, total)} de {total}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={offset === 0}
                      onClick={() => setOffset(Math.max(0, offset - limit))}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={offset + limit >= total}
                      onClick={() => setOffset(offset + limit)}>Seguinte</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}

      {/* Details modal */}
      {modal === 'details' && selectedUser && (
        <ModalOverlay onClose={closeModal} title={`Detalhes — ${selectedUser.fullName}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Email" value={selectedUser.email} />
              <Field label="Papel" value={roleBadgeMap[selectedUser.role]?.label} />
              <Field label="Registo" value={new Date(selectedUser.createdAt).toLocaleDateString('pt-AO')} />
              <Field label="ID" value={selectedUser.id.slice(0, 8) + '…'} />
            </div>
            {activityLoading && <p className="text-sm text-muted-foreground">A carregar actividade…</p>}
            {activity && (
              <div className="grid grid-cols-3 gap-3">
                <StatMini label="Pedidos" value={activity.totalOrders} />
                <StatMini label="Reviews" value={activity.totalReviews} />
                <StatMini label="Lojas" value={activity.totalStores} />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { closeModal(); openModal('role', selectedUser); }}>
                <Shield className="h-4 w-4" /> Alterar Role
              </Button>
              <Button variant="outline" onClick={() => { closeModal(); openModal('ban', selectedUser); }}
                className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <AlertTriangle className="h-4 w-4" /> Suspender
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Role modal */}
      {modal === 'role' && selectedUser && (
        <ModalOverlay onClose={closeModal} title={`Alterar Role — ${selectedUser.fullName}`}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Role actual: <strong>{roleBadgeMap[selectedUser.role]?.label}</strong></p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
              <option value="BUYER">Comprador</option>
              <option value="SELLER">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleUpdateRole} loading={updatingRole} disabled={newRole === selectedUser.role}>
                Confirmar
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Ban modal */}
      {modal === 'ban' && selectedUser && (
        <ModalOverlay onClose={closeModal} title={`Suspender — ${selectedUser.fullName}`}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              O utilizador será suspenso e não poderá aceder à plataforma.
            </div>
            <div>
              <label className="text-sm font-medium">Motivo da suspensão *</label>
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3}
                placeholder="Descreva o motivo…"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleBan} loading={banning}
                className="bg-orange-500 hover:bg-orange-600 text-white">
                Suspender Conta
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Delete modal */}
      {modal === 'delete' && selectedUser && (
        <ModalOverlay onClose={closeModal} title={`Eliminar Conta — ${selectedUser.fullName}`}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Esta acção é irreversível. Todos os dados do utilizador serão eliminados permanentemente.
            </div>
            <p className="text-sm">Tem a certeza que quer eliminar a conta de <strong>{selectedUser.fullName}</strong>?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleDelete} loading={deleting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Eliminar Definitivamente
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
      <p className="font-medium text-foreground">{value ?? '—'}</p>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
