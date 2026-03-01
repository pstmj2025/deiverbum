'use client'

import Link from 'next/link'
import { Store, Package, ShoppingCart, Users, ArrowRight } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/vendors/">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Store className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-lg">Lojas Parceiras</h2>
                  <p className="text-gray-600 text-sm">Gerenciar vendors</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/admin/products/">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="font-semibold text-lg">Produtos</h2>
                  <p className="text-gray-600 text-sm">Cadastrar produtos</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/admin/orders/">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
                <div>
                  <h2 className="font-semibold text-lg">Pedidos</h2>
                  <p className="text-gray-600 text-sm">Ver pedidos</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/admin/users/">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <h2 className="font-semibold text-lg">Usuários</h2>
                  <p className="text-gray-600 text-sm">Gerenciar usuários</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  )
}
