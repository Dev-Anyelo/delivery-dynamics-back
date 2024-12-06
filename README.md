# Delivery Dynamics - Technical Test

Este repositorio contiene una aplicación full-stack desarrollada como parte de una prueba técnica para Delivery Dynamics. El proyecto está compuesto por un Frontend construido con React y Next.js, y un Backend utilizando Express.js, Prisma, y PostgreSQL.

## ⚙️ Backend

### Lenguaje y Frameworks

- **Express.js**: Framework minimalista para Node.js que facilita la creación de APIs y aplicaciones web.
- **Prisma**: ORM para Node.js que simplifica la manipulación de bases de datos con un modelo estructurado.
- **PostgreSQL**: Base de datos relacional de código abierto, alojada en Neon DB para la gestión en la nube.

### Levantamiento del Backend

1. Acceder a la carpeta backend: `cd delivery-dynamics-backend`

2. Instalar dependencias:
   ```bash
   npm i
   ```
3. Levantar el servidor Express:

   ```bash
   npm run dev
   ```

   El servidor se ejecutará en `http://localhost:3001`.

4. Levantar servicio externo (JSON Server):
   ```bash
   npx json-server ./src/services/db.json --port 3002
   ```
   Esto iniciará un servidor simulado en el puerto `3002` para servicios externos.

### Estructura de Carpetas

- `/src`: Contiene la lógica principal de la aplicación, incluyendo controladores, rutas y servicios.
- `/src/server.ts`: Punto de entrada para el servidor Express y configuración de middlewares.
- `/src/app.ts`: Gestiona rutas y controladores de la aplicación.
- `/api/`: Lógica de controladores y rutas para interactuar con la API.
- `/config`: Archivos de configuración global.
- `/lib`: Funciones utilitarias reutilizables.
- `/schemas`: Esquemas de validación utilizando Zod.
- `/services`: Lógica para interactuar con servicios externos.
- `/prisma`: Modelos y tablas de la base de datos definidos en Prisma.

## 🛠️ Uso de TypeScript y Zod

- **TypeScript**: Utilizado en el frontend y backend para mejorar la seguridad del código mediante el tipado estático.
- **Zod**: Librería para la validación de datos tanto en el frontend como en el backend, asegurando que los datos estén correctamente estructurados antes de ser procesados o almacenados.

## 🔧 Instrucciones de Instalación

### 1. Instalar Dependencias

Ejecuta los siguientes comandos para instalar las dependencias tanto en el Frontend como en el Backend:

```bash
# En el frontend
npm i

# En el backend
npm i
```

### 2. Levantar el Servidor

Para ejecutar la aplicación en desarrollo:

**Frontend**:

```bash
npm run dev
```

El frontend se levantará en `http://localhost:3000`.

**Backend**:

```bash
npm run dev
```

El backend se levantará en `http://localhost:3001`.

### 3. Levantar Servicio Externo

Para levantar el servicio externo simulado en el backend:

```bash
npx json-server ./src/services/db.json --port 3002
```

Esto levantará un servicio en el puerto `3002`.

## 📦 Dependencias

- **express**: Framework minimalista para APIs.
- **prisma**: ORM para interactuar con bases de datos.
- **axios**: Cliente HTTP para interactuar con servicios externos.
- **zod**: Validación de esquemas de datos.

# Contultar todas las rutas

![alt text](all-routes-created.png)

## Consultar Ruta

![alt text](get-route-from-external-server.png)

![alt text](get_route.png)

## Crear Ruta

![alt text](create-route-obtained-from-an-external-service.png)

## Actualizar Ruta

![alt text](updated-route.png)

### Repositorios

Este proyecto está dividido en dos repositorios principales: uno para el **Frontend** y otro para el **Backend**.

- **Frontend**: [delivery-dynamics](https://github.com/Dev-Anyelo/delivery-dynamics)  
  El repositorio contiene la aplicación frontend, desarrollada con **React**, **Next.js** y **TypeScript**. Esta parte se encarga de la interfaz de usuario y la interacción con el backend.

- **Backend**: [delivery-dynamics-backend](https://github.com/Dev-Anyelo/delivery-dynamics-back)  
  El repositorio incluye el backend construido con **Express.js**, **Prisma** y **PostgreSQL**. Gestiona la lógica del servidor, las rutas API y la interacción con la base de datos.
