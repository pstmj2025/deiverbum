'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { BookOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  _count: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dei-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-serif font-bold mb-4">Categorias</h1>
          <p className="text-xl text-gray-200">Explore nossa curadoria cristã</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produtos?category=${category.id}`}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dei-primary/10 rounded-lg flex items-center justify-center group-hover:bg-dei-primary transition">
                    <BookOpen className="h-6 w-6 text-dei-primary group-hover:text-white transition" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{category.name}</h2>
                    <p className="text-sm text-gray-500">{category._count.products} produtos</p>
                  </div>
                </div>
                {category.description && (
                  <p className="text-gray-600 mt-4 text-sm">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
