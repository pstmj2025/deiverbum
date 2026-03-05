'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import api from '@/lib/axios'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    vendorId: '',
    description: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchVendors()
  }, [])

  // Debug: tentar buscar sem filtros
  const fetchDebug = async () => {
    try {
      const res = await api.get('/products?status=ACTIVE')
      console.log('Produtos ativos:', res.data)
    } catch (err) {
      console.log('Erro debug:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/products?status=ACTIVE')
      console.log('Resposta API:', res.data)
      setProducts(res.data.products?.data || res.data || [])
      setError('')
    } catch (err: any) {
      setError('Erro ao carregar produtos: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors')
      console.log('Resposta vendors:', res.data)
      // A API retorna { success: true, vendors: [...] }
      const vendorsData = res.data?.vendors
      if (Array.isArray(vendorsData)) {
        setVendors(vendorsData)
      } else {
        console.warn('Vendors não é um array:', vendorsData)
        setVendors([])
      }
    } catch (err: any) {
      console.log('Erro ao carregar vendors:', err)
      setVendors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação
    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      setMessage('❌ Preencha todos os campos obrigatórios (Nome, SKU, Preço, Estoque)')
      return
    }
    if (!formData.vendorId) {
      setMessage('❌ Selecione uma Loja Parceira')
      return
    }
    
    console.log('Enviando:', formData)
    try {
      await api.post('/products', {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      })
      setMessage('✅ Produto criado com sucesso!')
      setFormData({ name: '', sku: '', price: '', stock: '', vendorId: '', description: '' })
      setShowForm(false)
      fetchProducts()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Erro desconhecido'
      const errorDetails = err.response?.data?.message || ''
      setMessage(`❌ Erro: ${errorMsg}${errorDetails ? ' - ' + errorDetails : ''}`)
      console.log('Erro completo:', err.response?.data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-2">Produtos</h1>
        <p className="text-gray-600 mb-6">Gerencie os produtos da loja</p>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Novo Produto'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do Produto *"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="SKU *"
                required
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Preço *"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Estoque *"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                className="p-3 border rounded-lg"
                required
              >
                <option value="">Selecione a Loja Parceira *</option>
                {vendors.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="p-3 border rounded-lg md:col-span-2"
                rows={3}
              />
              <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 md:col-span-2">
                Criar Produto
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-8">Carregando...</p>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum produto cadastrado</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Novo Produto" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600">SKU: {product.sku}</p>
                  <p className="text-gray-500 text-sm">📦 Estoque: {product.stock} unidades</p>
                  {product.vendor?.name && (
                    <p className="text-gray-500 text-sm">🏪 {product.vendor.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <p className={`text-sm mt-2 ${product.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {product.active ? '✅ Ativo' : '📦 Inativo'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
