// services/orderDetails.js
import connectToDatabase from '../utils/db.js';
import sql from 'mssql';

const getAllOrderDetails = async () => {
    console.log('getAllOrderDetails - service');
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM OrderDetails');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching order details:', err);
        throw err;
    }
};

const createOrderDetail = async (orderDetail) => {
    console.log('createOrderDetail - service');
    const { order_id, product_id, quantity } = orderDetail;

    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        request.input('order_id', sql.Int, order_id);
        request.input('product_id', sql.Int, product_id);
        request.input('quantity', sql.Int, quantity);

        const result = await request.query(`
            INSERT INTO OrderDetails (order_id, product_id, quantity)
            VALUES (@order_id, @product_id, @quantity);
            SELECT SCOPE_IDENTITY() AS id;
        `);

        return result.recordset[0].id;
    } catch (err) {
        console.error('Error creating order detail:', err);
        throw err;
    }
};


export { getAllOrderDetails, createOrderDetail };