import { PrismaClient, UserRole, ProductCondition, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============ USUÁRIOS ============
  console.log('👤 Criando usuários...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deiverbum.com.br' },
    update: {},
    create: {
      email: 'admin@deiverbum.com.br',
      password: adminPassword,
      name: 'Administrador',
      phone: '(62) 99999-9999',
      role: UserRole.ADMIN,
      active: true,
    },
  });
  
  const manager = await prisma.user.upsert({
    where: { email: 'gerente@deiverbum.com.br' },
    update: {},
    create: {
      email: 'gerente@deiverbum.com.br',
      password: adminPassword,
      name: 'Gerente da Loja',
      phone: '(62) 98888-8888',
      role: UserRole.MANAGER,
      active: true,
    },
  });
  
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      email: 'cliente@email.com',
      password: customerPassword,
      name: 'Maria Silva',
      phone: '(62) 97777-7777',
      role: UserRole.CUSTOMER,
      active: true,
    },
  });

  // ============ CATEGORIAS ============
  console.log('📁 Criando categorias...');
  
  const categoriasData = [
    {
      name: 'Livros',
      slug: 'livros',
      description: 'Livros de diversas categorias',
      sortOrder: 1,
      children: [
        { name: 'Literatura', slug: 'literatura', sortOrder: 1 },
        { name: 'Teologia', slug: 'teologia', sortOrder: 2 },
        { name: 'Filosofia', slug: 'filosofia', sortOrder: 3 },
        { name: 'História', slug: 'historia', sortOrder: 4 },
        { name: 'Biografias', slug: 'biografias', sortOrder: 5 },
        { name: 'Infantojuvenil', slug: 'infantojuvenil', sortOrder: 6 },
      ],
    },
    {
      name: 'Livros Usados',
      slug: 'livros-usados',
      description: 'Livros seminovos com preços especiais',
      sortOrder: 2,
    },
    {
      name: 'Papelaria',
      slug: 'papelaria',
      description: 'Materiais para estudo e escritório',
      sortOrder: 3,
      children: [
        { name: 'Cadernos', slug: 'cadernos', sortOrder: 1 },
        { name: 'Agendas', slug: 'agendas', sortOrder: 2 },
        { name: 'Canetas', slug: 'canetas', sortOrder: 3 },
        { name: 'Marcadores', slug: 'marcadores', sortOrder: 4 },
        { name: 'Bíblias', slug: 'biblias', sortOrder: 5 },
      ],
    },
    {
      name: 'Presentes',
      slug: 'presentes',
      description: 'Ideias para presente',
      sortOrder: 4,
    },
  ];
  
  for (const cat of categoriasData) {
    const { children, ...catData } = cat;
    
    const categoria = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...catData,
        active: true,
      },
    });
    
    if (children) {
      for (const child of children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: {},
          create: {
            ...child,
            description: child.name,
            active: true,
            parentId: categoria.id,
          },
        });
      }
    }
  }

  // ============ PRODUTOS ============
  console.log('📚 Criando produtos...');
  
  const literaturaCat = await prisma.category.findUnique({ where: { slug: 'literatura' } });
  const teologiaCat = await prisma.category.findUnique({ where: { slug: 'teologia' } });
  const biografiasCat = await prisma.category.findUnique({ where: { slug: 'biografias' } });
  const cadernosCat = await prisma.category.findUnique({ where: { slug: 'cadernos' } });
  const bibliasCat = await prisma.category.findUnique({ where: { slug: 'biblias' } });
  const usadosCat = await prisma.category.findUnique({ where: { slug: 'livros-usados' } });
  
  const produtosData = [
    // LIVROS NOVOS
    {
      sku: 'LIV-001',
      name: 'Confissões de Santo Agostinho',
      slug: 'confissoes-santo-agostinho',
      description: 'A obra-prima de Santo Agostinho, onde o autor confessa seus pecados e louvores a Deus. Edição de bolso com introdução crítica.',
      type: ProductType.BOOK,
      price: 45.90,
      cost: 25.00,
      stock: 15,
      condition: ProductCondition.NEW,
      isbn13: '9788561411054',
      author: 'Santo Agostinho',
      publisher: 'Edições Loyola',
      year: 2023,
      pages: 432,
      categoryId: literaturaCat?.id,
      featured: true,
    },
    {
      sku: 'LIV-002',
      name: 'Cadernos de identidade cultural',
      slug: 'cadernos-identidade-cultural',
      description: 'Sérgio Buarque de Holanda analisa a formação da alma brasileira através de seus hábitos, crenças e tradições.',
      type: ProductType.BOOK,
      price: 89.90,
      cost: 50.00,
      stock: 8,
      condition: ProductCondition.NEW,
      isbn13: '9788535905565',
      author: 'Sérgio Buarque de Holanda',
      publisher: 'Companhia das Letras',
      year: 2022,
      pages: 312,
      categoryId: literaturaCat?.id,
      featured: false,
    },
    {
      sku: 'LIV-003',
      name: 'O Senhor dos Anéis: A Sociedade do Anel',
      slug: 'senhor-dos-aneis-sociedade-anel',
      description: 'Primeiro volume da épica saga de J.R.R. Tolkien. Frodo Bolseiro deve destruir o Um Anel para salvar a Terra-média.',
      type: ProductType.BOOK,
      price: 69.90,
      cost: 40.00,
      stock: 20,
      condition: ProductCondition.NEW,
      isbn13: '9788595084756',
      author: 'J.R.R. Tolkien',
      publisher: 'HarperCollins',
      year: 2022,
      pages: 576,
      categoryId: literaturaCat?.id,
      featured: true,
    },
    {
      sku: 'LIV-004',
      name: 'O Verbo se fez carne - Teologia do Logos',
      slug: 'verbo-carne-teologia-logos',
      description: 'Estudo aprofundado sobre a encarnação do Verbo, sua natureza divina e humana, e implicações para a fé cristã.',
      type: ProductType.BOOK,
      price: 79.90,
      cost: 42.00,
      stock: 12,
      condition: ProductCondition.NEW,
      isbn13: '9788523304856',
      author: 'Pe. Leonardo Mayer',
      publisher: 'Paulus Editora',
      year: 2021,
      pages: 288,
      categoryId: teologiaCat?.id,
      featured: true,
    },
    {
      sku: 'LIV-005',
      name: 'Bíblia de Estudo NAA',
      slug: 'biblia-estudo-naa',
      description: 'Nova Almeida Atualizada com estudos explicativos, mapas, cronologia e notas de estudo por renomados teólogos.',
      type: ProductType.BOOK,
      price: 149.90,
      cost: 90.00,
      stock: 10,
      condition: ProductCondition.NEW,
      isbn13: '9788522122352',
      author: 'Vários Autores',
      publisher: 'Editora SBB',
      year: 2023,
      pages: 2208,
      categoryId: bibliasCat?.id,
      featured: true,
    },
    {
      sku: 'LIV-006',
      name: 'São Josemaria Escrivá - Biografia',
      slug: 'sao-josemaria-escriva-biografia',
      description: 'Vida do fundador do Opus Dei, suas lutas, realizações e legado para a Igreja Católica no século XX.',
      type: ProductType.BOOK,
      price: 65.00,
      cost: 35.00,
      stock: 7,
      condition: ProductCondition.NEW,
      isbn13: '9788522007550',
      author: 'Pe. John Roche',
      publisher: 'Sextante',
      year: 2022,
      pages: 384,
      categoryId: biografiasCat?.id,
      featured: false,
    },
    
    // LIVROS USADOS
    {
      sku: 'LIV-U001',
      name: 'Dom Quixote (Edição Usada)',
      slug: 'dom-quixote-usado',
      description: 'Edição clássica de Dom Quixote, leitura marcou. Capa com leves sinais de uso, interior preservado. Oportunidade única!',
      type: ProductType.BOOK,
      price: 19.90,
      cost: 8.00,
      stock: 3,
      condition: ProductCondition.GOOD,
      isbn13: '9788503007326',
      author: 'Miguel de Cervantes',
      publisher: 'Moderna',
      year: 2015,
      pages: 687,
      categoryId: usadosCat?.id,
      featured: false,
      comparePrice: 49.90,
    },
    {
      sku: 'LIV-U002',
      name: 'O Pequeno Príncipe - Edição Coleção',
      slug: 'pequeno-principe-usado',
      description: 'Edição de coleção com ilustrações originais feitas pelo autor. Excelente estado, como novo. Acabamentos especiais.',
      type: ProductType.BOOK,
      price: 29.90,
      cost: 12.00,
      stock: 2,
      condition: ProductCondition.LIKE_NEW,
      isbn13: '9788540103135',
      author: 'Antoine de Saint-Exupéry',
      publisher: 'HarperBrasil',
      year: 2018,
      pages: 96,
      categoryId: usadosCat?.id,
      featured: false,
      comparePrice: 59.90,
    },
    {
      sku: 'LIV-U003',
      name: 'Fé e Razão - Diálogos entre Teólogos e Filósofos',
      slug: 'fe-razao-dialogos',
      description: 'Livro usado em bom estado. Discussões sobre a relação entre teologia e filosofia contemporânea.',
      type: ProductType.BOOK,
      price: 15.00,
      cost: 6.00,
      stock: 5,
      condition: ProductCondition.ACCEPTABLE,
      isbn13: '9788523301234',
      author: 'Vários Autores',
      publisher: 'Paulus',
      year: 2010,
      pages: 256,
      categoryId: usadosCat?.id,
      featured: false,
      comparePrice: 45.00,
    },
    
    // PAPELARIA
    {
      sku: 'PAP-001',
      name: 'Caderno Universitário 10 Matérias DEI VERBUM',
      slug: 'caderno-universitario-10m',
      description: 'Caderno universitário com capa exclusiva temática cristã. 200 folhas, divisórias coloridas, bolso interno.',
      type: ProductType.STATIONERY,
      price: 24.90,
      cost: 12.00,
      stock: 50,
      condition: ProductCondition.NEW,
      categoryId: cadernosCat?.id,
      featured: true,
    },
    {
      sku: 'PAP-002',
      name: 'Caneta Esferográfica Tinteiro',
      slug: 'caneta-tinteiro',
      description: 'Caneta esferográfica premium com design clássico. Escrita suave, recarregável. Ideal para presente.',
      type: ProductType.STATIONERY,
      price: 35.00,
      cost: 15.00,
      stock: 25,
      condition: ProductCondition.NEW,
      categoryId: cadernosCat?.id,
      featured: false,
    },
    {
      sku: 'PAP-003',
      name: 'Marca-Páginas LED Luminoso',
      slug: 'marca-paginas-led',
      description: 'Marca-páginas em metal com LED. Leitura noturna facilitada. design minimalista. Pilhas inclusas.',
      type: ProductType.STATIONERY,
      price: 19.90,
      cost: 8.00,
      stock: 30,
      condition: ProductCondition.NEW,
      categoryId: cadernosCat?.id,
      featured: true,
    },
    {
      sku: 'PAP-004',
      name: 'Bíblia NVI Leitura Perfeita',
      slug: 'biblia-nvi-leitura',
      description: 'Bíblia Nova Versão Internacional em tamanho compacto. Capa luxo, folhas finas de alta qualidade.',
      type: ProductType.BOOK,
      price: 39.90,
      cost: 20.00,
      stock: 20,
      condition: ProductCondition.NEW,
      isbn13: '9788526303891',
      categoryId: bibliasCat?.id,
      featured: true,
    },
    
    // PRESENTES
    {
      sku: 'PRE-001',
      name: 'Kit Estudo Bíblico Premium',
      slug: 'kit-estudo-biblico',
      description: 'Kit completo: Bíblia de estudo + caderno anotações + marca-páginas metal + lápis personalizado. Caixa presenteável.',
      type: ProductType.OTHER,
      price: 129.90,
      cost: 65.00,
      stock: 15,
      condition: ProductCondition.NEW,
      categoryId: cadernosCat?.id,
      featured: true,
      comparePrice: 179.90,
    },
    {
      sku: 'PRE-002',
      name: 'Cruz de Parede Madeira',
      slug: 'cruz-parede-madeira',
      description: 'Cruz decorativa em madeira nobre. Tamanho 30x20cm. Acabamento em verniz. Ótima para presente de casamento ou formatura.',
      type: ProductType.OTHER,
      price: 89.90,
      cost: 40.00,
      stock: 10,
      condition: ProductCondition.NEW,
      categoryId: cadernosCat?.id,
      featured: false,
    },
  ];
  
  for (const prod of produtosData) {
    const { slug, ...data } = prod;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: { ...data, slug, images: JSON.stringify(['/images/placeholder.jpg']),
        active: true,
      },
    });
  }
  
  console.log(`✅ Criados ${produtosData.length} produtos`);

  // ============ ENDEREÇOS ============
  console.log('🗺️ Criando endereços...');
  
  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        name: 'Casa',
        cep: '74000-000',
        street: 'Rua Principal',
        number: '123',
        neighborhood: 'Setor Central',
        city: 'Goiânia',
        state: 'GO',
        isDefault: true,
      },
      {
        userId: customer.id,
        name: 'Trabalho',
        cep: '74125-000',
        street: 'Avenida T-63',
        number: '1500',
        complement: 'Sala 301',
        neighborhood: 'St. Bueno',
        city: 'Goiânia',
        state: 'GO',
        isDefault: false,
      },
    ],
    skipDuplicates: true,
  });
  
  console.log('✅ Criados 2 endereços para o cliente');

  // ============ CONFIGURAÇÕES DA LOJA ============
  console.log('⚙️ Criando configurações da loja...');
  
  const configs = [
    { key: 'store_name', value: JSON.stringify('DEI VERBUM'), description: 'Nome da loja' },
    { key: 'store_email', value: JSON.stringify('contato@deiverbum.com.br'), description: 'Email de contato' },
    { key: 'store_phone', value: JSON.stringify('(62) 99999-9999'), description: 'Telefone' },
    { key: 'shipping_default_cost', value: JSON.stringify(15), description: 'Valor padrão do frete em R$' },
    { key: 'shipping_free_above', value: JSON.stringify(200), description: 'Valor mínimo para frete grátis' },
    { key: 'payment_pix_discount', value: JSON.stringify(5), description: 'Desconto para pagamento PIX (%)' },
    { key: 'payment_boleto_discount', value: JSON.stringify(3), description: 'Desconto para pagamento Boleto (%)' },
  ];
  
  for (const config of configs) {
    await prisma.storeConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  
  console.log(`✅ Criadas ${configs.length} configurações`);

  console.log('');
  console.log('🎉 Seed completado com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Resumo:');
  console.log('  • Usuários: 3 (admin, gerente, cliente)');
  console.log('  • Categorias: 14 categorias');
  console.log('  • Produtos: 14 produtos (livros, papelaria, presentes)');
  console.log('  • Endereços: 2 endereços do cliente');
  console.log('  • Configurações: 7 configurações da loja');
  console.log('');
  console.log('👤 Credenciais de teste:');
  console.log('  Admin: admin@deiverbum.com.br / admin123');
  console.log('  Cliente: cliente@email.com / 123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });