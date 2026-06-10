# Guía de Integración de Auth0 (Backend)

Este documento detalla la estructura implementada para integrar **Auth0** en el backend del proyecto **Sistema Vehicular**, justificando las decisiones de diseño ("el porqué") y detallando los pasos para su uso y prueba ("el cómo").

---

## 🧐 ¿Por qué esta arquitectura? (El Porqué)

### 1. Autenticación delegada (Auth0) + Autorización local (Base de Datos)
* **El Porqué**: Auth0 es un proveedor de identidad (IdP) especializado en la seguridad y gestión de credenciales. Delegar la autenticación a Auth0 elimina la necesidad de almacenar contraseñas en nuestra base de datos (por eso hicimos opcional el campo `password` en Prisma), lo que reduce drásticamente el riesgo de seguridad y nos da acceso inmediato a características premium como:
  * Registro y login seguro con validación de complejidad de contraseña.
  * Autenticación de doble factor (MFA).
  * Login social (Google, Apple, Microsoft, etc.).
  * Flujos automáticos de restablecimiento de contraseña.
* Sin embargo, la **autorización** (los roles `ADMIN` y `TECNICO`, y el estado de la cuenta `activo`) se mantiene en nuestra base de datos PostgreSQL local. Esto asegura que:
  * La base de datos siga siendo la fuente de verdad de las relaciones de negocio (como qué técnico ejecutó una orden de servicio).
  * Un administrador local pueda desactivar a un usuario o cambiarle el rol al instante desde la base de datos sin necesidad de acceder a la consola web de Auth0.

### 2. Validación de Tokens mediante JWKS (JSON Web Key Sets)
* **El Porqué**: En lugar de que el backend consulte a la API de Auth0 en cada petición HTTP (lo que introduciría una latencia alta y saturaría los límites de consumo), utilizamos validación asimétrica local.
* El middleware `express-oauth2-jwt-bearer` descarga las claves públicas de Auth0 una sola vez (y las almacena en memoria de forma segura) desde la URL de JWKS (`https://tu-dominio.auth0.com/.well-known/jwks.json`). Cuando llega un request, el backend valida la firma criptográfica del JWT de manera local y ultra rápida utilizando esa clave pública.

### 3. Autenticación Sin Estado (Stateless)
* **El Porqué**: La API no guarda sesiones ni cookies de sesión. Cada petición HTTP contiene la cabecera `Authorization: Bearer <JWT>`. Esto permite que la API escale horizontalmente sin problemas en entornos Docker de producción o clústeres.

---

## 🛠️ ¿Cómo funciona la estructura? (El Cómo)

La integración está compuesta por tres capas principales:

### A. Dependencias y Variables de Entorno
* Se agregó la librería oficial `express-oauth2-jwt-bearer` a `package.json`.
* En `.env` y `.env.example` se definieron:
  * `AUTH0_AUDIENCE`: El identificador de tu API en Auth0 (ej: `https://api.sistema-vehicular.com`).
  * `AUTH0_ISSUER_BASE_URL`: El dominio de tu tenant de Auth0 (ej: `https://dev-xxxx.us.auth0.com/`).

### B. Middleware de Seguridad (`src/middlewares/auth.middleware.js`)
El middleware ejecuta tres pasos en secuencia ordenada:
1. **`checkJwt`**: Verifica que el token JWT sea válido, no haya expirado y esté firmado por el emisor correcto para la audiencia adecuada.
2. **`injectUser`**:
   * Extrae el correo electrónico desde el token de acceso (usando un Custom Claim).
   * Busca al usuario correspondiente en la base de datos local de PostgreSQL.
   * Si no se encuentra (el administrador no lo ha creado) o está inactivo (`activo: false`), responde con un `403 Forbidden` bloqueando el acceso inmediatamente.
   * Si es correcto, inyecta los datos de la base de datos en `req.user`.
3. **`requireRol(roles)`**: Evalúa si el rol (`ADMIN` o `TECNICO`) de `req.user` tiene permiso para el endpoint específico.

### C. Protección de Rutas
* **Rutas Generales**: Se protegieron todas las rutas de clientes, vehículos, órdenes y novedades agregando `router.use(checkJwt, injectUser)` al inicio de sus respectivos archivos de rutas.
* **Rutas Administrativas**: El registro de nuevos usuarios en `/usuarios` está restringido usando `requireRol(['ADMIN'])`:
  ```javascript
  router.post("/usuarios", checkJwt, injectUser, requireRol(["ADMIN"]), validarCrearUsuario, crearUsuario);
  ```

---

## ⚙️ Configuración Obligatoria en el Dashboard de Auth0

Para que este flujo funcione a la perfección con la aplicación, debes configurar los siguientes elementos en la consola web de Auth0:

### 1. Registrar la API en Auth0
1. Ve al Dashboard de Auth0 ➔ **Applications** ➔ **APIs**.
2. Haz clic en **Create API**.
3. Rellena los datos:
   * **Name**: API Sistema Vehicular (o el nombre que gustes).
   * **Identifier**: `https://api.sistema-vehicular.com` (debe coincidir exactamente con el valor de `AUTH0_AUDIENCE` en tu archivo `.env`).
   * **Signing Algorithm**: `RS256` (obligatorio).
4. Haz clic en **Create**.

### 2. Crear una Acción de Login para Inyectar el Email (Custom Claim)
Por defecto, Auth0 emite tokens de acceso ligeros que no contienen el email del usuario. Necesitamos inyectarlo como un *Custom Claim* para que nuestro backend pueda identificar al usuario en la base de datos local.

1. Ve a **Actions** ➔ **Flows** ➔ **Login**.
2. Haz clic en **Add Action** ➔ **Build from scratch**.
3. Nómbrala `Agregar Claims de Email`.
4. Reemplaza el editor con el siguiente código:
   ```javascript
   exports.onExecutePostLogin = async (event, api) => {
     const namespace = 'https://sistema-vehicular.com';
     if (event.user.email) {
       // Inyectamos el email en el Access Token
       api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
     }
   };
   ```
5. Haz clic en **Deploy** (arriba a la derecha).
6. Regresa al flujo visual de **Login**, arrastra tu nueva acción desde el panel derecho e insértala entre *Start* y *Complete*.
7. Haz clic en **Apply** para guardar el flujo de ejecución.

---

## 🧪 ¿Cómo probar la API localmente?

Dado que ahora todos tus endpoints de negocio están protegidos, si intentas hacer peticiones directas recibirás un `401 Unauthorized`. A continuación, se detalla cómo probar la API usando herramientas como **Postman**:

### Paso 1: Obtener un Token de Prueba en Auth0
1. En tu API registrada en Auth0, ve a la pestaña **Test**.
2. Copia el comando `curl` que te proporciona Auth0 para solicitar un token de acceso de prueba o utiliza la sección interactiva para generarlo.
3. El comando lucirá similar a este:
   ```bash
   curl --request POST \
     --url https://tu-dominio.us.auth0.com/oauth/token \
     --header 'content-type: application/json' \
     --data '{"client_id":"TU_CLIENT_ID_TEST","client_secret":"TU_CLIENT_SECRET_TEST","audience":"https://api.sistema-vehicular.com","grant_type":"client_credentials"}'
   ```
4. Recibirás un JSON con un `access_token` largo. Cópialo.

### Paso 2: Crear el usuario en la Base de Datos Local
Para que la API te permita acceder, tu correo de prueba de Auth0 debe estar registrado en la base de datos.
Si no tienes interfaz administrativa aún, puedes crear un usuario de pruebas en PostgreSQL ejecutando una query SQL o mediante un seed de Prisma, por ejemplo:
```sql
INSERT INTO "Usuario" (nombre, email, rol, activo)
VALUES ('Usuario Prueba', 'correo_del_token@ejemplo.com', 'ADMIN', true);
```
*(Nota: El campo password es opcional, por lo que puedes omitirlo en la inserción).*

### Paso 3: Consumir la API protegida
En Postman:
1. Crea una petición `GET` a `http://localhost:3000/api/vehiculos`.
2. Ve a la pestaña **Authorization**.
3. Selecciona **Type**: `Bearer Token`.
4. Pega el `access_token` que obtuviste en el Paso 1.
5. Presiona **Send**. ¡Deberías recibir la respuesta con éxito!
