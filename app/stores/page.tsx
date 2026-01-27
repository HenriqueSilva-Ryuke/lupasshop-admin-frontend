'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { CheckCircle, XCircle, Search, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

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
        const [selectedStore, setSelectedStore] = useState<string | null>(null);
    
        const { data, loading, error, refetch } = useQuery(GET_PENDING_STORES);
        const [approveStore] = useMutation(APPROVE_STORE);
        const [rejectStore] = useMutation(REJECT_STORE);

    const handleApprove = async (id: string) => {
        try {
                        await approveStore({
                                variables: { 
                                    id, 
                                    input: approvalNotes ? { approvalNotes } : undefined 
                                }
            });
            toast.success('Loja aprovada com sucesso!');
                        setSelectedStore(null);
                        setApprovalNotes('');
            refetch();
        } catch (err) {
            toast.error('Erro ao aprovar loja');
        }
    };

    const handleReject = async (id: string) => {
                if (!approvalNotes) {
                    toast.error('Notas de rejeição são obrigatórias');
                    return;
                }
        
                try {
                        await rejectStore({
                                variables: { id, input: { approvalNotes } }
                        });
                        toast.success('Loja rejeitada');
                        setSelectedStore(null);
                        setApprovalNotes('');
        if (confirm('Deseja rejeitar e excluir esta solicitação?')) {
            // Verify deletion mutation existence? 
            // Skipping for safety in this iteration.
            toast.info('Rejeição enviará email (Simulado)');
        }
    };

    if (loading) return <div>Carregando solicitações...</div>;

    const stores = data?.listStores || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Aprovação de Lojas</h1>
                    <p className="text-slate-500">Analise e aprove novas solicitações de parceiros</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    {/* Filter Placeholder */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar loja..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Nome da Loja</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Data Solicitação</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stores.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    Nenhuma solicitação pendente.
                                </td>
                            </tr>
                        ) : (
                            stores.map((store: any) => (
                                <tr key={store.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{store.name}</td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{store.description || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(parseInt(store.createdAt)).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleReject(store.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="Rejeitar"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(store.id)}
                                                className="p-2 text-green-500 hover:bg-green-50 rounded"
                                                title="Aprovar"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
