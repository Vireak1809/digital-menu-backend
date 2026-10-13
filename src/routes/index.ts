import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import adminRoutes from './admin.routes';
import orderRoutes from './order.routes';
import chefRoutes from './chef.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'OK', errors: null }));

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);
router.use('/chef', chefRoutes);

export default router;