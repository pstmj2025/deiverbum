'use client'

import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold">Produtos</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Em desenvolvimento
          </h2>
          <p className="text-gray-500">
            Funcionalidade de cadastro de produtos em construção.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Use a API diretamente: POST /api/products
          </p>
        </div>
      </div>
    </div>
  )
}
