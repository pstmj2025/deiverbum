'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice, getConditionLabel } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const conditionColor = {
    NEW: 'bg-green-100 text-green-800',
    LIKE_NEW: 'bg-blue-100 text-blue-800',
    GOOD: 'bg-yellow-100 text-yellow-800',
    ACCEPTABLE: 'bg-gray-100 text-gray-800',
  }[product.condition];

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
          
          {/* Condition Badge */}
          <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${conditionColor}`}>
            {getConditionLabel(product.condition)}
          </span>

          {/* Discount Badge */}
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-dei-primary transition">
            {product.name}
          </h3>
        </Link>

        {product.author && (
          <p className="text-sm text-gray-600 mb-2">{product.author}</p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-dei-primary">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-md font-medium transition ${
            product.stock === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-dei-primary text-white hover:bg-opacity-90'
          }`}
        >
          <ShoppingCart size={18} />
          {product.stock === 0 ? 'Indisponível' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}
