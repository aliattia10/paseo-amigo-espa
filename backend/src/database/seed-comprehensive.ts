import { supabase } from '@/config/database';
import dotenv from 'dotenv';

dotenv.config();

// Comprehensive realistic Spanish test data
const comprehensiveUsers = [
  // Dog Owners
  {
    name: 'María González Pérez',
    email: 'maria.gonzalez@gmail.com',
    phone: '+34 612 345 678',
    city: 'Madrid',
    postal_code: '28001',
    user_type: 'owner' as const
  },
  {
    name: 'Carlos Ruiz Martínez',
    email: 'carlos.ruiz@hotmail.com',
    phone: '+34 623 456 789',
    city: 'Madrid',
    postal_code: '28015',
    user_type: 'owner' as const
  },
  {
    name: 'Ana Fernández López',
    email: 'ana.fernandez@gmail.com',
    phone: '+34 634 567 890',
    city: 'Barcelona',
    postal_code: '08001',
    user_type: 'owner' as const
  },
  {
    name: 'David Sánchez García',
    email: 'david.sanchez@outlook.com',
    phone: '+34 645 678 901',
    city: 'Barcelona',
    postal_code: '08015',
    user_type: 'owner' as const
  },
  {
    name: 'Lucía Herrera Jiménez',
    email: 'lucia.herrera@gmail.com',
    phone: '+34 656 789 012',
    city: 'Valencia',
    postal_code: '46001',
    user_type: 'owner' as const
  },
  {
    name: 'Miguel Torres Díaz',
    email: 'miguel.torres@yahoo.com',
    phone: '+34 667 890 123',
    city: 'Sevilla',
    postal_code: '41001',
    user_type: 'owner' as const
  },
  // Dog Walkers
  {
    name: 'Alejandro Morales Vega',
    email: 'alejandro.morales@gmail.com',
    phone: '+34 678 901 234',
    city: 'Madrid',
    postal_code: '28002',
    user_type: 'walker' as const
  },
  {
    name: 'Carmen Delgado Romero',
    email: 'carmen.delgado@hotmail.com',
    phone: '+34 689 012 345',
    city: 'Madrid',
    postal_code: '28020',
    user_type: 'walker' as const
  },
  {
    name: 'Roberto Silva Mendoza',
    email: 'roberto.silva@gmail.com',
    phone: '+34 690 123 456',
    city: 'Barcelona',
    postal_code: '08002',
    user_type: 'walker' as const
  },
  {
    name: 'Isabel Castro Ruiz',
    email: 'isabel.castro@outlook.com',
    phone: '+34 601 234 567',
    city: 'Barcelona',
    postal_code: '08020',
    user_type: 'walker' as const
  },
  {
    name: 'Fernando Navarro Blanco',
    email: 'fernando.navarro@gmail.com',
    phone: '+34 612 345 678',
    city: 'Valencia',
    postal_code: '46002',
    user_type: 'walker' as const
  },
  {
    name: 'Patricia Jiménez Flores',
    email: 'patricia.jimenez@yahoo.com',
    phone: '+34 623 456 789',
    city: 'Sevilla',
    postal_code: '41002',
    user_type: 'walker' as const
  },
  // Additional Dog Owners
  {
    name: 'Elena Martín Sanz',
    email: 'elena.martin@gmail.com',
    phone: '+34 678 012 345',
    city: 'Madrid',
    postal_code: '28010',
    user_type: 'owner' as const
  },
  {
    name: 'Jorge López Ortega',
    email: 'jorge.lopez@hotmail.com',
    phone: '+34 689 123 456',
    city: 'Barcelona',
    postal_code: '08010',
    user_type: 'owner' as const
  },
  {
    name: 'Sofía Ramírez Cruz',
    email: 'sofia.ramirez@gmail.com',
    phone: '+34 690 234 567',
    city: 'Valencia',
    postal_code: '46010',
    user_type: 'owner' as const
  },
  {
    name: 'Pablo Álvarez Gil',
    email: 'pablo.alvarez@outlook.com',
    phone: '+34 601 345 678',
    city: 'Madrid',
    postal_code: '28005',
    user_type: 'owner' as const
  },
  // Additional Dog Walkers
  {
    name: 'Raquel Méndez Santos',
    email: 'raquel.mendez@gmail.com',
    phone: '+34 612 456 789',
    city: 'Madrid',
    postal_code: '28012',
    user_type: 'walker' as const
  },
  {
    name: 'Javier Cano Prieto',
    email: 'javier.cano@hotmail.com',
    phone: '+34 623 567 890',
    city: 'Barcelona',
    postal_code: '08012',
    user_type: 'walker' as const
  },
  {
    name: 'Cristina Vargas León',
    email: 'cristina.vargas@gmail.com',
    phone: '+34 634 678 901',
    city: 'Valencia',
    postal_code: '46012',
    user_type: 'walker' as const
  },
  {
    name: 'Andrés Fuentes Molina',
    email: 'andres.fuentes@yahoo.com',
    phone: '+34 645 789 012',
    city: 'Sevilla',
    postal_code: '41010',
    user_type: 'walker' as const
  },
  {
    name: 'Marta Reyes Campos',
    email: 'marta.reyes@gmail.com',
    phone: '+34 656 890 123',
    city: 'Madrid',
    postal_code: '28025',
    user_type: 'walker' as const
  },
  {
    name: 'Sergio Domínguez Pastor',
    email: 'sergio.dominguez@outlook.com',
    phone: '+34 667 901 234',
    city: 'Barcelona',
    postal_code: '08025',
    user_type: 'walker' as const
  }
];

const comprehensiveDogs = [
  {
    name: 'Luna',
    age: '4 años',
    breed: 'Golden Retriever',
    notes: 'Muy cariñosa y tranquila. Le encanta jugar con niños y otros perros. Perfecta para familias.',
    image_url: null
  },
  {
    name: 'Max',
    age: '2 años',
    breed: 'Labrador',
    notes: 'Enérgico y juguetón. Necesita ejercicio diario. Muy obediente y fácil de entrenar.',
    image_url: null
  },
  {
    name: 'Bruno',
    age: '6 años',
    breed: 'Pastor Alemán',
    notes: 'Muy leal y protector. Necesita paseos largos y ejercicio mental. Experto en obediencia.',
    image_url: null
  },
  {
    name: 'Maya',
    age: '1 año',
    breed: 'Beagle',
    notes: 'Joven y curiosa. Le gusta explorar y seguir rastros. Requiere paciencia al principio.',
    image_url: null
  },
  {
    name: 'Thor',
    age: '3 años',
    breed: 'Husky Siberiano',
    notes: 'Muy activo y necesita mucho ejercicio. Hermoso pelaje gris. Le encanta el frío.',
    image_url: null
  },
  {
    name: 'Nala',
    age: '5 años',
    breed: 'Border Collie',
    notes: 'Extremadamente inteligente y activa. Perfecta para actividades deportivas. Muy obediente.',
    image_url: null
  },
  {
    name: 'Rex',
    age: '7 años',
    breed: 'Rottweiler',
    notes: 'Perro adulto muy tranquilo y cariñoso. Excelente con niños. Muy obediente y calmado.',
    image_url: null
  },
  {
    name: 'Coco',
    age: '2 años',
    breed: 'French Bulldog',
    notes: 'Pequeño pero con mucha personalidad. Muy amigable y perfecto para pisos pequeños.',
    image_url: null
  },
  {
    name: 'Zeus',
    age: '4 años',
    breed: 'Mastín Español',
    notes: 'Perro grande y majestuoso. Muy tranquilo y protector. Perfecto guardián familiar.',
    image_url: null
  },
  {
    name: 'Bella',
    age: '3 años',
    breed: 'Cocker Spaniel',
    notes: 'Muy cariñosa y sociable. Le encanta el agua y jugar. Perfecta para familias activas.',
    image_url: null
  },
  {
    name: 'Rocky',
    age: '1 año',
    breed: 'Bulldog Inglés',
    notes: 'Joven y juguetón. Muy tranquilo en casa pero activo en el parque. Fácil de manejar.',
    image_url: null
  },
  {
    name: 'Toby',
    age: '2 años',
    breed: 'Schnauzer',
    notes: 'Inteligente y alerta. Excelente perro guardián. Necesita ejercicio mental y físico regular.',
    image_url: null
  },
  {
    name: 'Lola',
    age: '3 años',
    breed: 'Yorkshire Terrier',
    notes: 'Pequeña y valiente. Muy cariñosa con la familia. Perfecta para apartamentos.',
    image_url: null
  },
  {
    name: 'Simba',
    age: '1 año',
    breed: 'Pomerania',
    notes: 'Muy activo y juguetón. Le encanta socializar con otros perros. Necesita cepillado frecuente.',
    image_url: null
  },
  {
    name: 'Duke',
    age: '5 años',
    breed: 'Boxer',
    notes: 'Enérgico y cariñoso. Excelente con niños. Necesita ejercicio diario intenso.',
    image_url: null
  }
];

const comprehensiveWalkerProfiles = [
  {
    bio: 'Profesional con más de 8 años cuidando perros. Especializado en razas grandes y perros con necesidades especiales. Certificado en primeros auxilios caninos.',
    experience: 'Más de 8 años de experiencia profesional. He cuidado más de 500 perros diferentes, desde cachorros hasta perros senior. Especialista en entrenamiento básico.',
    hourly_rate: 18.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    tags: ['experiencia', 'certificado', 'razas grandes', 'entrenamiento', 'confiable'],
    verified: true,
    rating: 4.9,
    total_walks: 127
  },
  {
    bio: 'Amante de los animales con gran experiencia en perros nerviosos y tímidos. Trabajo con mucha paciencia y cariño.',
    experience: '6 años cuidando perros de todas las edades. Especializada en perros ansiosos y con miedo. Experiencia con perros de rescate.',
    hourly_rate: 15.00,
    availability: ['martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    tags: ['paciente', 'perros nerviosos', 'cariñosa', 'experiencia', 'flexible'],
    verified: true,
    rating: 4.8,
    total_walks: 89
  },
  {
    bio: 'Estudiante de veterinaria con gran pasión por los perros. Joven, enérgico y siempre dispuesto a aprender.',
    experience: '3 años paseando perros mientras estudio. Experiencia con perros jóvenes y activos. Conocimientos básicos de veterinaria.',
    hourly_rate: 12.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    tags: ['joven', 'estudiante veterinaria', 'energético', 'económico', 'disponible'],
    verified: false,
    rating: 4.7,
    total_walks: 45
  },
  {
    bio: 'Profesional con amplia experiencia en cuidado canino. Puntual, responsable y muy cariñosa con todos los perros.',
    experience: '7 años de experiencia profesional. Especializada en perros de todas las razas y tamaños. Trabajo con horarios flexibles.',
    hourly_rate: 16.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    tags: ['profesional', 'puntual', 'responsable', 'flexible', 'experiencia'],
    verified: true,
    rating: 4.9,
    total_walks: 156
  },
  {
    bio: 'Trabajo de lunes a viernes, pero los fines de semana me dedico completamente a pasear perros. Gran experiencia con razas deportivas.',
    experience: '5 años paseando perros los fines de semana. Especialista en perros activos y deportivos. Experiencia con perros de caza.',
    hourly_rate: 14.00,
    availability: ['sábado', 'domingo'],
    tags: ['fines de semana', 'perros activos', 'deportivo', 'razas de caza'],
    verified: true,
    rating: 4.6,
    total_walks: 78
  },
  {
    bio: 'Madre de familia con gran amor por los perros. Experiencia cuidando perros de familia y trabajando con niños.',
    experience: '4 años cuidando perros de familia. Experiencia con perros y niños juntos. Muy cariñosa y responsable.',
    hourly_rate: 13.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
    tags: ['familia', 'niños', 'cariñosa', 'responsable', 'perros de familia'],
    verified: true,
    rating: 4.8,
    total_walks: 92
  },
  {
    bio: 'Entrenadora canina certificada con experiencia en perros con problemas de comportamiento. Especializada en socialización.',
    experience: '5 años como entrenadora profesional. Certificada en etología canina. Experiencia con perros reactivos y agresivos.',
    hourly_rate: 17.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    tags: ['entrenadora', 'comportamiento', 'certificada', 'socialización', 'profesional'],
    verified: true,
    rating: 4.9,
    total_walks: 134
  },
  {
    bio: 'Joven apasionado por los deportes caninos. Especializado en razas activas y deportivas. Running con perros.',
    experience: '3 años paseando y corriendo con perros. Experiencia en canicross y agility. Perfecto para perros muy activos.',
    hourly_rate: 14.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    tags: ['deportivo', 'running', 'activo', 'canicross', 'energético'],
    verified: true,
    rating: 4.7,
    total_walks: 67
  },
  {
    bio: 'Veterinaria jubilada con 30 años de experiencia. Especializada en cuidados geriátricos y perros con necesidades especiales.',
    experience: '30 años como veterinaria más 5 años paseando perros. Experiencia con perros senior y con problemas médicos.',
    hourly_rate: 19.00,
    availability: ['lunes', 'miércoles', 'viernes', 'domingo'],
    tags: ['veterinaria', 'experiencia', 'senior', 'médico', 'especializada'],
    verified: true,
    rating: 5.0,
    total_walks: 112
  },
  {
    bio: 'Paseador profesional con gran experiencia en todo tipo de razas. Flexible, responsable y muy puntual.',
    experience: '6 años como paseador profesional a tiempo completo. He trabajado con más de 300 perros diferentes.',
    hourly_rate: 15.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    tags: ['profesional', 'flexible', 'puntual', 'experiencia', 'confiable'],
    verified: true,
    rating: 4.8,
    total_walks: 198
  }
];

const comprehensiveSubscriptionPlans = [
  {
    name: 'Básico',
    price: 9.99,
    interval: 'month',
    features: [
      'Hasta 5 paseos por mes',
      'Soporte por email',
      'Acceso a walkers locales'
    ],
    stripe_price_id: 'price_basic_monthly',
    popular: false
  },
  {
    name: 'Premium',
    price: 19.99,
    interval: 'month',
    features: [
      'Paseos ilimitados',
      'Soporte prioritario',
      'Acceso a walkers premium',
      'Seguimiento en tiempo real',
      'Seguro incluido'
    ],
    stripe_price_id: 'price_premium_monthly',
    popular: true
  },
  {
    name: 'Anual',
    price: 199.99,
    interval: 'year',
    features: [
      'Paseos ilimitados',
      'Soporte prioritario',
      'Acceso a walkers premium',
      'Seguimiento en tiempo real',
      'Seguro incluido',
      '2 meses gratis'
    ],
    stripe_price_id: 'price_annual',
    popular: false
  }
];

async function seedComprehensiveDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Insert users
    console.log('👥 Inserting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(comprehensiveUsers)
      .select();

    if (usersError) {
      throw usersError;
    }

    console.log(`✅ Inserted ${users.length} users`);

    // Insert dogs for owners
    console.log('🐕 Inserting dogs...');
    const ownerUsers = users.filter(user => user.user_type === 'owner');
    const dogsToInsert = [];

    for (let i = 0; i < ownerUsers.length; i++) {
      const owner = ownerUsers[i];
      const dog = comprehensiveDogs[i % comprehensiveDogs.length];
      dogsToInsert.push({
        ...dog,
        owner_id: owner.id
      });
    }

    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .insert(dogsToInsert)
      .select();

    if (dogsError) {
      throw dogsError;
    }

    console.log(`✅ Inserted ${dogs.length} dogs`);

    // Insert walker profiles
    console.log('🚶 Inserting walker profiles...');
    const walkerUsers = users.filter(user => user.user_type === 'walker');
    const profilesToInsert = [];

    for (let i = 0; i < walkerUsers.length; i++) {
      const walker = walkerUsers[i];
      const profile = comprehensiveWalkerProfiles[i % comprehensiveWalkerProfiles.length];
      profilesToInsert.push({
        ...profile,
        user_id: walker.id
      });
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('walker_profiles')
      .insert(profilesToInsert)
      .select();

    if (profilesError) {
      throw profilesError;
    }

    console.log(`✅ Inserted ${profiles.length} walker profiles`);

    // Insert subscription plans
    console.log('💳 Inserting subscription plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .insert(comprehensiveSubscriptionPlans)
      .select();

    if (plansError) {
      throw plansError;
    }

    console.log(`✅ Inserted ${plans.length} subscription plans`);

    // Insert sample walk requests
    console.log('🚶‍♀️ Inserting walk requests...');
    const walkRequests = [
      {
        owner_id: users[0].id, // María
        walker_id: users[6].id, // Alejandro
        dog_id: dogs[0].id, // Luna
        service_type: 'walk',
        duration: 30,
        walk_date: '2024-01-25',
        walk_time: '10:00:00',
        location: 'Parque del Retiro, Madrid',
        status: 'pending',
        price: 18.00,
        notes: 'Paseo perfecto para Luna, que es muy tranquila.'
      },
      {
        owner_id: users[1].id, // Carlos
        walker_id: users[7].id, // Carmen
        dog_id: dogs[1].id, // Max
        service_type: 'walk',
        duration: 45,
        walk_date: '2024-01-26',
        walk_time: '14:30:00',
        location: 'Casa de Campo, Madrid',
        status: 'accepted',
        price: 22.50,
        notes: 'Max necesita ejercicio moderado, es muy energético.'
      },
      {
        owner_id: users[2].id, // Ana
        walker_id: users[8].id, // Roberto
        dog_id: dogs[2].id, // Bruno
        service_type: 'walk',
        duration: 60,
        walk_date: '2024-01-27',
        walk_time: '09:00:00',
        location: 'Parc de la Ciutadella, Barcelona',
        status: 'pending',
        price: 24.00,
        notes: 'Bruno es muy leal pero necesita paseos largos.'
      }
    ];

    const { data: walkRequestsData, error: walkRequestsError } = await supabase
      .from('walk_requests')
      .insert(walkRequests)
      .select();

    if (walkRequestsError) {
      throw walkRequestsError;
    }

    console.log(`✅ Inserted ${walkRequestsData.length} walk requests`);

    // Insert sample reviews
    console.log('⭐ Inserting reviews...');
    const reviews = [
      {
        walk_request_id: walkRequestsData[0].id,
        reviewer_id: users[0].id, // María
        reviewed_id: users[6].id, // Alejandro
        rating: 5,
        tags: ['puntual', 'cuidadoso', 'recomendado'],
        comment: 'Alejandro fue excelente con Luna. Muy puntual, cuidadoso y profesional. Lo recomiendo totalmente.'
      }
    ];

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviews)
      .select();

    if (reviewsError) {
      throw reviewsError;
    }

    console.log(`✅ Inserted ${reviewsData.length} reviews`);

    // Insert sample chat messages
    console.log('💬 Inserting chat messages...');
    const chatMessages = [
      {
        request_id: walkRequestsData[2].id,
        sender_id: users[2].id, // Ana
        message: 'Hola Roberto, ¿podrías pasear a Bruno mañana a las 9:00? Necesita un paseo largo porque es muy activo.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        request_id: walkRequestsData[2].id,
        sender_id: users[8].id, // Roberto
        message: '¡Hola Ana! Sí, perfecto. Me encantan los Pastores Alemanes. ¿Alguna instrucción especial para Bruno?',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ];

    const { data: chatMessagesData, error: chatMessagesError } = await supabase
      .from('chat_messages')
      .insert(chatMessages)
      .select();

    if (chatMessagesError) {
      throw chatMessagesError;
    }

    console.log(`✅ Inserted ${chatMessagesData.length} chat messages`);

    // Insert sample notifications
    console.log('🔔 Inserting notifications...');
    const notifications = [
      {
        user_id: users[8].id, // Roberto
        title: 'Nueva solicitud de paseo',
        message: 'Ana Fernández ha solicitado un paseo para Bruno',
        type: 'walk_request',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        user_id: users[0].id, // María
        title: 'Paseo confirmado',
        message: 'Tu paseo con Luna ha sido confirmado para mañana',
        type: 'walk_confirmed',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (notificationsError) {
      throw notificationsError;
    }

    console.log(`✅ Inserted ${notificationsData.length} notifications`);

    console.log('🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Dogs: ${dogs.length}`);
    console.log(`- Walker Profiles: ${profiles.length}`);
    console.log(`- Subscription Plans: ${plans.length}`);
    console.log(`- Walk Requests: ${walkRequestsData.length}`);
    console.log(`- Reviews: ${reviewsData.length}`);
    console.log(`- Chat Messages: ${chatMessagesData.length}`);
    console.log(`- Notifications: ${notificationsData.length}`);

  } catch (error) {
    console.error('❌ Error seeding comprehensive database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedComprehensiveDatabase();
}

export { seedComprehensiveDatabase };
