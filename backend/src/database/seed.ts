import { supabase } from '@/config/database';
import dotenv from 'dotenv';

dotenv.config();

// Sample data for seeding
const sampleUsers = [
  {
    name: 'María García',
    email: 'maria@example.com',
    phone: '+34 612 345 678',
    city: 'Madrid',
    postal_code: '28001',
    user_type: 'owner' as const
  },
  {
    name: 'Carlos López',
    email: 'carlos@example.com',
    phone: '+34 623 456 789',
    city: 'Madrid',
    postal_code: '28002',
    user_type: 'walker' as const
  },
  {
    name: 'Ana Rodríguez',
    email: 'ana@example.com',
    phone: '+34 634 567 890',
    city: 'Barcelona',
    postal_code: '08001',
    user_type: 'owner' as const
  },
  {
    name: 'David Martín',
    email: 'david@example.com',
    phone: '+34 645 678 901',
    city: 'Barcelona',
    postal_code: '08002',
    user_type: 'walker' as const
  }
];

const sampleDogs = [
  {
    name: 'Lucas',
    age: '3 años',
    breed: 'Golden Retriever',
    notes: 'Muy amigable, le gusta jugar con otros perros. Necesita ejercicio diario.',
    image_url: null
  },
  {
    name: 'Luna',
    age: '2 años',
    breed: 'Border Collie',
    notes: 'Muy activa, necesita paseos largos. Obediente pero puede ser tímida al principio.',
    image_url: null
  }
];

const sampleWalkerProfiles = [
  {
    bio: 'Apasionado por los perros con más de 5 años de experiencia cuidando mascotas.',
    experience: '5+ años de experiencia paseando perros de todas las razas y tamaños.',
    hourly_rate: 15.00,
    availability: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
    tags: ['experiencia', 'confiable', 'amante de los perros'],
    verified: true
  },
  {
    bio: 'Estudiante de veterinaria con gran amor por los animales.',
    experience: '2 años paseando perros mientras estudio veterinaria.',
    hourly_rate: 12.00,
    availability: ['sábado', 'domingo', 'lunes', 'martes'],
    tags: ['estudiante veterinaria', 'cuidado especializado', 'joven'],
    verified: false
  }
];

const sampleSubscriptionPlans = [
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

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert users
    console.log('👥 Inserting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(sampleUsers)
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
      const dog = sampleDogs[i % sampleDogs.length];
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
      const profile = sampleWalkerProfiles[i % sampleWalkerProfiles.length];
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
      .insert(sampleSubscriptionPlans)
      .select();

    if (plansError) {
      throw plansError;
    }

    console.log(`✅ Inserted ${plans.length} subscription plans`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Dogs: ${dogs.length}`);
    console.log(`- Walker Profiles: ${profiles.length}`);
    console.log(`- Subscription Plans: ${plans.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
