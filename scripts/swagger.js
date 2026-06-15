import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API Sistema Vehicular',
    description: 'Documentación interactiva de los servicios del backend para el Sistema Vehicular.',
    version: '1.0.0',
  },
  host: 'proyecto-sistema-vehicular.onrender.com',
  schemes: ['https', 'http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Introduce tu token JWT aquí para acceder a rutas protegidas. El prefijo "Bearer " se agregará automáticamente.',
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = '../src/swagger-output.json';
// Pasamos el punto de entrada principal donde express() y las rutas están inicializadas.
// Al usar type module y rutas relativas al script, tenemos que asegurarnos de apuntar a src/app.js
const routes = ['../src/app.js'];

// Ejecutamos swagger-autogen indicando los archivos.
const autogen = swaggerAutogen();

autogen(outputFile, routes, doc).then(() => {
  console.log('Documentación Swagger generada exitosamente en src/swagger-output.json');
});
