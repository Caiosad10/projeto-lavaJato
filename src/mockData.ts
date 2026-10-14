import { Provider, Review, Appointment, User } from './types';

/** Usuários de exemplo para login (sem senha — só nome) */
export const INITIAL_USERS: User[] = [
  {
    id: 'user-cliente-1',
    name: 'Sérgio Filho',
    phone: '(21) 99123-4455',
    role: 'cliente',
  },
  {
    id: 'user-loja-1',
    name: 'EcoWash',
    phone: '(21) 99876-5432',
    role: 'loja',
    providerId: 'prov-1',
  },
  {
    id: 'user-autonomo-1',
    name: 'Carlos Autônomo',
    phone: '(21) 98123-4567',
    role: 'autonomo',
    providerId: 'prov-2',
  },
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'EcoWash Detail Studio',
    type: 'establishment',
    userId: 'user-loja-1',
    tagline: 'Estética automotiva sustentável e lavagem ecológica premium',
    description: 'Especializados em estética automotiva de alta precisão, lavagem ecológica sem desperdício de água e higienização interna com ozônio. Ambiente climatizado com sala de espera VIP e café.',
    address: 'Av. das Américas, 2400 - Barra',
    city: 'Rio de Janeiro',
    state: 'RJ',
    distanceKm: 1.2,
    avatar: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    totalReviews: 128,
    workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    openTime: '08:00',
    closeTime: '19:00',
    slotIntervalMinutes: 30,
    socials: {
      instagram: '@ecowash.detail',
      whatsapp: '21998765432',
      googleMaps: 'https://maps.google.com'
    },
    professionals: [
      {
        id: 'prof-1',
        name: 'Rafael Mendes',
        role: 'Master Detailer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        rating: 4.9,
        phone: '(21) 99876-1111'
      },
      {
        id: 'prof-2',
        name: 'Bruno Silveira',
        role: 'Especialista em Polimento',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        rating: 4.8,
        phone: '(21) 99876-2222'
      },
      {
        id: 'prof-3',
        name: 'Lucas Nogueira',
        role: 'Higienização e Lavagem',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        rating: 4.9,
        phone: '(21) 99876-3333'
      }
    ],
    services: [
      {
        id: 'serv-1',
        name: 'Lavagem Externa Ecológica',
        description: 'Lavagem externa com shampoo neutro biodegradável, secagem com microfibra e brilho nos pneus.',
        price: 45.0,
        durationMinutes: 30,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-2',
        name: 'Aspiração Interna Profunda',
        description: 'Aspiração detalhada de carpete, bancos, porta-malas e higienização do painel.',
        price: 35.0,
        durationMinutes: 30,
        category: 'higienizacao',
        popular: true
      },
      {
        id: 'serv-3',
        name: 'Enceramento Técnico com Carnaúba',
        description: 'Aplicação manual de cera premium de carnaúba para hidro-repelência e brilho profundo.',
        price: 80.0,
        durationMinutes: 45,
        category: 'estetica'
      },
      {
        id: 'serv-4',
        name: 'Oxi-Sanitização com Ozônio',
        description: 'Elimina 99,9% de ácaros, vírus, fungos e odores desagradáveis (cigarro, umidade) com gás ozônio.',
        price: 55.0,
        durationMinutes: 20,
        category: 'higienizacao'
      },
      {
        id: 'serv-5',
        name: 'Cristalização de Para-brisas',
        description: 'Tratamento hidrofóbico que repele água de chuva em velocidades acima de 50km/h.',
        price: 50.0,
        durationMinutes: 15,
        category: 'protecao'
      },
      {
        id: 'serv-6',
        name: 'Higienização Completa de Bancos',
        description: 'Lavagem por extração profunda para bancos de tecido ou limpeza e hidratação de couro.',
        price: 140.0,
        durationMinutes: 60,
        category: 'higienizacao'
      }
    ]
  },
  {
    id: 'prov-2',
    name: 'Carlos Lavador Delivery',
    type: 'autonomous',
    userId: 'user-autonomo-1',
    tagline: 'Lavador autônomo profissional que vai até você com água e luz próprias',
    description: 'Atendo em sua casa, garagem ou condomínio com toda infraestrutura móvel (tanque próprio de água tratada, gerador silencioso e produtos importados Vonixx). Praticidade sem tirar o carro da garagem.',
    address: 'Atende em raio de 10km (Zona Sul e Centro)',
    city: 'Rio de Janeiro',
    state: 'RJ',
    distanceKm: 0.8,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1552933529-e359b2477252?w=800&auto=format&fit=crop&q=80',
    rating: 4.95,
    totalReviews: 84,
    workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    openTime: '07:30',
    closeTime: '18:00',
    slotIntervalMinutes: 30,
    socials: {
      instagram: '@carlos.autolava',
      whatsapp: '21981234567'
    },
    professionals: [
      {
        id: 'prof-carlos',
        name: 'Carlos Oliveira',
        role: 'Profissional Autônomo',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
        rating: 4.95,
        phone: '(21) 98123-4567'
      }
    ],
    services: [
      {
        id: 'serv-c1',
        name: 'Lavagem Externa Domiciliar',
        description: 'Lavagem com xampu neutro com cera, pretinho especial nos pneus e limpeza de vidros.',
        price: 50.0,
        durationMinutes: 30,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-c2',
        name: 'Aspiração e Limpeza Interna',
        description: 'Aspiração de carpetes, tapetes e painel com pincel de detalhamento suave.',
        price: 35.0,
        durationMinutes: 30,
        category: 'higienizacao',
        popular: true
      },
      {
        id: 'serv-c3',
        name: 'Combo Completo Delivery (Externa + Interna)',
        description: 'Economize contratando o pacote com lavagem externa + interna detalhada.',
        price: 75.0,
        durationMinutes: 60,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-c4',
        name: 'Revitalização de Plásticos e Borrachas',
        description: 'Protege contra ressecamento do sol com acabamento fosco original.',
        price: 25.0,
        durationMinutes: 15,
        category: 'estetica'
      }
    ]
  },
  {
    id: 'prov-3',
    name: 'Lava-Jato Brilho Car Express',
    type: 'establishment',
    tagline: 'Agilidade, preço justo e tradição em lavagem rápida',
    description: 'Boxes amplos para atendimento rápido e preciso. Temos cafeteria e wi-fi gratuito enquanto cuidamos da limpeza do seu veículo.',
    address: 'Rua Conde de Bonfim, 730 - Tijuca',
    city: 'Rio de Janeiro',
    state: 'RJ',
    distanceKm: 2.5,
    avatar: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    totalReviews: 95,
    workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    openTime: '08:00',
    closeTime: '18:00',
    slotIntervalMinutes: 15, // configured to 15min slots
    socials: {
      instagram: '@brilhocar.tijuca',
      whatsapp: '21976543210',
      googleMaps: 'https://maps.google.com'
    },
    professionals: [
      {
        id: 'prof-b1',
        name: 'Alexandre Costa',
        role: 'Lavador Líder',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
        rating: 4.7
      },
      {
        id: 'prof-b2',
        name: 'Rodrigo Lima',
        role: 'Operador de Polimento',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        rating: 4.8
      }
    ],
    services: [
      {
        id: 'serv-b1',
        name: 'Ducha Rápida com Cera Líquida',
        description: 'Ducha de alta pressão com xampu espumante e secagem com soprador de ar.',
        price: 30.0,
        durationMinutes: 15,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-b2',
        name: 'Lavagem Completa Express',
        description: 'Lavagem externa + aspiração interna rápida e silicone nos pneus.',
        price: 55.0,
        durationMinutes: 30,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-b3',
        name: 'Polimento Técnico de Faróis',
        description: 'Remove o amarelado e restaura a transparência com proteção UV.',
        price: 60.0,
        durationMinutes: 30,
        category: 'estetica'
      },
      {
        id: 'serv-b4',
        name: 'Lavagem de Motor a Seco',
        description: 'Limpeza segura de motor com desengraxante biodegradável e proteção de chicotes.',
        price: 65.0,
        durationMinutes: 30,
        category: 'lavagem'
      }
    ]
  },
  {
    id: 'prov-4',
    name: 'Marcos Detailer Autônomo',
    type: 'autonomous',
    tagline: 'Tratamento de verniz, vitrificação e lavagem minuciosa em domicílio',
    description: 'Mais de 7 anos de experiência com veículos de colecionador e esportivos. Atendimento exclusivo com 1 cliente por período para garantir padrão de acabamento cirúrgico.',
    address: 'Atendimento móvel em toda a região metropolitana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    distanceKm: 3.4,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    rating: 4.98,
    totalReviews: 62,
    workingDays: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    openTime: '08:00',
    closeTime: '17:00',
    slotIntervalMinutes: 60, // 1 hour slots
    socials: {
      instagram: '@marcos.detailer',
      whatsapp: '21991122334'
    },
    professionals: [
      {
        id: 'prof-marcos',
        name: 'Marcos Vinicius',
        role: 'Detailer Profissional',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        rating: 4.98
      }
    ],
    services: [
      {
        id: 'serv-m1',
        name: 'Lavagem Detalhada Premium',
        description: 'Descontaminação de rodas, pincéis em grelhas e emblemas, cera líquida SiO2.',
        price: 90.0,
        durationMinutes: 60,
        category: 'lavagem',
        popular: true
      },
      {
        id: 'serv-m2',
        name: 'Descontaminação Ferrosa e Claybar',
        description: 'Remoção de pulverização e contaminação industrial com barra de argila.',
        price: 110.0,
        durationMinutes: 60,
        category: 'estetica'
      },
      {
        id: 'serv-m3',
        name: 'Hidratação Nobre de Couro Automotivo',
        description: 'Limpeza com espuma antibacteriana e bálsamo hidratante com proteção UV.',
        price: 85.0,
        durationMinutes: 45,
        category: 'higienizacao'
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    appointmentId: 'apt-prev-1',
    providerId: 'prov-1',
    clientName: 'Fernando Alencar',
    rating: 5,
    comment: 'Excelente atendimento do Rafael! O carro ficou impecável por dentro e por fora, recomendo muito o serviço de cera de carnaúba.',
    tags: ['Pontualidade', 'Acabamento perfeito', 'Ótimo atendimento'],
    createdAt: '2026-09-06T14:30:00Z',
    servicesGiven: ['Lavagem Externa Ecológica', 'Enceramento Técnico com Carnaúba']
  },
  {
    id: 'rev-2',
    appointmentId: 'apt-prev-2',
    providerId: 'prov-1',
    clientName: 'Mariana Duarte',
    rating: 5,
    comment: 'Muito satisfeita! A oxi-sanitização tirou o cheiro de umidade do ar-condicionado completamente.',
    tags: ['Ambiente agradável', 'Profissionalismo'],
    createdAt: '2026-09-05T10:15:00Z',
    servicesGiven: ['Aspiração Interna Profunda', 'Oxi-Sanitização com Ozônio']
  },
  {
    id: 'rev-3',
    appointmentId: 'apt-prev-3',
    providerId: 'prov-2',
    clientName: 'Camila Guimarães',
    rating: 5,
    comment: 'O Carlos foi super atencioso, lavou o carro no meu condomínio sem respingo de sujeira no chão. Super prático!',
    tags: ['Pontualidade', 'Comodidade em casa', 'Cuidado nos detalhes'],
    createdAt: '2026-09-07T16:40:00Z',
    servicesGiven: ['Combo Completo Delivery (Externa + Interna)']
  },
  {
    id: 'rev-4',
    appointmentId: 'apt-prev-4',
    providerId: 'prov-3',
    clientName: 'Rodrigo Vasconcelos',
    rating: 4,
    comment: 'Rápido e preço justo na Tijuca. O polimento de faróis deixou como novo.',
    tags: ['Rapidez', 'Bom custo-benefício'],
    createdAt: '2026-09-04T11:20:00Z',
    servicesGiven: ['Ducha Rápida', 'Polimento Técnico de Faróis']
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    providerId: 'prov-1',
    providerName: 'EcoWash Detail Studio',
    providerType: 'establishment',
    professionalId: 'prof-1',
    professionalName: 'Rafael Mendes',
    clientName: 'Sérgio Filho',
    clientPhone: '(21) 99123-4455',
    carModel: 'Honda Civic Preto',
    carPlate: 'ABC-4E21',
    services: [
      {
        id: 'serv-1',
        name: 'Lavagem Externa Ecológica',
        description: 'Lavagem externa com xampu ecológico',
        price: 45.0,
        durationMinutes: 30,
        category: 'lavagem'
      },
      {
        id: 'serv-2',
        name: 'Aspiração Interna Profunda',
        description: 'Aspiração detalhada',
        price: 35.0,
        durationMinutes: 30,
        category: 'higienizacao'
      }
    ],
    totalDurationMinutes: 60,
    totalPrice: 80.0,
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '10:00',
    endTime: '11:00',
    paymentStatus: 'paid',
    paymentMethod: 'pix',
    status: 'concluido',
    createdAt: '2026-09-08T08:00:00Z',
    hasReview: false
  },
  {
    id: 'apt-002',
    providerId: 'prov-2',
    providerName: 'Carlos Lavador Delivery',
    providerType: 'autonomous',
    professionalId: 'prof-carlos',
    professionalName: 'Carlos Oliveira',
    clientName: 'Renata Castro',
    clientPhone: '(21) 98765-4321',
    carModel: 'Jeep Renegade Prata',
    carPlate: 'XYZ-8H90',
    services: [
      {
        id: 'serv-c3',
        name: 'Combo Completo Delivery (Externa + Interna)',
        description: 'Externa + interna detalhada',
        price: 75.0,
        durationMinutes: 60,
        category: 'lavagem'
      }
    ],
    totalDurationMinutes: 60,
    totalPrice: 75.0,
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '14:00',
    endTime: '15:00',
    paymentStatus: 'paid',
    paymentMethod: 'pix',
    status: 'agendado',
    createdAt: '2026-09-08T09:10:00Z',
    hasReview: false
  }
];
