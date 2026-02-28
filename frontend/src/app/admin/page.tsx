'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Verificar se é admin ou manager
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const isAdmin = user?.role === 'ADMIN';

  const stats = [
    { label: 'Vendas Hoje', value: 'R$ 0,00', icon: DollarSign, trend: '+0%' },
    { label: 'Pedidos', value: '0', icon: ShoppingCart, trend: '0 novos' },
    { label: 'Produtos', value: '0', icon: Package, trend: '0 ativos' },
    { label: 'Clientes', value: '0', icon: Users, trend: '+0 hoje' },
  ];

  const menuItems = [
    { 
      title: 'Lojas Parceiras', 
      description: 'Gerenciar vendors e comissões',
      icon: Store,
      href: '/admin/vendors',
      adminOnly: true 
    },
    { 
      title: 'Produtos', 
      description: 'Cadastrar e gerenciar produtos',
      icon: Package,
      href: '/admin/products',
      adminOnly: false 
    },
    { 
      title: 'Pedidos', 
      description: 'Visualizar e gerenciar pedidos',
      icon: ShoppingCart,
      href: '/admin/orders',
      adminOnly: false 
    },
    { 
      title: 'Usuários', 
      description: 'Gerenciar clientes e permissões',
      icon: Users,
      href: '/admin/users',
      adminOnly: true 
    },
  ];

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MANAGER')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {user?.name} ({user?.role})
              </p>
            </div>
            <Link 
              href="/"
              className="text-dei-primary hover:underline"
            >
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.trend}
                  </p>
                </div>
                <div className="p-3 bg-dei-primary/10 rounded-full">
                  <stat.icon className="h-6 w-6 text-dei-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gerenciamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-dei-primary/10 rounded-lg">
                    <item.icon className="h-6 w-6 text-dei-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-dei-primary transition" />
              </div>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            🚀 Próximos passos
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cadastre suas lojas parceiras (vendors)</li>
            <li>• Adicione produtos e vincule às lojas</li>
            <li>• Configure estoque e preços</li>
            <li>• Monitore vendas e comissões</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
