import express from 'express';
import * as orderDetailController from '../controllers/orderDetails.js';

const router = express.Router();

router.get('/', orderDetailController.getAllOrderDetails);
router.post('/', orderDetailController.createOrderDetail);


export default router;