'use client'

import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold">Pedidos</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Em desenvolvimento</h2>
          <p className="text-gray-500">Listagem de pedidos em construção.</p>
        </div>
      </div>
    </div>
  )
}
ENDFILE && \
cat > users/page.tsx << 'ENDFILE'
'use client'

import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold">Usuários</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Em desenvolvimento</h2>
          <p className="text-gray-500">Gerenciamento de usuários em construção.</p>
        </div>
      </div>
    </div>
  )
}
ENDFILE && \
echo "Arquivos criados!"