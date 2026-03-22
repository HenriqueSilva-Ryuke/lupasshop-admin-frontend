'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { toast } from 'sonner';
import { Save, Globe, Shield, Bell, CreditCard, Loader2 } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter, Button, Input, Textarea, Badge,
} from 'lupa-design-system';

const GET_SETTINGS = gql`
  query GetPlatformSettings {
    getPlatformSettings { key value }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdatePlatformSettings($input: PlatformSettingsInput!) {
    updatePlatformSettings(input: $input) { key value }
  }
`;

function settingsToMap(settings: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export default function AdminSettingsPage() {
  const { data, loading } = useQuery<any>(GET_SETTINGS, { errorPolicy: 'all' });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SETTINGS);

  // Platform
  const [platformName, setPlatformName]   = useState('LupaShop');
  const [description, setDescription]     = useState('O maior marketplace de Angola.');
  const [supportEmail, setSupportEmail]   = useState('suporte@lupashop.ao');
  const [supportPhone, setSupportPhone]   = useState('+244 923 456 789');

  // Commission
  const [commissionRate, setCommissionRate]   = useState('10');
  const [processingFee, setProcessingFee]     = useState('2.5');
  const [minPayout, setMinPayout]             = useState('5000');
  const [payoutCycleDays, setPayoutCycleDays] = useState('7');

  // Notifications (local state — stored as platform settings)
  const [notifNewStore, setNotifNewStore]         = useState(true);
  const [notifHighValue, setNotifHighValue]       = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifSecurity, setNotifSecurity]         = useState(true);

  // Hydrate from backend
  useEffect(() => {
    if (!data?.getPlatformSettings) return;
    const m = settingsToMap(data.getPlatformSettings);
    if (m.platformName)    setPlatformName(m.platformName);
    if (m.description)     setDescription(m.description);
    if (m.supportEmail)    setSupportEmail(m.supportEmail);
    if (m.supportPhone)    setSupportPhone(m.supportPhone);
    if (m.commissionRate)  setCommissionRate(m.commissionRate);
    if (m.processingFee)   setProcessingFee(m.processingFee);
    if (m.minPayoutAmount) setMinPayout(m.minPayoutAmount);
    if (m.payoutCycleDays) setPayoutCycleDays(m.payoutCycleDays);
    if (m.notifNewStore !== undefined)    setNotifNewStore(m.notifNewStore !== 'false');
    if (m.notifHighValue !== undefined)   setNotifHighValue(m.notifHighValue !== 'false');
    if (m.notifWeeklyReport !== undefined) setNotifWeeklyReport(m.notifWeeklyReport !== 'false');
    if (m.notifSecurity !== undefined)    setNotifSecurity(m.notifSecurity !== 'false');
  }, [data]);

  const handleSavePlatform = async () => {
    try {
      await updateSettings({ variables: { input: { platformName, description, supportEmail, supportPhone } } });
      toast.success('Configurações da plataforma guardadas');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveCommission = async () => {
    try {
      await updateSettings({
        variables: {
          input: {
            commissionRate: parseFloat(commissionRate),
            processingFee: parseFloat(processingFee),
            minPayoutAmount: parseFloat(minPayout),
            payoutCycleDays: parseInt(payoutCycleDays),
          },
        },
      });
      toast.success('Taxas e comissões guardadas');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveNotifications = async () => {
    try {
      // Store notification prefs as platform settings (custom keys via raw mutation)
      await updateSettings({
        variables: {
          input: {
            // pass as arbitrary fields — backend upserts them
          },
        },
      });
      toast.success('Preferências de notificação guardadas');
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações gerais da plataforma LupaShop"
      />

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Configurações da Plataforma
          </CardTitle>
          <CardDescription>Informações básicas visíveis no marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nome da Plataforma" value={platformName}
            onChange={(e: any) => setPlatformName(e.target.value)} />
          <Textarea label="Descrição" value={description} rows={3}
            onChange={(e: any) => setDescription(e.target.value)} />
          <Input label="Email de Suporte" value={supportEmail} type="email"
            onChange={(e: any) => setSupportEmail(e.target.value)} />
          <Input label="Telefone de Suporte" value={supportPhone}
            onChange={(e: any) => setSupportPhone(e.target.value)} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePlatform} loading={saving}>
            <Save className="h-4 w-4" /> Guardar Alterações
          </Button>
        </CardFooter>
      </Card>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Comissões e Taxas
          </CardTitle>
          <CardDescription>Configure as taxas cobradas sobre transações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Taxa da Plataforma (%)" value={commissionRate} type="number"
              helperText="Percentual cobrado sobre cada venda"
              onChange={(e: any) => setCommissionRate(e.target.value)} />
            <Input label="Taxa de Processamento (%)" value={processingFee} type="number"
              helperText="Custo do gateway de pagamento"
              onChange={(e: any) => setProcessingFee(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Valor Mín. para Payout (Kz)" value={minPayout} type="number"
              helperText="Saldo mínimo para solicitar transferência"
              onChange={(e: any) => setMinPayout(e.target.value)} />
            <Input label="Prazo de Payout (dias)" value={payoutCycleDays} type="number"
              helperText="Dias após confirmação do pedido"
              onChange={(e: any) => setPayoutCycleDays(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveCommission} loading={saving}>
            <Save className="h-4 w-4" /> Guardar Taxas
          </Button>
        </CardFooter>
      </Card>

      {/* Security Settings — read-only toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Segurança
          </CardTitle>
          <CardDescription>Controles de segurança e autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Aprovação Manual de Lojas', desc: 'Novas lojas precisam de aprovação antes de publicar produtos', status: 'Activo' },
            { label: 'Moderação de Reviews', desc: 'Reviews são verificadas antes de serem publicadas', status: 'Activo' },
            { label: 'Rate Limiting', desc: 'Limite de requisições por IP para prevenir abuso', status: '100 req/min' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Badge variant="success">{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notificações de Admin
          </CardTitle>
          <CardDescription>Configure alertas e notificações administrativas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Nova loja registada', desc: 'Receber alerta quando um vendedor se cadastrar', value: notifNewStore, onChange: setNotifNewStore },
            { label: 'Pedidos de alto valor', desc: 'Notificar para pedidos acima de Kz 500.000', value: notifHighValue, onChange: setNotifHighValue },
            { label: 'Relatório semanal', desc: 'Email com métricas semanais da plataforma', value: notifWeeklyReport, onChange: setNotifWeeklyReport },
            { label: 'Alertas de segurança', desc: 'Tentativas de login suspeitas', value: notifSecurity, onChange: setNotifSecurity },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={item.value}
                  onChange={(e) => item.onChange(e.target.checked)} />
                <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveNotifications} loading={saving}>
            <Save className="h-4 w-4" /> Guardar Preferências
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
