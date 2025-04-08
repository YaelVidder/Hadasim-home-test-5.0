// routes/suppliers.js
import express from 'express';
import * as supplierController from '../controllers/suppliers.js'; 

const router = express.Router();

router.get('/', supplierController.getAllSuppliers);
router.get('/:supplierId', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.post('/register', supplierController.registerSupplier);
router.post('/login', supplierController.loginSupplier);
router.get('/:supplierId/orders', supplierController.getSupplierOrders);

export default router;