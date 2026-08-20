import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken, AuthRequest } from '../middleware/auth';

// ---------------- CUSTOMER AUTH ----------------
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, division, district, upazila, address } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, phone, and password.' });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        fullName,
        email: email.toLowerCase().trim(),
        phone,
        passwordHash: hashedPassword,
        division: division || 'Dhaka',
        district: district || 'Dhaka',
        upazila: upazila || 'Gulshan',
        address: address || '',
      },
    });

    if (address) {
      await prisma.address.create({
        data: {
          customerId: customer.id,
          title: 'Default Address',
          receiverName: customer.fullName,
          phone: customer.phone,
          division: customer.division || 'Dhaka',
          district: customer.district || 'Dhaka',
          upazila: customer.upazila || 'Gulshan',
          areaAddress: customer.address || '',
          isDefault: true,
        },
      });
    }

    const token = generateToken({ id: customer.id, email: customer.email, role: 'CUSTOMER', type: 'CUSTOMER' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to GadgetPulse BD.',
      token,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        division: customer.division,
        district: customer.district,
        upazila: customer.upazila,
        address: customer.address,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { addresses: true },
    });

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: customer.id, email: customer.email, role: 'CUSTOMER', type: 'CUSTOMER' });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        division: customer.division,
        district: customer.district,
        upazila: customer.upazila,
        address: customer.address,
        addresses: customer.addresses,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user!.id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true, invoice: true },
        },
        wishlists: {
          include: { product: { include: { variants: true } } },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const totalOrders = await prisma.order.count({ where: { customerId: customer.id } });
    const pendingOrders = await prisma.order.count({
      where: { customerId: customer.id, orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'] } },
    });
    const completedOrders = await prisma.order.count({
      where: { customerId: customer.id, orderStatus: 'DELIVERED' },
    });
    const totalSpentResult = await prisma.order.aggregate({
      where: { customerId: customer.id, paymentStatus: 'PAID' },
      _sum: { grandTotal: true },
    });

    const { passwordHash, ...safeCustomer } = customer;

    return res.json({
      success: true,
      customer: {
        ...safeCustomer,
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent: totalSpentResult._sum.grandTotal || 0,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, division, district, upazila, address } = req.body;
    const updated = await prisma.customer.update({
      where: { id: req.user!.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(division && { division }),
        ...(district && { district }),
        ...(upazila && { upazila }),
        ...(address && { address }),
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      customer: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        division: updated.division,
        district: updated.district,
        upazila: updated.upazila,
        address: updated.address,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- ADMIN AUTH ----------------
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { username: email.trim() }],
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials or account inactive.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Log admin activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        action: 'LOGIN',
        entity: 'Auth',
        details: `Admin ${user.fullName} logged into dashboard with role ${user.role}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      type: 'ADMIN',
    });

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Admin login failed.' });
  }
};

export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
