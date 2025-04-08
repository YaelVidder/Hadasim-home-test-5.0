import express from 'express';
import cors from 'cors';
import supplierRoutes from './routes/suppliers.js';
import orderDetailsRoutes from './routes/orderDetails.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';
import dotenv from 'dotenv';

const app = express();
const port = 3000;

const adminPassword = process.env.ADMIN_PASSWORD; 

app.use(cors());

app.use(express.json());

app.use('/suppliers', supplierRoutes);
app.use('/orderDetails', orderDetailsRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);


app.post('/admin/login', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'יש לספק סיסמה.' });
    }

    if (password === adminPassword) {
        console.log('Admin logged in successfully.');
        res.status(200).json({ message: 'התחברת כמנהל בהצלחה!' });
    } else {
        console.log('Admin login failed: Incorrect password.');
        res.status(401).json({ error: 'סיסמה שגויה.' });
    }
});

app.get("/", (req, res) => {
    res.send("hello express");
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});