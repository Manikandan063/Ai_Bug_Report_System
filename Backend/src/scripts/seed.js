import sequelize, { connectDB } from '../config/db.js';
import { initModels, User } from '../models/initModels.js';
import { hashPassword } from '../shared/utils/bcrypt.js';

const seedAdmin = async () => {
  await connectDB();
  await initModels();
  
  const existingAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    });
    console.log('Super Admin seeded successfully');
  } else {
    console.log('Super Admin already exists');
  }
  
  process.exit(0);
};

seedAdmin();