import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sukut Construction Market Forecasting API',
      version: '1.0.0',
      description: 'API documentation for the Sukut Construction Market Forecasting Platform',
      contact: {
        name: 'Sukut Construction Development Team',
        email: 'dev@sukut.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com/api'
          : `http://localhost:${process.env.PORT || 3001}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { 
              type: 'string',
              enum: ['ADMIN', 'EXECUTIVE', 'VP_DIRECTOR', 'CONTRIBUTOR']
            },
            marketSegments: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['ENVIRONMENTAL', 'ENERGY', 'PUBLIC_WORKS', 'RESIDENTIAL']
              }
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['BACKLOG', 'SWAG'] },
            estimatedValue: { type: 'number' },
            probability: { type: 'integer', minimum: 0, maximum: 100 },
            expectedCloseDate: { type: 'string', format: 'date-time' },
            clientName: { type: 'string' },
            description: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Forecast: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            marketSegment: {
              type: 'string',
              enum: ['ENVIRONMENTAL', 'ENERGY', 'PUBLIC_WORKS', 'RESIDENTIAL']
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
            },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' }
            },
            submittedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sukut Forecasting API Docs',
  }));
};

export default specs;