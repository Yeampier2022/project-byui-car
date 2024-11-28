const swaggerAutoGen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentation',
    description: 'API Documentation for the REST API',
  },
  host: 'localhost:3000',
  schemes: ['https', 'http'],
};
const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutoGen(outputFile, endpointsFiles);