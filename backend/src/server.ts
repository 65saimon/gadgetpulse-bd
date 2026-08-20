import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import apiRouter from './routes';
import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Robust CORS for all domains & Vercel deployments
app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin, Vercel preview/production domains, localhost, or non-browser tools
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.options('*', cors());

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
        url: `/api`,
        description: 'Production / Current Server',
      },
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

// Root friendly greeting
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'GadgetPulse BD API Server is online!',
    docs: '/api/docs',
    health: '/api/health',
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

// Auto-seed basic settings & admin if empty on startup
async function ensureInitialData() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 Empty database detected on startup. Initializing default admin & store settings...');
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      const hashedStaffPassword = await bcrypt.hash('staff123', 10);

      await prisma.user.createMany({
        data: [
          {
            email: 'admin@gadgetpulse.bd',
            username: 'superadmin',
            passwordHash: hashedAdminPassword,
            fullName: 'Tahmidur Rahman (Super Admin)',
            phone: '+8801819285538',
            role: 'SUPER_ADMIN',
          },
          {
            email: 'sales@gadgetpulse.bd',
            username: 'salesmanager',
            passwordHash: hashedStaffPassword,
            fullName: 'Nusrat Jahan (Sales Lead)',
            phone: '+8801712345678',
            role: 'SALES_MANAGER',
          },
          {
            email: 'inventory@gadgetpulse.bd',
            username: 'inventorylead',
            passwordHash: hashedStaffPassword,
            fullName: 'Shakil Ahmed (Inventory Lead)',
            phone: '+8801912345678',
            role: 'INVENTORY_MANAGER',
          },
        ],
      });

      await prisma.storeSetting.createMany({
        data: [
          { key: 'STORE_NAME', value: 'GadgetPulse Bangladesh' },
          { key: 'STORE_PHONE', value: '+880 1819-285538' },
          { key: 'STORE_EMAIL', value: 'support@gadgetpulse.bd' },
          { key: 'BKASH_MERCHANT_NUMBER', value: '01819285538' },
          { key: 'NAGAD_MERCHANT_NUMBER', value: '01712345678' },
          { key: 'SHIPPING_FEE_INSIDE_DHAKA', value: '70' },
          { key: 'SHIPPING_FEE_OUTSIDE_DHAKA', value: '130' },
          { key: 'VAT_PERCENTAGE', value: '5' },
        ],
      });
      console.log('✅ Default admin and store settings created successfully.');
    }
  } catch (e) {
    console.error('Error during initial data verification:', e);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 GadgetPulse BD API Server running on port ${PORT}`);
  console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  await ensureInitialData();
});

export default app;
