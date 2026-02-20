'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import api from '@/lib/axios';
import { BookOpen, Search, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?featured=true&limit=8');
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Erro ao carregar produtos em destaque:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, digite seu e-mail');
      return;
    }

    setNewsletterLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Inscrição realizada com sucesso!');
      setEmail('');
    } catch (error) {
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-dei-primary to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Cristão "No princípio era o verbo"
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Livraria e papelaria cristã. Livros novos e usados, artigos de papelaria e presentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/produtos"
                className="px-8 py-3 bg-dei-secondary text-dei-primary rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                Ver Produtos
              </Link>
              <Link
                href="/categorias"
                className="px-8 py-3 bg-white/10 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition"
              >
                Explorar Categorias
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="h-10 w-10 text-dei-primary mb-4" />
              <h3 className="font-semibold text-lg">Livros Novos e Usados</h3>
              <p className="text-gray-600 text-sm">Curadoria cristã e acadêmica</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Search className="h-10 w-10 text-dei-primary mb-4" />
              <h3 className="font-semibold text-lg">Busca Avançada</h3>
              <p className="text-gray-600 text-sm">Procure por título, autor ou ISBN</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="h-10 w-10 text-dei-primary mb-4" />
              <h3 className="font-semibold text-lg">Frete Grátis</h3>
              <p className="text-gray-600 text-sm">Em compras acima de R$ 200</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="h-10 w-10 text-dei-primary mb-4" />
              <h3 className="font-semibold text-lg">Pagamento Seguro</h3>
              <p className="text-gray-600 text-sm">PIX, Boleto e Cartão</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="group p-6 bg-gray-100 rounded-lg text-center hover:bg-dei-primary hover:text-white transition-all"
              >
                <span className="font-semibold">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold">Produtos em Destaque</h2>
            <Link href="/produtos" className="text-dei-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dei-primary rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-serif font-bold mb-4">Receba Novidades</h2>
            <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
              Inscreva-se para receber novidades sobre lançamentos, ofertas exclusivas e novos produtos.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-dei-secondary"
                required
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="px-6 py-3 bg-dei-secondary text-dei-primary rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsletterLoading ? 'Enviando...' : 'Inscrever-se'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
