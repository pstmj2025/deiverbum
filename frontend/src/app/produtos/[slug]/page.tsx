'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import api from '@/lib/axios';
import { useCartStore } from '@/store/cart';
import { ChevronLeft, ShoppingCart, Truck, Shield, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadProduct();
  }, [params.slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${params.slug}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success('Adicionado ao carrinho!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-dei-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/produtos" className="text-dei-primary hover:underline">
            Voltar para produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/produtos" className="flex items-center gap-2 text-gray-600 hover:text-dei-primary">
            <ChevronLeft className="h-4 w-4" />
            Voltar aos produtos
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <span className="text-8xl">📚</span>
              <p className="text-gray-400 mt-4">{product.sku}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.condition === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.condition === 'NEW' ? 'Novo' : 'Usado'}
              </span>
              {product.featured && (
                <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-dei-primary/10 text-dei-primary">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="text-3xl font-serif font-bold">{product.name}</h1>

            {product.author && (
              <p className="text-gray-600">por {product.author}</p>
            )}

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-dei-primary">
                R$ {Number(product.price).toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">
                  R$ {Number(product.comparePrice).toFixed(2)}
                </span>
              )}
            </div>

            {product.stock > 0 ? (
              <p className="text-green-600 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Em estoque ({product.stock} unidades)
              </p>
            ) : (
              <p className="text-red-500">Fora de estoque</p>
            )}

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Book Details */}
            {(product.isbn13 || product.publisher || product.year || product.pages) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Detalhes do livro</h3>
                {product.isbn13 && <p className="text-sm text-gray-600">ISBN: {product.isbn13}</p>}
                {product.publisher && <p className="text-sm text-gray-600">Editora: {product.publisher}</p>}
                {product.year && <p className="text-sm text-gray-600">Ano: {product.year}</p>}
                {product.pages && <p className="text-sm text-gray-600">Páginas: {product.pages}</p>}
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-dei-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-dei-primary" />
                Frete grátis acima de R$ 200
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-dei-primary" />
                Pagamento seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
