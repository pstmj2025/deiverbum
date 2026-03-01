'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Store, Plus, Trash2 } from 'lucide-react'
import api from '@/lib/axios'

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    commissionRate: 10,
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors')
      setVendors(res.data.vendors || [])
    } catch (err) {
      console.log('Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/vendors', formData)
      setMessage('Loja criada com sucesso!')
      setFormData({ name: '', email: '', phone: '', document: '', commissionRate: 10 })
      setShowForm(false)
      fetchVendors()
    } catch (err) {
      setMessage('Erro ao criar loja. Verifique se está logado como ADMIN.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold">Lojas Parceiras</h1>
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
          {showForm ? 'Cancelar' : 'Nova Loja'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Loja</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome da Loja *"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="email"
                placeholder="E-mail *"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="CNPJ/CPF"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                type="number"
                placeholder="Comissão %"
                value={formData.commissionRate}
                onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value)})}
                className="border p-3 rounded-lg"
              />
              <button type="submit" className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
                Criar Loja
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma loja cadastrada</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Nova Loja" para começar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <p className="text-gray-600">{vendor.email}</p>
                  {vendor.phone && <p className="text-gray-500 text-sm">{vendor.phone}</p>}
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {vendor.commissionRate}% comissão
                  </span>
                  <p className={`text-sm mt-2 ${vendor.active ? 'text-green-600' : 'text-red-600'}`}>
                    {vendor.active ? 'Ativa' : 'Inativa'}
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
