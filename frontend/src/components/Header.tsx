'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getTotalItems();

  return (
    <header className="bg-dei-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-dei-secondary">
              DEI VERBUM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-dei-secondary transition">
              Início
            </Link>
            <Link href="/produtos" className="hover:text-dei-secondary transition">
              Produtos
            </Link>
            <Link href="/categorias" className="hover:text-dei-secondary transition">
              Categorias
            </Link>
            <Link href="/sobre" className="hover:text-dei-secondary transition">
              Sobre
            </Link>
          </nav>

          {/* Right side - Cart & Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/carrinho" className="relative p-2 hover:text-dei-secondary transition">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-dei-secondary text-dei-primary font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/conta" className="flex items-center space-x-2 hover:text-dei-secondary transition">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden sm:block px-3 py-1 bg-dei-secondary text-dei-primary rounded-md text-sm font-semibold"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 hover:text-dei-secondary transition"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="py-2 hover:text-dei-secondary">
                Início
              </Link>
              <Link href="/produtos" className="py-2 hover:text-dei-secondary">
                Produtos
              </Link>
              <Link href="/categorias" className="py-2 hover:text-dei-secondary">
                Categorias
              </Link>
              <Link href="/carrinho" className="py-2 hover:text-dei-secondary">
                Carrinho
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/conta" className="py-2 hover:text-dei-secondary">
                    Minha Conta
                  </Link>
                  <button onClick={logout} className="py-2 text-left hover:text-dei-secondary">
                    Sair
                  </button>
                </>
              ) : (
                <Link href="/login" className="py-2 hover:text-dei-secondary">
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
