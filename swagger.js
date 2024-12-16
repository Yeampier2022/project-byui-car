const swaggerAutoGen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentation',
    description: 'API Documentation for the REST API',
  },
  host: 'project-byui-cars.onrender.com',
  schemes: ['https'],
};
const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutoGen(outputFile, endpointsFiles);