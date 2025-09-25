import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_WORKOUT_TYPES = [
  { name: 'Treino A', icon: '🅰️' },
  { name: 'Treino B', icon: '🅱️' },
  { name: 'Treino C', icon: '🔥' },
  { name: 'Treino D', icon: '💪' },
  { name: 'Treino E', icon: '⚡' },
  { name: 'Treino F', icon: '🏋️' },
  { name: 'Treino G', icon: '🚀' },
  { name: 'Treino H', icon: '🎯' },
  { name: 'Treino I', icon: '💯' },
];

async function main() {
  console.log('🌱 Starting seed...');
  
  // Clean existing workout types
  await prisma.workoutType.deleteMany();
  console.log('🧹 Cleaned existing workout types');
  
  // Seed workout types
  for (const workoutType of DEFAULT_WORKOUT_TYPES) {
    await prisma.workoutType.create({
      data: workoutType,
    });
  }
  
  console.log(`✅ Seeded ${DEFAULT_WORKOUT_TYPES.length} workout types`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });