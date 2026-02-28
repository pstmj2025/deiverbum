'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    vendorId: '',
    sku: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
      router.push('/');
      return;
    }
    fetchProducts();
    fetchVendors();
  }, [isAuthenticated, user, router]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      toast.success('Produto criado com sucesso!');
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', stock: '', vendorId: '', sku: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Erro ao criar produto');
    }
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MANAGER')) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Produtos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Novo Produto'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum produto cadastrado</p>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
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
  );
}
