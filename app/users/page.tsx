'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Search, Shield, UserCog, Users as UsersIcon, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Avatar,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@lupa/design-system';
import { cn, formatDate } from '@lupa/design-system/utils';

const LIST_USERS = gql`
  query ListUsers($role: UserRole, $limit: Int, $offset: Int) {
    listUsers(role: $role, limit: $limit, offset: $offset) {
      id
      email
      fullName
      role
      createdAt
    }
  }
`;

const roleBadgeMap: Record<string, { variant: any; label: string }> = {
  BUYER: { variant: 'info', label: 'Comprador' },
  SELLER: { variant: 'success', label: 'Vendedor' },
  ADMIN: { variant: 'warning', label: 'Administrador' },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const { data, loading } = useQuery<any>(LIST_USERS, {
    variables: {
      role: roleFilter || undefined,
      limit: 50,
      offset: 0,
    },
    errorPolicy: 'ignore',
  });

  const users = data?.listUsers || [];
  const filteredUsers = users.filter(
    (u: any) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Usuários"
        description="Visualize e gerencie todos os usuários da plataforma"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total de Usuários"
          value={loading ? '—' : users.length}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Vendedores"
          value={loading ? '—' : users.filter((u: any) => u.role === 'SELLER').length}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          title="Administradores"
          value={loading ? '—' : users.filter((u: any) => u.role === 'ADMIN').length}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="h-8 w-8" />}
              title="Nenhum usuário encontrado"
              description={search ? 'Tente ajustar os filtros de busca.' : 'Nenhum usuário cadastrado.'}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => {
                  const roleInfo = roleBadgeMap[user.role] || roleBadgeMap.BUYER;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={user.fullName?.[0] || user.email?.[0] || '?'}
                            size="sm"
                          />
                          <span className="font-medium text-foreground">
                            {user.fullName || 'Sem nome'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt
                          ? formatDate(new Date(parseInt(user.createdAt)))
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Gerenciar">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Permissões">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
