'use client';

import { useState } from 'react';
import { Save, Globe, Shield, Bell, Palette, CreditCard } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Textarea,
  Separator,
  Badge,
} from '@lupa/design-system';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

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
          <Input label="Nome da Plataforma" defaultValue="LupaShop" />
          <Textarea
            label="Descrição"
            defaultValue="O maior marketplace de Angola — conectando compradores e vendedores de todo o país."
            rows={3}
          />
          <Input label="Email de Suporte" defaultValue="suporte@lupashop.ao" type="email" />
          <Input label="Telefone de Suporte" defaultValue="+244 923 456 789" />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Salvar Alterações
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
            <Input
              label="Taxa da Plataforma (%)"
              defaultValue="10"
              type="number"
              helperText="Percentual cobrado sobre cada venda"
            />
            <Input
              label="Taxa de Processamento (%)"
              defaultValue="2.5"
              type="number"
              helperText="Custo do gateway de pagamento"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Valor Mín. para Payout (Kz)"
              defaultValue="5000"
              type="number"
              helperText="Saldo mínimo para solicitar saque"
            />
            <Input
              label="Prazo de Payout (dias)"
              defaultValue="7"
              type="number"
              helperText="Dias após confirmação do pedido"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Salvar Taxas
          </Button>
        </CardFooter>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Segurança
          </CardTitle>
          <CardDescription>Controles de segurança e autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Aprovação Manual de Lojas</p>
              <p className="text-xs text-muted-foreground">
                Novas lojas precisam de aprovação antes de publicar produtos
              </p>
            </div>
            <Badge variant="success">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Moderação de Reviews</p>
              <p className="text-xs text-muted-foreground">
                Reviews são verificadas antes de serem publicadas
              </p>
            </div>
            <Badge variant="success">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Rate Limiting</p>
              <p className="text-xs text-muted-foreground">
                Limite de requisições por IP para prevenir abuso
              </p>
            </div>
            <Badge variant="info">100 req/min</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </CardTitle>
          <CardDescription>Configure alertas e notificações administrativas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Nova loja registrada', desc: 'Receber alerta quando um vendedor se cadastrar' },
            { label: 'Pedidos de alto valor', desc: 'Notificar para pedidos acima de Kz 500.000' },
            { label: 'Relatório semanal', desc: 'Email com métricas semanais da plataforma' },
            { label: 'Alertas de segurança', desc: 'Tentativas de login suspeitas' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
