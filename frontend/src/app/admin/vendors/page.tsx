'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import api from '@/lib/axios';
import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

export default function VendorsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }
    api.get('/vendors').then(res => setVendors(res.data.vendors || []));
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Lojas Parceiras</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
          <p className="text-sm text-gray-500 mt-2">Em breve: cadastro de vendors</p>
        </div>
      </div>
    </div>
  );
}
