# 🏗️ Arquitectura del Proyecto

## Domain-Driven Design (DDD)

Este proyecto implementa **Domain-Driven Design** con una arquitectura por capas y bounded contexts.

## 📐 Capas de la Arquitectura

### 1. **Domain Layer** (Dominio)

La capa más interna, contiene la lógica de negocio pura.

```
domain/
├── entities/          # Entidades del dominio
└── repositories/      # Interfaces de repositorios
```

**Características:**
- Sin dependencias externas
- Lógica de negocio pura
- Entidades con comportamiento
- Interfaces para inversión de dependencias

**Ejemplo:**
```typescript
// user.entity.ts
export class User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  
  constructor(name: string, email: string, password: string, role: string = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
```

### 2. **Application Layer** (Aplicación)

Contiene los casos de uso y la lógica de aplicación.

```
application/
├── dto/              # Data Transfer Objects
└── *.service.ts      # Servicios de aplicación
```

**Características:**
- Orquesta el flujo de datos
- Implementa casos de uso
- Usa interfaces del dominio
- Valida datos de entrada (DTOs)

**Ejemplo:**
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    // Lógica del caso de uso de registro
  }
}
```

### 3. **Infrastructure Layer** (Infraestructura)

Implementaciones técnicas y detalles de persistencia.

```
infrastructure/
├── schemas/          # Esquemas de MongoDB
└── persistence/      # Implementación de repositorios
```

**Características:**
- Implementa interfaces del dominio
- Maneja persistencia de datos
- Convierte entre entidades y esquemas
- Detalles técnicos de frameworks

**Ejemplo:**
```typescript
// user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toEntity(user) : null;
  }
  
  private toEntity(userDoc: UserDocument): User {
    // Conversión de documento a entidad
  }
}
```

### 4. **Interfaces Layer** (Presentación)

Controladores REST y puntos de entrada.

```
interfaces/
└── *.controller.ts   # Controladores REST
```

**Características:**
- Maneja HTTP requests/responses
- Valida entrada (con DTOs)
- Delega a servicios de aplicación
- Formatea respuestas

**Ejemplo:**
```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
```

## 🎯 Bounded Contexts

El proyecto está dividido en contextos delimitados (bounded contexts):

### 1. **Auth Context** 
Responsabilidad: Autenticación y autorización
- Entidades: User
- Casos de uso: Register, Login, Validate

### 2. **Extraccion Context**
Responsabilidad: Gestión de recetas de café
- Entidades: Receta
- Casos de uso: CRUD de recetas, Búsqueda por método

### 3. **Tienda Context**
Responsabilidad: Gestión de productos
- Entidades: Producto
- Casos de uso: CRUD productos, Gestión de stock

### 4. **Social Context**
Responsabilidad: Red social para usuarios
- Entidades: Post
- Casos de uso: CRUD posts, Sistema de likes

### 5. **Shared Context**
Responsabilidad: Funcionalidad compartida
- Config, Utils, Filters, Decorators, Interfaces base

## 🔄 Flujo de una Request

```
1. HTTP Request
   ↓
2. Controller (interfaces/)
   ↓ valida DTO
3. Service (application/)
   ↓ orquesta lógica
4. Repository Interface (domain/)
   ↓ abstracción
5. Repository Implementation (infrastructure/)
   ↓ persistencia
6. MongoDB
   ↓
   ← respuesta
```

## 🎨 Principios SOLID Aplicados

### Single Responsibility Principle (SRP)
Cada clase tiene una única responsabilidad:
- Controllers: Manejar HTTP
- Services: Casos de uso
- Repositories: Persistencia
- Entities: Lógica de negocio

### Open/Closed Principle (OCP)
Extensible sin modificar código existente:
- Interfaces permiten nuevas implementaciones
- Decorators y Guards extensibles

### Liskov Substitution Principle (LSP)
Uso de interfaces para abstraer implementaciones:
```typescript
@Inject('IUserRepository')
private readonly userRepository: IUserRepository
```

### Interface Segregation Principle (ISP)
Interfaces específicas y pequeñas:
```typescript
export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
```

### Dependency Inversion Principle (DIP)
Dependencias de abstracciones, no implementaciones:
```typescript
// ✅ Correcto - Depende de interfaz
constructor(@Inject('IUserRepository') private repo: IUserRepository)

// ❌ Incorrecto - Depende de implementación
constructor(private repo: UserRepository)
```

## 📦 Patrón Repository

Abstrae la persistencia de datos:

```typescript
// Interfaz (domain/)
export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}

// Implementación (infrastructure/)
export class UserRepository implements IUserRepository {
  // Detalles de MongoDB
}

// Uso (application/)
constructor(@Inject('IUserRepository') private userRepo: IUserRepository)
```

**Beneficios:**
- Testeable (mock repositories)
- Cambio de BD sin afectar lógica
- Separación de responsabilidades

## 🔐 Patrones de Seguridad

### 1. Data Transfer Objects (DTOs)
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;
  
  @MinLength(6)
  password: string;
}
```

### 2. Password Hashing
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### 3. JWT Authentication
```typescript
const token = this.jwtService.sign(payload);
```

## 📊 Diagrama de Dependencias

```
┌─────────────────────────────────────────────┐
│              Interfaces Layer                │
│         (Controllers, Guards)                │
└────────────────┬────────────────────────────┘
                 │ depende de ↓
┌────────────────┴────────────────────────────┐
│           Application Layer                  │
│    (Services, Use Cases, DTOs)              │
└────────────────┬────────────────────────────┘
                 │ depende de ↓
┌────────────────┴────────────────────────────┐
│             Domain Layer                     │
│   (Entities, Repository Interfaces)         │
└────────────────△────────────────────────────┘
                 │ implementado por ↑
┌────────────────┴────────────────────────────┐
│         Infrastructure Layer                 │
│  (Repositories, Schemas, External APIs)     │
└─────────────────────────────────────────────┘
```

## 🧪 Testing Strategy

### Unit Tests
- Domain entities (lógica pura)
- Services (con mock repositories)

### Integration Tests
- Controllers + Services
- Repositories + Database

### E2E Tests
- Flujos completos
- HTTP requests reales

## 🚀 Escalabilidad

### Horizontal
- Stateless application
- JWT en lugar de sesiones
- MongoDB puede escalar horizontalmente

### Vertical
- Separación por contextos
- Microservicios potenciales
- Eventos de dominio (futuro)

## 📈 Mejoras Futuras

1. **Event-Driven Architecture**
   - Domain Events
   - Event Sourcing
   - CQRS pattern

2. **Advanced Patterns**
   - Specification Pattern
   - Factory Pattern
   - Strategy Pattern

3. **Microservices**
   - Separar contextos
   - Message queues
   - Service mesh

## 📚 Referencias

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

Esta arquitectura proporciona:
✅ Separación de responsabilidades
✅ Testabilidad
✅ Mantenibilidad
✅ Escalabilidad
✅ Flexibilidad para cambios
