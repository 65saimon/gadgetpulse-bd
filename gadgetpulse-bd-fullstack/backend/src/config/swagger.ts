import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bakalia BulletGym REST API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for Bakalia BulletGym management system. Supports role-based access, attendance tracking, payments, trainers, analytics, and member management.',
      contact: {
        name: 'Bakalia BulletGym Tech Team',
        email: 'dev@bakaliabulletgym.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}/api`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT authorization token generated via /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'MEMBER'] },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
        Member: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            memberId: { type: 'string', example: 'BBG-2026-001' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            gender: { type: 'string' },
            bloodGroup: { type: 'string' },
            emergencyContact: { type: 'string' },
            membershipPlanId: { type: 'string' },
            joinDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'INACTIVE'] },
            photo: { type: 'string' },
            qrCode: { type: 'string' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            invoice: { type: 'string', example: 'INV-2026-0001' },
            memberId: { type: 'string' },
            amount: { type: 'number' },
            discount: { type: 'number' },
            fine: { type: 'number' },
            totalPaid: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'BKASH', 'NAGAD', 'BANK'] },
            status: { type: 'string', enum: ['PAID', 'PENDING', 'PARTIAL'] },
            paidDate: { type: 'string', format: 'date-time' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            memberId: { type: 'string' },
            checkIn: { type: 'string', format: 'date-time' },
            checkOut: { type: 'string', format: 'date-time' },
            duration: { type: 'integer' },
            method: { type: 'string', enum: ['QR_SCAN', 'FACE_RECOGNITION', 'MANUAL'] },
            cameraImage: { type: 'string' },
            device: { type: 'string' },
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
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
