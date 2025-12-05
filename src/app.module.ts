import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './contexts/shared/shared.module';
import { AuthModule } from './contexts/auth/auth.module';
import { UserAuthModule } from './contexts/user-auth/user-auth.module';
import { ExtraccionModule } from './contexts/extraccion/extraccion.module';
import { TiendaModule } from './contexts/tienda/tienda.module';
import { SocialModule } from './contexts/social/social.module';
import { BusinessModule } from './contexts/business/business.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log(
          '🧩 MONGO_URI cargada:',
          uri ? '✅ OK' : '❌ No encontrada',
        );
        return { uri };
      },
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    SharedModule,
    AuthModule,
    UserAuthModule,
    ExtraccionModule,
    TiendaModule,
    SocialModule,
    BusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
