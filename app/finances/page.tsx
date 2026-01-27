'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, TrendingUp, Store, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FinancialOverview {
  totalRevenue: number;
  totalOrders: number;
  totalStores: number;
  totalUsers: number;
  pendingPayouts: number;
  platformFees: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topStores: Array<{
    storeId: string;
    storeName: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminFinancesPage() {
  const t = useTranslations('admin.finances');
  const [overview, setOverview] = useState<FinancialOverview | null>(null);

  useEffect(() => {
    // Fetch financial overview from GraphQL
    // setOverview(data);
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  if (!overview) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('overview')}</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('overview')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('totalRevenue')}
          value={`${overview.totalRevenue.toFixed(2)} AKZ`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={t('platformFees')}
          value={`${overview.platformFees.toFixed(2)} AKZ`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title={t('pendingPayouts')}
          value={`${overview.pendingPayouts.toFixed(2)} AKZ`}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Total de Lojas"
          value={overview.totalStores}
          icon={Store}
          color="bg-purple-500"
        />
        <StatCard
          title="Total de Usuários"
          value={overview.totalUsers}
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          title="Total de Pedidos"
          value={overview.totalOrders}
          icon={TrendingUp}
          color="bg-pink-500"
        />
      </div>

      {/* Revenue by Month Chart */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">{t('revenueByMonth')}</h2>
        <div className="space-y-4">
          {overview.revenueByMonth.map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">{month.month}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div
                  className="bg-primary rounded-full h-8 flex items-center justify-end px-4"
                  style={{
                    width: `${(month.revenue / overview.totalRevenue) * 100}%`,
                  }}
                >
                  <span className="text-white text-sm font-medium">
                    {month.revenue.toFixed(2)} AKZ
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-24">{month.orders} pedidos</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stores */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-6">{t('topStores')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Loja</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Pedidos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overview.topStores.map((store, index) => (
                <tr key={store.storeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{store.storeName}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">
                    {store.revenue.toFixed(2)} AKZ
                  </td>
                  <td className="px-6 py-4 text-gray-600">{store.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
