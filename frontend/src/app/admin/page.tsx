import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <Link href="/admin/vendors" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Lojas Parceiras</h2>
          <p className="text-gray-600">Gerenciar vendors do marketplace</p>
        </Link>
        
        <Link href="/admin/products" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Produtos</h2>
          <p className="text-gray-600">Cadastrar e gerenciar produtos</p>
        </Link>
        
        <Link href="/admin/orders" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <p className="text-gray-600">Visualizar pedidos</p>
        </Link>
        
        <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Usuários</h2>
          <p className="text-gray-600">Gerenciar clientes</p>
        </Link>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">← Voltar para a loja</Link>
      </div>
    </div>
  )
}
