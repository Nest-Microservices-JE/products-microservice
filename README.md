# Microservicio de Productos (Products Microservice)

Este proyecto es un microservicio desarrollado en NestJS para la gestión de productos, utilizando TCP como protocolo de transporte y Prisma ORM con SQLite para la persistencia de datos.

## Descripción del Proyecto

El microservicio se encarga de administrar el catálogo de productos mediante mensajería basada en patrones TCP. Implementa borrado lógico (soft delete) para asegurar la integridad de los datos y respuestas paginadas para los listados de productos.

## Tecnologías Utilizadas

- NestJS (Framework de Node.js)
- NestJS Microservices (Transporte TCP)
- Prisma ORM con adaptador `@prisma/adapter-better-sqlite3`
- SQLite (Base de datos)
- Joi (Validación de variables de entorno)
- Class Validator / Class Transformer (Validación de DTOs)
- Oxlint y Prettier (Linter y formateo de código)

## Características e Implementaciones

- Arquitectura de Microservicio: Configurado para escuchar peticiones TCP mediante `@nestjs/microservices`.
- Gestión de Base de Datos: Modelo `Product` gestionado mediante Prisma ORM.
- Borrado Lógico (Soft Delete): En lugar de eliminar físicamente registros de la base de datos, se actualiza el campo `available` a `false`.
- Filtrado Automático: Las búsquedas (`find_all_products`, `find_one_product`) retornan únicamente los productos que se encuentran disponibles (`available: true`).
- Paginación Integrada: El patrón `find_all_products` acepta parámetros `page` y `limit`, retornando los resultados junto con metadatos (`total`, `page`, `lastPage`).
- Validación Estricta: Uso de `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` habilitados para desestimar propiedades no permitidas.
- Validación de Entorno: Variables de entorno strictly validadas con `Joi` al iniciar la aplicación.

## Estructura del Modelo de Datos (Prisma)

El modelo de datos `Product` definido en `prisma/schema.prisma` cuenta con los siguientes campos:

- id (Int): Identificador único autoincremental (Clave primaria).
- name (String): Nombre del producto (Único).
- price (Float): Precio del producto.
- available (Boolean): Estado de disponibilidad (Por defecto `true`). Cuenta con un índice explícito `@@index([available])` para optimizar las consultas.
- createdAt (DateTime): Fecha de creación del registro.
- updatedAt (DateTime): Fecha de última actualización del registro.

## Patrones de Mensajes TCP (Message Patterns)

El microservicio expone los siguientes patrones mediante el decorador `@MessagePattern`:

### 1. Crear producto
- Patrón: `{ cmd: 'create_product' }`
- Payload: `CreateProductDto` (`name`: string, `price`: number)

### 2. Listar productos paginados
- Patrón: `{ cmd: 'find_all_products' }`
- Payload: `PaginationDto` (`page`: number opcional, `limit`: number opcional)
- Respuesta: Objeto con `data` (lista de productos disponibles) y `metadata` (`total`, `page`, `lastPage`).

### 3. Obtener un producto por ID
- Patrón: `{ cmd: 'find_one_product' }`
- Payload: `{ id: string | number }`
- Respuesta: Producto correspondiente si se encuentra disponible (`available: true`).

### 4. Actualizar producto
- Patrón: `{ cmd: 'update_product' }`
- Payload: `UpdateProductDto` (`id`: number, `name`?: string, `price`?: number)

### 5. Eliminar producto (Soft Delete)
- Patrón: `{ cmd: 'delete_product' }`
- Payload: `{ id: string | number }`
- Acción: Marca el campo `available` como `false`.

## Configuración del Entorno

Crear un archivo `.env` en la raíz del proyecto basándose en el archivo `.env.template`:

```env
PORT=3001
DATABASE_URL="file:./dev.db"
```

Variables requeridas:
- PORT: Puerto en el que se ejecutará el servicio TCP.
- DATABASE_URL: Cadena de conexión para SQLite.

## Instalación y Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Generar cliente de Prisma y ejecutar migraciones:

```bash
npx prisma migrate dev
npx prisma generate
```

## Ejecución del Proyecto

```bash
# Desarrollo
npm run start

# Modo Watch (Desarrollo continuo)
npm run start:dev

# Producción
npm run start:prod
```

## Linter y Formateo de Código

```bash
# Formatear código con Prettier
npm run format

# Ejecutar Oxlint
npm run lint
```
