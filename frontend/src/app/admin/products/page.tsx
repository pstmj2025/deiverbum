'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import api from '@/lib/axios'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
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

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products?.data || [])
    } catch (err) {
      console.log('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors')
      setVendors(res.data.vendors || [])
    } catch (err) {
      console.log('Erro ao carregar vendors:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      })
      setMessage('Produto criado com sucesso!')
      setFormData({ name: '', sku: '', price: '', stock: '', vendorId: '', description: '' })
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setMessage('Erro ao criar produto. Verifique os dados.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold">Produtos</h1>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Novo Produto'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do Produto *"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="SKU *"
                required
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="number"
                placeholder="Preço *"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="number"
                placeholder="Estoque *"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                className="border p-3 rounded-lg"
              >
                <option value="">Selecione a Loja Parceira</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border p-3 rounded-lg col-span-2"
                rows={3}
              />
              <button type="submit" className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 col-span-2">
                Criar Produto
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum produto cadastrado</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Novo Produto" para começar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600">SKU: {product.sku}</p>
                  <p className="text-gray-500 text-sm">Estoque: {product.stock} unidades</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-green-600">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.vendor?.name || 'Sem loja'}
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
