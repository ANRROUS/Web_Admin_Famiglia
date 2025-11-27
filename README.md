# Famiglia Admin Dashboard

Panel de administración moderno y minimalista para la gestión del e-commerce Famiglia. Desarrollado con las últimas tecnologías web para garantizar rendimiento, escalabilidad y una experiencia de usuario premium.

## 🚀 Tecnologías Utilizadas

### Core
- **Next.js 16 (App Router):** Framework de React para producción, utilizando las últimas características como Server Components y Server Actions.
- **React 19:** Biblioteca para construir interfaces de usuario interactivas.
- **TypeScript:** Superset de JavaScript que añade tipado estático para un código más robusto.

### Estilos y Diseño
- **Tailwind CSS:** Framework de utilidades para un diseño rápido y responsive.
- **Lucide React:** Colección de iconos vectoriales ligeros y consistentes.
- **Chart.js & React-Chartjs-2:** Librerías para la visualización de datos y gráficos interactivos.
- **Diseño Minimalista:** Interfaz limpia, moderna y optimizada para modo claro ("Light Mode").

### Backend y Base de Datos
- **Prisma ORM:** ORM moderno para interactuar con la base de datos relacional (PostgreSQL en Supabase).
- **Mongoose:** ODM para modelado de datos en MongoDB (utilizado para logs de auditoría y usuarios anónimos).
- **Supabase (PostgreSQL):** Base de datos principal para usuarios, pedidos y productos.
- **MongoDB:** Base de datos NoSQL para almacenamiento de logs y actividad de usuarios anónimos.
- **JWT (JSON Web Tokens):** Manejo seguro de sesiones y autenticación mediante cookies HTTP-only.

## 📂 Estructura del Proyecto y Páginas

### 1. Autenticación
- **/login:** Página de inicio de sesión con diseño "Glassmorphism", validación de credenciales y manejo de errores.
- **Logout:** Funcionalidad segura que elimina cookies y redirige al login.

### 2. Dashboard Principal (/dashboard)
- **KPIs Generales:** Visualización rápida de métricas clave (Ingresos, Usuarios, Pedidos).
- **Gráficos Interactivos:**
  - Evolución de Ingresos (Últimos 6 meses).
  - Distribución de Estado de Pedidos.
  - Actividad de Usuarios (Registrados vs Anónimos).

### 3. Gestión de Ventas (/dashboard/sales)
- **Métricas de Ventas:** Total de ventas del mes y pedidos completados.
- **Recuperación de Carritos:** Listado de carritos abandonados con detalles de productos y usuarios.
- **Análisis:** Identificación de oportunidades de venta.

### 4. Gestión de Usuarios
- **Usuarios Registrados (/dashboard/users):** Tabla paginada de usuarios con búsqueda y métricas de actividad.
- **Detalle de Usuario (/dashboard/users/[id]):** Perfil completo, historial de pedidos y logs de actividad (Auditoría).
- **Usuarios Anónimos (/dashboard/anonymous):** Seguimiento de visitantes no registrados y sus interacciones.

### 5. Configuración y Sistema (/dashboard/settings)
- **Estado del Sistema:** Verificación de conexión a bases de datos (Prisma/PostgreSQL y MongoDB).
- **Información del Servidor:** Detalles del entorno de ejecución.

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/ANRROUS/Web_Admin_Famiglia.git
    cd Web_Admin_Famiglia
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno (.env):**
    Asegúrate de tener las siguientes variables configuradas:
    ```env
    DATABASE_URL="postgresql://..."
    MONGO_URL="mongodb+srv://..."
    JWT_SECRET="tu_secreto_seguro"
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Construir para producción:**
    ```bash
    npm run build
    npm start
    ```

## 📄 Licencia

Este proyecto es propiedad de Famiglia y su uso está restringido a propósitos administrativos internos.
