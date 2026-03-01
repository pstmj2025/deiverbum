import Link from 'next/link'

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 hover:underline">← Voltar</Link>
        <h1 className="text-3xl font-bold mt-4 mb-8">Produtos</h1>
        
        <p className="text-gray-600 mb-4">
          Página de cadastro de produtos.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cadastrar Produto</h2>
          <form className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome do Produto" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="text" 
              placeholder="SKU" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="number" 
              placeholder="Preço" 
              step="0.01"
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="number" 
              placeholder="Estoque" 
              className="w-full p-3 border rounded-lg"
            />
            <select className="w-full p-3 border rounded-lg">
              <option value="">Selecione a Loja Parceira</option>
              <option value="1">Loja 1</option>
              <option value="2">Loja 2</option>
            </select>
            <textarea 
              placeholder="Descrição" 
              rows={3}
              className="w-full p-3 border rounded-lg"
            />
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
            >
              Criar Produto
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
