import Link from 'next/link'

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 hover:underline">← Voltar</Link>
        <h1 className="text-3xl font-bold mt-4 mb-8">Usuários</h1>
        <p className="text-gray-600">Gerenciamento de usuários em desenvolvimento.</p>
      </div>
    </div>
  )
}
