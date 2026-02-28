'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    commissionRate: 10,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }
    fetchVendors();
  }, [isAuthenticated, user, router]);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors', formData);
      toast.success('Loja criada com sucesso!');
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', document: '', commissionRate: 10 });
      fetchVendors();
    } catch (error) {
      toast.error('Erro ao criar loja');
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lojas Parceiras</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Nova Loja'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Loja</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
            </form>
          </div>
        )}

        <input
          type="text"
          placeholder="Buscar lojas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border rounded-lg mb-6"
        />

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : filteredVendors.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma loja encontrada</p>
        ) : (
          <div className="grid gap-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
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
  );
}
