import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getStoreSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const map: { [key: string]: string } = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return res.json({ success: true, settings: map, raw: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body; // object { KEY: value }
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          category: 'GENERAL',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'SETTINGS_UPDATED',
        entity: 'Settings',
        details: 'Store settings updated by admin.',
      },
    });

    return res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
