import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import type { IAppUserRepository } from '../../domain/repositories/app-user.repository.interface';
import { AppUserDocument } from '../schemas/app-user.schema';

@Injectable()
export class AdminUserSeeder implements OnModuleInit {
  constructor(
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
    @InjectModel(AppUserDocument.name)
    private readonly appUserModel: Model<AppUserDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    try {
      console.log('👤 Verificando usuario administrador...');

      const adminEmail = 'admin@xantina.com';
      const existingAdmin = await this.appUserModel
        .findOne({ email: adminEmail })
        .exec();

      if (existingAdmin) {
        console.log('✅ Usuario administrador ya existe');
        return;
      }

      const hashedPassword = await bcrypt.hash('Admin123', 10);

      await this.appUserRepository.createUser({
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('   Email: admin@xantina.com');
      console.log('   Password: Admin123');
    } catch (error) {
      console.error('❌ Error al crear usuario administrador:', error);
    }
  }
}
