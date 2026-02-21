'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { CreditCard, Truck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });

  const handleCheckout = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    setStep(3);
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-4">Pedido Realizado!</h1>
          <p className="text-gray-600 mb-8">Seu pedido foi recebido. Em breve enviaremos atualizações por e-mail.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-dei-primary text-white rounded-lg hover:opacity-90">
            Voltar para a Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Finalizar Compra</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-dei-primary' : 'text-gray-400'}`}>
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Endereço</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-dei-primary' : 'text-gray-400'}`}>
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Pagamento</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="E-mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="CEP"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="Rua"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="Número"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="Complemento (opcional)"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    placeholder="UF"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-3 bg-dei-primary text-white rounded-lg font-semibold hover:opacity-90"
                >
                  Continuar para Pagamento
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Forma de Pagamento
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="pix" defaultChecked className="text-dei-primary" />
                    <span>PIX (5% de desconto)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="boleto" className="text-dei-primary" />
                    <span>Boleto (3% de desconto)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="card" className="text-dei-primary" />
                    <span>Cartão de Crédito</span>
                  </label>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 py-3 bg-dei-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"