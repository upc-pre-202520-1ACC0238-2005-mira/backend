# 🚀 Guía de Inicio Rápido - Xantina Backend

## 📋 Pre-requisitos

- Node.js 18+ instalado
- MongoDB Atlas cuenta configurada
- npm o yarn

## ⚡ Pasos para iniciar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Verifica que tu archivo `.env` tenga:

```env
PORT=3000
MONGO_URI=mongodb+srv://guillermo_db_user:OLOBSm8owOTsDsvr@xantinacluster.pxjysks.mongodb.net/?retryWrites=true&w=majority&appName=xantinaCluster
JWT_SECRET=supersecretkey
```

### 3. Iniciar en modo desarrollo

```bash
npm run start:dev
```

El servidor estará disponible en: `http://localhost:3000/api`

## 🧪 Probar la API

### 1. Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Guarda el `access_token` de la respuesta.

### 3. Crear una receta

```bash
curl -X POST http://localhost:3000/api/extraccion \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Espresso Perfecto",
    "metodo": "espresso",
    "ratio": "1:2",
    "notas": "18g café, 36g agua, 25-30 segundos"
  }'
```

### 4. Crear un producto

```bash
curl -X POST http://localhost:3000/api/tienda \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Café Colombia Premium",
    "precio": 29.99,
    "stock": 50,
    "descripcion": "Café de altura con notas cítricas"
  }'
```

### 5. Crear un post

```bash
curl -X POST http://localhost:3000/api/social \
  -H "Content-Type: application/json" \
  -d '{
    "autor": "test@example.com",
    "contenido": "¡Acabo de preparar mi mejor espresso!"
  }'
```

### 6. Obtener todos los posts

```bash
curl http://localhost:3000/api/social
```

### 7. Dar like a un post

```bash
curl -X PATCH http://localhost:3000/api/social/{POST_ID}/like
```

## 📦 Estructura de respuestas

### Registro exitoso

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f123...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Error de validación

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🔍 Comandos útiles

```bash
# Desarrollo con watch mode
npm run start:dev

# Build para producción
npm run build

# Iniciar producción
npm run start:prod

# Linter
npm run lint

# Format código
npm run format
```

## 🐛 Troubleshooting

### Error de conexión a MongoDB

- Verifica que tu IP esté en la lista blanca de MongoDB Atlas
- Verifica que las credenciales sean correctas
- Verifica que el string de conexión esté bien formado

### Error al instalar dependencias

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Puerto en uso

Si el puerto 3000 está ocupado, cambia el `PORT` en `.env`:

```env
PORT=3001
```

## 📝 Próximos pasos

1. Implementar guards JWT para proteger rutas
2. Agregar paginación a los endpoints
3. Implementar tests unitarios
4. Agregar documentación Swagger
5. Implementar rate limiting
6. Agregar logs con Winston

## 🆘 Soporte

Si tienes problemas:

1. Verifica los logs en la consola
2. Revisa que MongoDB esté accesible
3. Verifica las variables de entorno
4. Revisa que todas las dependencias estén instaladas

---

¡Listo para desarrollar! 🎉
