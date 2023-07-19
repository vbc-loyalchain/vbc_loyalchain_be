import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    basePath: '/api/',
    openapi: "3.1.0",
    info: {
      title: "Loyalchain API with Swagger",
      version: "0.1.0",
      description:
        "This is the API for Loyal Point Exchange system"
    },
    servers: [
      {
        url: "http://localhost:3333",
        description: "Development server"
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export default {
    swaggerUi_serve: swaggerUi.serve,
    swaggerUi_setup: swaggerUi.setup(specs, {
        explorer: true
    })
}