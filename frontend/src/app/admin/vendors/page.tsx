import Link from 'next/link'

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 hover:underline">← Voltar</Link>
        <h1 className="text-3xl font-bold mt-4 mb-8">Lojas Parceiras</h1>
        
        <p className="text-gray-600 mb-4">
          Página de cadastro de lojas parceiras (vendors).
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cadastrar Loja</h2>
          <form className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome da Loja" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="email" 
              placeholder="E-mail" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="text" 
              placeholder="Telefone" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="text" 
              placeholder="CNPJ/CPF" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="number" 
              placeholder="Comissão %" 
              defaultValue="10"
              className="w-full p-3 border rounded-lg"
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
            >
              Criar Loja
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
