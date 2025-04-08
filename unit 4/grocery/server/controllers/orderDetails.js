// controllers/orderDetails.js
import * as orderDetailService from '../services/orderDetails.js';

const getAllOrderDetails = async (req, res) => {
    try {
        console.log('getAllOrderDetails - controller');
        const orderDetails = await orderDetailService.getAllOrderDetails();
        res.json(orderDetails);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createOrderDetail = async (req, res) => {
    try {
        console.log('createOrderDetail - controller');
        const result = await orderDetailService.createOrderDetail(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export { getAllOrderDetails, createOrderDetail };