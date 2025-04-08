// controllers/products.js
import * as productService from '../services/products.js';

const getAllProducts = async (req, res) => {
    try {
        console.log('getAllProducts - controller');
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const createProduct = async (req, res) => {
    try {
        console.log('createProduct - controller');
        const result = await productService.createProduct(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getProductBySupplierId = async (req, res) => {
    const supplierId = req.params.supplierId;
    console.log('supplierId:', supplierId);
    try {
        console.log('getProductBySupplierId - controller');
        const products = await productService.getProductBySupplierId(supplierId);
        if (products) {
            res.json(products);
        } else {
            res.status(404).send('Products not found');
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send(err.message);
    }
}


export { getAllProducts, createProduct, getProductBySupplierId };