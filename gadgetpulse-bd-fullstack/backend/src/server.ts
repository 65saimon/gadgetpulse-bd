import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import apiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger OpenAPI Config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GadgetPulse BD - Mobile & Gadget Retail API',
      version: '1.0.0',
      description: 'Production-ready REST API for GadgetPulse Bangladesh E-Commerce & ERP System',
      contact: {
        name: 'GadgetPulse Tech Team',
        email: 'api@gadgetpulse.bd',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Local Development Server',
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
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'GadgetPulse BD Backend API',
    uptime: process.uptime(),
  });
});

// Mount Master Router
app.use('/api', apiRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GadgetPulse BD API Server running on port ${PORT}`);
  console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

export default app;
