// controller/suppliers.js
import * as supplierService from '../services/suppliers.js';
import * as ordersService from '../services/orders.js';

export const getAllSuppliers = async (req, res) => {
    try {
        console.log('getAllSuppliers - controller');
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const getSupplierById = async (req, res) => {
    const supplierId = req.params.supplierId;
    console.log('supplierId:', supplierId); 
    try {
        console.log('getSupplierById - controller');
        const supplier = await supplierService.getSupplierById(supplierId);
        if (supplier) {
            res.json(supplier);
        } else {
            res.status(404).send('Supplier not found');
        }
    } catch (err) {
        console.error('Error fetching supplier:', err);
        res.status(500).send(err.message);
    }
}

export const createSupplier = async (req, res) => {
    try {
        const result = await supplierService.createSupplier(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const registerSupplier = async (req, res) => {
    try {
        const supplierData = req.body;
        const newSupplierId = await supplierService.registerNewSupplier(supplierData);
        res.status(201).json({ message: 'Supplier registered successfully', supplierId: newSupplierId });
    } catch (err) {
        if (err.message.includes('already exists')) {
            res.status(400).json({ error: err.message });
        } else {
            console.error('Error registering supplier:', err);
            res.status(500).send(err.message);
        }
    }
};

export const loginSupplier = async (req, res) => {
    const { identifier } = req.body;
    try {
        const supplier = await supplierService.authenticateSupplier(identifier);
        if (supplier) {
            res.status(200).json({ message: 'Login successful', supplierId: supplier.supplier_id, companyName: supplier.company_name });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send(err.message);
    }
};

export const getSupplierOrders = async (req, res) => {
    console.log('getSupplierOrders - controller');
    const supplierId = req.params.supplierId;
    try {
        const orders = await ordersService.getOrdersBySupplierId(supplierId);
        res.status(200).json(orders);
    } catch (err) {
        console.error(`Error fetching orders for supplier ${supplierId}:`, err);
        res.status(500).send(err.message);
    }
};

export const approveOrder = async (req, res) => {
    const { orderId, supplierId } = req.params;
    try {
        const result = await ordersService.approveOrder(orderId, supplierId);
        res.status(200).json(result);
    } catch (err) {
        console.error(`Error approving order ${orderId} for supplier ${supplierId}:`, err);
        res.status(500).send(err.message);
    }
};