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

![all-routes-created](https://github.com/user-attachments/assets/ab5e4c66-3e3f-4f5c-acc4-410c7c9c0ae0)

## Consultar Ruta

![get_route](https://github.com/user-attachments/assets/ae1a4823-c01b-46b3-b2d2-a2b7b6bdbffa)

![get-route-from-external-server](https://github.com/user-attachments/assets/0c6458e4-4cf8-485c-9132-9e8987c4a737)

## Crear Ruta

![create-route-obtained-from-an-external-service](https://github.com/user-attachments/assets/6299bbc9-159b-4a52-a7a6-6500fbc3acf3)

## Actualizar Ruta

![updated-route](https://github.com/user-attachments/assets/5b82fb0c-a91b-46b4-970b-9b3a19274173)

### Repositorios

Este proyecto está dividido en dos repositorios principales: uno para el **Frontend** y otro para el **Backend**.

- **Frontend**: [delivery-dynamics](https://github.com/Dev-Anyelo/delivery-dynamics)  
  El repositorio contiene la aplicación frontend, desarrollada con **React**, **Next.js** y **TypeScript**. Esta parte se encarga de la interfaz de usuario y la interacción con el backend.

- **Backend**: [delivery-dynamics-backend](https://github.com/Dev-Anyelo/delivery-dynamics-back)  
  El repositorio incluye el backend construido con **Express.js**, **Prisma** y **PostgreSQL**. Gestiona la lógica del servidor, las rutas API y la interacción con la base de datos.
