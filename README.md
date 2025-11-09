# PerFinRule: Tu Asistente Financiero Personal

**PerFinRule** es una aplicación web diseñada para ayudarte a tomar el control de tus finanzas personales aplicando la popular regla de presupuesto 50/30/20. La aplicación te permite registrar tus ingresos y gastos, categorizarlos automáticamente con ayuda de inteligencia artificial y visualizar cómo distribuyes tu dinero.

El proyecto está construido con Next.js, React, TypeScript y Tailwind CSS, utilizando Firebase como backend para la autenticación y la base de datos en tiempo real.

## Componentes Generados/Asistidos por IA

Gran parte de la aplicación fue desarrollada con la asistencia de un modelo de IA para acelerar el desarrollo y mejorar la funcionalidad:

-   **Frontend de la Aplicación**: La estructura completa del frontend, incluyendo las páginas principales (Panel, Transacciones, Reportes, Configuración), la navegación, y la integración de componentes de UI de ShadCN, fue generada por IA.

-   **Modelos de Datos y Reglas de Seguridad**: Los esquemas iniciales para las entidades de la base de datos (`User`, `Transaction`, `CategoryRule`, `Configuration`) y las reglas de seguridad de Firestore (`firestore.rules`) fueron diseñados por IA para garantizar una estructura de datos coherente y segura desde el principio.

-   **Función Serverless de Categorización (Genkit Flow)**: El corazón de la funcionalidad inteligente de la app es el flujo `automaticTransactionCategorization`. Se trata de una función serverless implementada con Genkit que, al recibir la descripción y el monto de una transacción, utiliza un modelo de IA para analizarla y proponer automáticamente una categoría (`Necesidades`, `Deseos` o `Ahorros`), junto con una justificación.

## Componentes de Backend y Persistencia de Datos

La aplicación utiliza los servicios de **Firebase** como su principal plataforma de backend:

-   **Firebase Authentication**: Gestiona el registro e inicio de sesión de usuarios, soportando tanto el método de correo/contraseña como la autenticación a través de proveedores como Google.

-   **Firestore**: Se utiliza como la base de datos NoSQL para la persistencia de todos los datos de la aplicación. La información se almacena en tiempo real y se estructura de forma jerárquica para garantizar la seguridad y la propiedad de los datos por parte de cada usuario. Las colecciones principales incluyen:
    -   `/users/{userId}`: Almacena la información del perfil de cada usuario.
    -   `/users/{userId}/transactions`: Contiene todos los ingresos y gastos registrados por el usuario.
    -   `/users/{userId}/configuration`: Guarda las personalizaciones del presupuesto (ej. porcentajes 50/30/20) de cada usuario.

## Flujo de Datos

El flujo de información en PerFinRule está diseñado para ser seguro y eficiente, moviéndose de la siguiente manera:

1.  **Autenticación de Usuario**:
    -   El usuario introduce sus credenciales (o usa un proveedor como Google) en el cliente (frontend).
    -   Firebase Authentication valida las credenciales y, si son correctas, devuelve un token de autenticación al cliente.
    -   El cliente utiliza este token para identificarse en todas las solicitudes posteriores al backend.

2.  **Registro de una Transacción**:
    -   El usuario rellena el formulario "Agregar Transacción" en la interfaz.
    -   **Flujo con IA (Opcional)**: Si el usuario pulsa el botón de categorización por IA, la descripción y el monto se envían al **Genkit Flow** en el backend. El modelo de IA devuelve una categoría sugerida, que se muestra en la interfaz.
    -   Al guardar la transacción, el cliente escribe el nuevo documento directamente en la subcolección `transactions` del usuario actual en Firestore.
    -   Gracias a los listeners en tiempo real (`onSnapshot`), cualquier componente que muestre transacciones (como la lista de transacciones recientes o los reportes) se actualiza automáticamente sin necesidad de recargar la página.

3.  **Visualización de Datos**:
    -   Cuando el usuario navega a una página (ej. Panel o Reportes), el cliente utiliza hooks (`useCollection`) para suscribirse a las colecciones de Firestore correspondientes (`transactions`, `configuration`, etc.).
    -   Firestore envía los datos al cliente en tiempo real. Las reglas de seguridad de Firestore aseguran que un usuario solo pueda solicitar y recibir su propia información.
    -   Los datos se procesan en el cliente para generar las visualizaciones, como las tarjetas de estadísticas, los gráficos y las listas.
