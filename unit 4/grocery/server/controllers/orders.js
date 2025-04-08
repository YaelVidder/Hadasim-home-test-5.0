// controllers/orders.js
import * as ordersService from '../services/orders.js';

const getAllOrders = async (req, res) => {
    try {
        const allOrders = await ordersService.getAllOrders();
        res.status(200).json(allOrders);
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const orderId = await ordersService.createOrder(req.body);
        res.status(201).json({ orderId });
    } catch (err) {
        if (err.message.startsWith('Quantity for product')) {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error creating order in controller:', err);
        res.status(500).json({ error: 'Failed to create order', details: err.message }); 
    }
};


const getOrderDetailsById = async (req, res) => {
    const { orderId } = req.params;
    try {
        console.log(`Fetching details for order ${orderId}...`);
        const orderDetails = await ordersService.getOrderDetails(orderId);
        if (orderDetails?.orderInfo) { 
            res.status(200).json(orderDetails);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Failed to fetch order details', details: err.message });
    }
};

const confirmOrderReceived = async (req, res) => {
    const { orderId } = req.params;
    try {
        console.log(`Confirming order ${orderId} received...`);
        const success = await ordersService.confirmOrderReceived(orderId);
        if (success) {
            res.status(200).json({ message: `Order ${orderId} has been marked as completed.` });
        } else {
            res.status(404).json({ error: `Order ${orderId} not found.` });
        }
    } catch (err) {
        console.error(`Error confirming order ${orderId} received:`, err);
        res.status(500).json({ error: 'Failed to confirm order received', details: err.message });
    }
};

const approveOrder = async (req, res) => {
    console.log('approveOrder - controller');
    const { orderId } = req.params;
    const { supplierId } = req.body;
    try {
        const success = await ordersService.approveOrder(orderId, supplierId);
        if (success) {
            res.status(200).json({ message: `Order ${orderId} has been approved and is now in process.` });
        } else {
            const orderExists = await ordersService.getOrderDetails(orderId);
            if (!orderExists) {
                res.status(404).json({ error: `Order ${orderId} not found.` });
            } else {
                res.status(403).json({ error: `Order ${orderId} cannot be approved by supplier ${supplierId}.` });
            }
        }
    } catch (err) {
        console.error(`Error approving order ${orderId} by supplier ${supplierId}:`, err);
        res.status(500).json({ error: 'Failed to approve order', details: err.message });
    }
};

export { createOrder, getAllOrders, getOrderDetailsById, confirmOrderReceived, approveOrder };