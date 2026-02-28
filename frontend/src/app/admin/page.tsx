'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Package, ShoppingCart, Users, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/store/auth';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { title: 'Lojas Parceiras', desc: 'Gerenciar vendors', icon: Store, href: '/admin/vendors', admin: true },
    { title: 'Produtos', desc: 'Cadastrar produtos', icon: Package, href: '/admin/products', admin: false },
    { title: 'Pedidos', desc: 'Ver pedidos', icon: ShoppingCart, href: '/admin/orders', admin: false },
    { title: 'Usuários', desc: 'Gerenciar usuários', icon: Users, href: '/admin/users', admin: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.filter(item => !item.admin || isAdmin).map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
