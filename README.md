# Xantina Backend - NestJS API

Backend API construido con **NestJS**, **MongoDB**, siguiendo arquitectura **Domain-Driven Design (DDD)** y principios **SOLID**.

## 🚀 Tecnologías

- **Framework**: NestJS 11.x
- **Base de datos**: MongoDB (Mongoose)
- **Autenticación**: JWT + bcrypt
- **Validación**: class-validator + class-transformer
- **Lenguaje**: TypeScript
- **Despliegue**: Vercel

## 📁 Estructura del Proyecto

```
src/
├── main.ts                          # Punto de entrada de la aplicación
├── app.module.ts                    # Módulo raíz
├── app.controller.ts                # Controlador raíz
├── app.service.ts                   # Servicio raíz
└── contexts/                        # Bounded Contexts (DDD)
    ├── shared/                      # Módulo compartido
    │   ├── config/
    │   │   └── config.module.ts
    │   ├── decorators/
    │   │   └── user.decorator.ts
    │   ├── dto/
    │   │   └── pagination.dto.ts
    │   ├── filters/
    │   │   └── http-exception.filter.ts
    │   ├── interfaces/
    │   │   └── base.repository.ts
    │   ├── utils/
    │   │   └── date.util.ts
    │   └── shared.module.ts
    │
    ├── auth/                        # Contexto de autenticación
    │   ├── application/
    │   │   ├── dto/
    │   │   │   ├── register.dto.ts
    │   │   │   └── login.dto.ts
    │   │   └── auth.service.ts
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── user.entity.ts
    │   │   └── repositories/
    │   │       └── user.repository.interface.ts
    │   ├── infrastructure/
    │   │   ├── schemas/
    │   │   │   └── user.schema.ts
    │   │   └── persistence/
    │   │       └── user.repository.ts
    │   ├── interfaces/
    │   │   └── auth.controller.ts
    │   └── auth.module.ts
    │
    ├── extraccion/                  # Contexto de recetas y extracciones
    │   ├── application/
    │   │   ├── dto/
    │   │   │   ├── create-receta.dto.ts
    │   │   │   └── update-receta.dto.ts
    │   │   └── extraccion.service.ts
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── receta.entity.ts
    │   │   └── repositories/
    │   │       └── receta.repository.interface.ts
    │   ├── infrastructure/
    │   │   ├── schemas/
    │   │   │   └── receta.schema.ts
    │   │   └── persistence/
    │   │       └── receta.repository.ts
    │   ├── interfaces/
    │   │   └── extraccion.controller.ts
    │   └── extraccion.module.ts
    │
    ├── tienda/                      # Contexto de tienda/productos
    │   ├── application/
    │   │   ├── dto/
    │   │   │   ├── create-producto.dto.ts
    │   │   │   └── update-producto.dto.ts
    │   │   └── tienda.service.ts
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── producto.entity.ts
    │   │   └── repositories/
    │   │       └── producto.repository.interface.ts
    │   ├── infrastructure/
    │   │   ├── schemas/
    │   │   │   └── producto.schema.ts
    │   │   └── persistence/
    │   │       └── producto.repository.ts
    │   ├── interfaces/
    │   │   └── tienda.controller.ts
    │   └── tienda.module.ts
    │
    └── social/                      # Contexto de red social
        ├── application/
        │   ├── dto/
        │   │   ├── create-post.dto.ts
        │   │   └── update-post.dto.ts
        │   └── social.service.ts
        ├── domain/
        │   ├── entities/
        │   │   └── post.entity.ts
        │   └── repositories/
        │       └── post.repository.interface.ts
        ├── infrastructure/
        │   ├── schemas/
        │   │   └── post.schema.ts
        │   └── persistence/
        │       └── post.repository.ts
        ├── interfaces/
        │   └── social.controller.ts
        └── social.module.ts
```

## ⚙️ Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto de la aplicación
PORT=3000

# Conexión a MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# JWT Secret para autenticación
JWT_SECRET=supersecretkey
```

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🌐 API Endpoints

Base URL: `http://localhost:3000/api`

### 🔐 Autenticación (`/api/auth`)

- `POST /auth/register` - Registrar nuevo usuario
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

- `POST /auth/login` - Iniciar sesión
  ```json
  {
    "email": "juan@example.com",
    "password": "password123"
  }
  ```

### ☕ Extracción (`/api/extraccion`)

- `GET /extraccion` - Obtener todas las recetas
- `GET /extraccion?metodo=v60` - Filtrar por método
- `GET /extraccion/:id` - Obtener receta por ID
- `POST /extraccion` - Crear nueva receta
  ```json
  {
    "nombre": "Espresso Clásico",
    "metodo": "espresso",
    "ratio": "1:2",
    "notas": "Temperatura 93°C"
  }
  ```
- `PUT /extraccion/:id` - Actualizar receta
- `DELETE /extraccion/:id` - Eliminar receta

### 🛍️ Tienda (`/api/tienda`)

- `GET /tienda` - Obtener todos los productos
- `GET /tienda?nombre=cafe` - Buscar por nombre
- `GET /tienda?inStock=true` - Productos en stock
- `GET /tienda/:id` - Obtener producto por ID
- `POST /tienda` - Crear nuevo producto
  ```json
  {
    "nombre": "Café Colombia",
    "precio": 25.99,
    "stock": 100,
    "descripcion": "Café de origen único"
  }
  ```
- `PUT /tienda/:id` - Actualizar producto
- `DELETE /tienda/:id` - Eliminar producto

### 🌐 Social (`/api/social`)

- `GET /social` - Obtener todos los posts
- `GET /social?autor=usuario123` - Filtrar por autor
- `GET /social/:id` - Obtener post por ID
- `POST /social` - Crear nuevo post
  ```json
  {
    "autor": "usuario123",
    "contenido": "Mi primera extracción perfecta!"
  }
  ```
- `PUT /social/:id` - Actualizar post
- `DELETE /social/:id` - Eliminar post
- `PATCH /social/:id/like` - Dar like a un post

## 🏗️ Arquitectura

### Domain-Driven Design (DDD)

El proyecto está organizado en **Bounded Contexts**, cada uno con su propia estructura:

- **Application**: Casos de uso y servicios de aplicación
- **Domain**: Entidades e interfaces de repositorios
- **Infrastructure**: Implementaciones técnicas (schemas, repositorios)
- **Interfaces**: Controladores REST

### Principios SOLID

- **S** - Single Responsibility: Cada clase tiene una única responsabilidad
- **O** - Open/Closed: Extensible sin modificar el código existente
- **L** - Liskov Substitution: Uso de interfaces para repositorios
- **I** - Interface Segregation: Interfaces específicas y pequeñas
- **D** - Dependency Inversion: Dependencia de abstracciones (interfaces)

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt**
- Autenticación con **JWT**
- Validación de datos con **class-validator**
- CORS habilitado
- Exception filters globales

## 📝 Características Globales

- **Prefijo de API**: `/api`
- **CORS**: Habilitado
- **ValidationPipe**: Validación automática de DTOs
- **HttpExceptionFilter**: Manejo global de errores
- **Transform**: Transformación automática de tipos

## 🚀 Despliegue en Vercel

El proyecto está configurado para desplegarse en Vercel. Asegúrate de:

1. Configurar las variables de entorno en Vercel
2. Tener tu cluster de MongoDB accesible públicamente
3. Usar `npm run build` antes del despliegue

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

---

**Autor**: Guillermo Tantalean Mesta  
**Universidad**: UPC  
**Curso**: Aplicaciones Móviles 2025-2