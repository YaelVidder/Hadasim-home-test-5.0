import express from 'express';
import * as ordersController from '../controllers/orders.js';

const router = express.Router();

router.get('/', ordersController.getAllOrders);
router.post('/', ordersController.createOrder);
router.get('/:orderId', ordersController.getOrderDetailsById);
router.put('/:orderId/complete', ordersController.confirmOrderReceived);
router.put('/:orderId/approve', ordersController.approveOrder);

export default router;