# Backend REST - TicoAutos

Este proyecto corresponde al backend principal de **TicoAutos**, una plataforma web para la publicación y consulta de vehículos en Costa Rica.  
El sistema gestiona autenticación de usuarios, validación de identidad contra el padrón electoral, verificación en dos pasos vía SMS, gestión de vehículos y un módulo de preguntas y respuestas entre usuarios interesados y propietarios.

---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Multer
- Twilio
- OpenRouter
- SendGrid
- dotenv
- cors
- body-parser

---

## Funcionalidades principales

### Autenticación
- Inicio de sesión con generación de token JWT
- Verificación en dos pasos (2FA) mediante código SMS con Twilio
- Validación de rutas protegidas mediante token
- Login social con Google OAuth

### Usuarios
- Registro de usuarios con validación de cédula contra el padrón electoral del TSE
- Autocompletado de nombre y apellidos desde el padrón
- Validación de mayoría de edad (solo mayores de 18 pueden registrarse)
- Número de teléfono requerido para el 2FA
- Activación de cuenta por correo electrónico
- Consulta de datos del usuario autenticado

### Padrón Electoral
- Integración con API PHP que consulta el padrón electoral del TSE (MongoDB local)
- Endpoint de consulta de cédula para autocompletado en el formulario de registro
- Si la cédula no existe en el padrón, el registro es rechazado

### Verificación en dos pasos (2FA)
- Al iniciar sesión con email y contraseña, el sistema genera un código de 6 dígitos
- El código se envía al número de teléfono registrado vía SMS usando Twilio
- El código se invalida después de un solo uso
- Aplica únicamente para usuarios que inician sesión con correo y contraseña

### Vehículos
- Publicar vehículos
- Consultar todos los vehículos
- Consultar vehículo por id
- Filtrar vehículos
- Editar vehículo
- Eliminar vehículo
- Marcar vehículo como vendido
- Subida de imágenes con Multer

### Preguntas y respuestas
- Un usuario autenticado puede hacer preguntas sobre un vehículo
- El propietario del vehículo puede responder preguntas
- El sistema registra:
  - Usuario que pregunta
  - Usuario que responde
  - Fecha de pregunta
  - Fecha de respuesta
- Las conversaciones son privadas:
  - El propietario ve todas las conversaciones de su vehículo
  - El usuario interesado solo ve sus propias preguntas y respuestas
- Un usuario no puede volver a preguntar por el mismo vehículo hasta que su pregunta anterior haya sido respondida

---

## Instalación

1. Clonar el repositorio
2. Abrir la carpeta del proyecto en la terminal
3. Instalar dependencias:
```bash
npm install
```
4. Asegurarse de que el **API del Padrón PHP** esté corriendo en XAMPP (ver sección de dependencias externas)

---

## Variables de entorno

Crear un archivo `.env` con los siguientes valores:

```
PORT=3000
DATABASE_URL=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta_jwt
SENDGRID_API_KEY=tu_api_key_sendgrid
PADRON_API_URL=http://localhost:8080/padron-api/index.php
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=tu_numero_twilio
OPENROUTER_API_KEY=tu_api_key_openrouter
```

---

## Ejecución del proyecto

Para iniciar el servidor:
```bash
npm start
```

---

## Rutas principales

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/token | Inicio de sesión, envía código 2FA por SMS |
| POST | /auth/verify-2fa | Verificación del código 2FA, retorna JWT |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/user | Registro de usuario |
| GET | /api/auth/user | Datos del usuario autenticado |
| GET | /api/cedula/:cedula | Consulta cédula en el padrón (autocompletado) |
| GET | /api/activate/:token | Activación de cuenta por email |
| POST | /api/resend-activation | Reenvío de correo de activación |

### Vehículos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/vehicle | Publicar vehículo |
| GET | /api/vehicle | Consultar todos los vehículos |
| PUT | /api/vehicle | Editar vehículo |
| DELETE | /api/vehicle | Eliminar vehículo |

### Preguntas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/question | Crear pregunta |
| GET | /api/question | Consultar preguntas |

### Respuestas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/answer | Crear respuesta |
| GET | /api/answer | Consultar respuestas |

---

## Subida de imágenes

Las imágenes de vehículos se almacenan en:
```
/uploads/images/
```

Y se exponen de forma pública mediante:
```
/uploads
```

Por eso las imágenes pueden ser accedidas desde una URL como:
```
http://localhost:3000/uploads/images/nombre-imagen.jpg
```

---

## Dependencias externas

### API Padrón Electoral (PHP)
El sistema depende de un servicio externo PHP que consulta el padrón electoral del TSE almacenado en una instancia local de MongoDB.

- Repositorio base: [guntanis/padron](https://github.com/guntanis/padron)
- Requiere: XAMPP (Apache + PHP), MongoDB local
- Los datos del padrón se importan desde el archivo del TSE con `mongoimport`
- El servicio debe estar corriendo en `http://localhost:8080/padron-api/`

### Twilio
Servicio de mensajería SMS utilizado para el envío del código de verificación 2FA.

- Cuenta de prueba: solo funciona con números verificados en la consola de Twilio
- Cuenta de producción: permite enviar SMS a cualquier número
  
### OpenRouter
Servicio de IA utilizado para validar que los mensajes del chat no contengan información de contacto personal (teléfonos, correos, redes sociales, etc.).

- Proveedor: openrouter.ai
- Modelo utilizado: openai/gpt-3.5-turbo
- Requiere: una API key válida de OpenRouter configurada en el .env como OPENROUTER_API_KEY
Documentación: https://openrouter.ai/docs
---

## Reglas del sistema de preguntas y respuestas

- Solo usuarios autenticados pueden preguntar
- Solo el propietario del vehículo puede responder
- No se permite modificar preguntas una vez enviadas
- Un usuario solo puede tener una pregunta pendiente por vehículo
- El usuario interesado solo ve sus propias conversaciones
- El propietario del vehículo ve todas las conversaciones relacionadas con su publicación

---

## Autor

Proyecto desarrollado como parte del curso de Web II.

- Dylan Jiménez Alfaro
- Emily Zúñiga Solano
