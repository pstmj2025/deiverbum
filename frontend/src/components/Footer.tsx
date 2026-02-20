import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-dei-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-dei-secondary mb-4">
              DEI VERBUM
            </h3>
            <p className="text-gray-300 text-sm">
              Livraria cristã e acadêmica. Livros novos e usados, papelaria e presentes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-dei-secondary">Início</Link></li>
              <li><Link href="/produtos" className="text-gray-300 hover:text-dei-secondary">Produtos</Link></li>
              <li><Link href="/categorias" className="text-gray-300 hover:text-dei-secondary">Categorias</Link></li>
              <li><Link href="/ofertas" className="text-gray-300 hover:text-dei-secondary">Ofertas</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>contato@deiverbum.com.br</li>
              <li>(62) 99999-9999</li>
              <li>Goiânia, GO</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-dei-secondary">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-dei-secondary">Facebook</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} DEI VERBUM. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
