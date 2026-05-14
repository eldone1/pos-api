# 🏪 POS API

API RESTful moderna y escalable para sistema de Punto de Venta (POS), construida con NestJS, TypeORM y MySQL.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

Sistema backend completo para la gestión de un punto de venta que incluye administración de productos, categorías, ventas, usuarios y reportes. La API cuenta con autenticación JWT, validación de datos, documentación automática con Swagger y control de acceso basado en roles.

## ✨ Características

- 🔐 **Autenticación y Autorización**: Sistema JWT con roles de usuario
- 📦 **Gestión de Productos**: CRUD completo con control de stock y SKU
- 🏷️ **Categorías**: Organización jerárquica de productos
- 💰 **Ventas**: Registro de ventas con detalle de productos
- 👥 **Usuarios**: Administración de usuarios con roles
- 📊 **Reportes**: Generación de reportes de ventas
- 📚 **Documentación**: API documentada con Swagger/OpenAPI
- ✅ **Validación**: Validación automática de datos con class-validator
- 🔄 **CORS**: Configuración de CORS habilitada

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Lenguaje**: TypeScript
- **ORM**: TypeORM v0.3
- **Base de Datos**: MySQL
- **Autenticación**: JWT (Passport)
- **Validación**: class-validator & class-transformer
- **Documentación**: Swagger/OpenAPI
- **Encriptación**: bcrypt
- **Testing**: Jest

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.x

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd pos-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
# Puerto de la aplicación
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3308
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=pos_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d

# Entorno
NODE_ENV=development
```

4. **Crear la base de datos**
```bash
mysql -u root -p
CREATE DATABASE pos_db;
```

## 🎯 Ejecución

### Modo Desarrollo
```bash
npm run start:dev
```

### Modo Producción
```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Modo Debug
```bash
npm run start:debug
```

La API estará disponible en `http://localhost:3000/api/v1`

## 📚 Documentación de la API

La documentación interactiva de Swagger está disponible en:

```
http://localhost:3000/api/docs
```

### Endpoints Principales

#### 🔐 Autenticación (`/api/v1/auth`)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil del usuario autenticado

#### 👥 Usuarios (`/api/v1/users`)
- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario específico
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

#### 🏷️ Categorías (`/api/v1/categories`)
- `POST /categories` - Crear categoría
- `GET /categories` - Listar todas las categorías
- `GET /categories/active` - Listar categorías activas
- `GET /categories/:id` - Obtener categoría con sus productos
- `PATCH /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

#### 📦 Productos (`/api/v1/products`)
- `POST /products` - Crear producto
- `GET /products` - Listar todos los productos
- `GET /products/active` - Listar productos activos
- `GET /products/low-stock` - Listar productos con stock bajo
- `GET /products/:id` - Obtener producto específico
- `GET /products/sku/:sku` - Buscar producto por SKU
- `PATCH /products/:id` - Actualizar producto
- `PATCH /products/:id/stock` - Actualizar stock del producto
- `DELETE /products/:id` - Eliminar producto

#### 💰 Ventas (`/api/v1/sales`)
- `POST /sales` - Registrar nueva venta
- `GET /sales` - Listar todas las ventas
- `GET /sales/:id` - Obtener detalle de venta

#### 📊 Reportes (`/api/v1/reports`)
- Endpoints para generación de reportes

## 🏗️ Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── decorators/         # Decoradores personalizados
│   ├── dto/                # DTOs de autenticación
│   ├── guards/             # Guards de autenticación y roles
│   └── strategies/         # Estrategias de Passport
├── categories/             # Módulo de categorías
│   ├── dto/               # DTOs de categorías
│   └── entities/          # Entidad de categoría
├── config/                # Configuraciones
│   └── database.config.ts # Configuración de base de datos
├── products/              # Módulo de productos
│   ├── dto/              # DTOs de productos
│   └── entities/         # Entidad de producto
├── reports/              # Módulo de reportes
├── sales/                # Módulo de ventas
│   ├── dto/             # DTOs de ventas
│   └── entities/        # Entidades de venta
├── users/               # Módulo de usuarios
│   ├── dto/            # DTOs de usuarios
│   └── entities/       # Entidad de usuario
├── app.module.ts       # Módulo raíz
└── main.ts             # Punto de entrada de la aplicación
```

## 🧪 Testing

### Ejecutar Tests Unitarios
```bash
npm run test
```

### Tests en Modo Watch
```bash
npm run test:watch
```

### Tests End-to-End (E2E)
```bash
npm run test:e2e
```

### Cobertura de Tests
```bash
npm run test:cov
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración configurable
- **Hashing de Contraseñas**: bcrypt para encriptación de contraseñas
- **Validación de Datos**: Validación automática de DTOs
- **Guards**: Protección de rutas con autenticación y roles
- **CORS**: Configuración de CORS para control de acceso

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo (watch mode)
npm run start:debug        # Iniciar en modo debug

# Producción
npm run build              # Compilar el proyecto
npm run start:prod         # Ejecutar versión de producción

# Calidad de Código
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier

# Testing
npm run test               # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con cobertura
npm run test:e2e           # Tests end-to-end
```

## 🚀 Deployment

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables de entorno en tu servidor de producción:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-host
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=pos_db
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRES_IN=1d
```

### Build para Producción

```bash
# Compilar
npm run build

# La carpeta dist/ contendrá el código compilado
# Ejecutar con Node.js
node dist/main.js
```

### Docker (Opcional)

Si deseas usar Docker, puedes crear un `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

## 📝 Mejores Prácticas

- ✅ Usar DTOs para validación de datos
- ✅ Implementar guards para protección de rutas
- ✅ Validar entrada de usuarios con class-validator
- ✅ Usar decoradores personalizados para lógica reutilizable
- ✅ Separar lógica de negocio en servicios
- ✅ Documentar endpoints con Swagger
- ✅ Manejar errores con exception filters
- ✅ Usar variables de entorno para configuración

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es para uso libre.

## 👨‍💻 Autor

Desarrollado con ❤️ para todos. By Diego Minaya y Claude Code <3

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)

---

**Nota**: Este proyecto está en desarrollo activo. Para reportar bugs o solicitar nuevas características, por favor crea un issue en el repositorio.
