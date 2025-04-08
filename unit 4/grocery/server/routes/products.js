import express from 'express';
import * as productController from '../controllers/products.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:supplierId', productController.getProductBySupplierId);
router.post('/', productController.createProduct);

export default router;