// services/orders.js
import connectToDatabase from '../utils/db.js';
import sql from 'mssql';

const getAllOrders = async () => {
    console.log('getAllOrders - service');
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query(`
            SELECT
                    o.order_id,
                    o.order_date,
                    o.status,
                    o.Total_Price,
                    od.product_id,
                    p.product_name,
                    p.price,
                    od.quantity
                FROM
                    Orders o
                JOIN
                    OrderDetails od ON o.order_id = od.order_id
                JOIN
                    Products p ON od.product_id = p.product_id
                ORDER BY
                    o.order_id, od.product_id
        `);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching orders:', err);
        throw err;
    }
};

const createOrder = async (orderData) => {
    const { supplier_id, products } = orderData;
    let totalPrice = 0;

    try {
        console.log('createOrder - service');
        const pool = await connectToDatabase();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        const orderResult = await transaction.request()
            .input('supplier_id', sql.Int, supplier_id)
            .query('INSERT INTO Orders (order_date, status, supplier_id) VALUES (GETDATE(), \'חדשה\', @supplier_id); SELECT SCOPE_IDENTITY() AS id;');
        const orderId = orderResult.recordset[0].id;

        for (const product of products) {
            // בדיקת כמות מינימלית לרכישה
            const minQuantityResult = await transaction.request()
                .input('product_id', sql.Int, product.product_id)
                .query('SELECT minimum_quantity FROM Products WHERE product_id = @product_id');

            const minimumQuantity = minQuantityResult.recordset[0]?.minimum_quantity; 

            if (product.quantity < minimumQuantity) {
                throw new Error(`Quantity for product ${product.product_id} is less than the minimum quantity of ${minimumQuantity}`);
            }

            await transaction.request()
                .input('order_id', sql.Int, orderId)
                .input('product_id', sql.Int, product.product_id)
                .input('quantity', sql.Int, product.quantity)
                .query('INSERT INTO OrderDetails (order_id, product_id, quantity) VALUES (@order_id, @product_id, @quantity);');

            // חישוב סכום הזמנה
            const productResult = await transaction.request()
                .input('product_id', sql.Int, product.product_id)
                .query('SELECT price FROM Products WHERE product_id = @product_id');
            totalPrice += (productResult.recordset[0]?.price || 0) * product.quantity; 
        }

        // עדכון מחיר סופי בהזמנה
        await transaction.request()
            .input('order_id', sql.Int, orderId)
            .input('total_price', sql.Decimal, totalPrice)
            .query('UPDATE Orders SET Total_Price = @total_price WHERE order_id = @order_id');

        await transaction.commit();
        return orderId;
    } catch (err) {
        if (err.message.startsWith('Quantity for product')) {
            throw err;
        } else {
            await transaction.rollback();
            throw err;
        }
    }
};

const getOrderDetails = async (orderId) => {
    try {
        const pool = await connectToDatabase();

        // שאילתה לשליפת פרטי הזמנה, שם 
        const orderInfoResult = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT o.order_id, o.order_date, o.status, o.Total_Price, s.representative_name
                FROM Orders o
                JOIN Suppliers s ON o.supplier_id = s.supplier_id
                WHERE o.order_id = @orderId
            `);

        // שאילתה לשליפת פרטי מוצרים בהזמנה
        const orderDetailsResult = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT od.product_id, p.product_name, p.price, od.quantity
                FROM OrderDetails od
                JOIN Products p ON od.product_id = p.product_id
                WHERE od.order_id = @orderId
            `);

        const orderDetails = {
            orderInfo: orderInfoResult.recordset[0],
            products: orderDetailsResult.recordset
        };

        return orderDetails;

    } catch (err) {
        console.error('Error fetching order details:', err);
        throw err;
    }
};

const confirmOrderReceived = async (orderId) => {
    console.log(`confirmOrderReceived - service for order ID: ${orderId}`);
    try {
        const pool = await connectToDatabase();

        // עדכון סטטוס ההזמנה
        const updateResult = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query('UPDATE Orders SET status = \'הושלמה\' WHERE order_id = @orderId');

        if (updateResult.rowsAffected[0] === 0) {
            return false; // ההזמנה לא נמצאה
        }

        console.log(`Order ${orderId} marked as completed.`);
        return true;
    } catch (err) {
        console.error(`Error confirming order ${orderId} received:`, err);
        throw err;
    }
};

const getOrdersBySupplierId = async (supplierId) => {
    console.log(`getOrdersBySupplierId - service for supplier ID: ${supplierId}`);
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('supplierId', sql.Int, supplierId)
            .query(`
                SELECT
                    o.order_id,
                    o.order_date,
                    o.status,
                    o.Total_Price,
                    od.product_id,
                    p.product_name,
                    p.price,
                    od.quantity
                FROM
                    Orders o
                JOIN
                    OrderDetails od ON o.order_id = od.order_id
                JOIN
                    Products p ON od.product_id = p.product_id
                WHERE
                    o.supplier_id = @supplierId
                ORDER BY
                    o.order_id, od.product_id
            `);

        return result.recordset;

    } catch (err) {
        console.error(`Error fetching orders with details for supplier ${supplierId}:`, err);
        throw err;
    }
};

const approveOrder = async (orderId, supplierId) => {
    console.log(`approveOrder - service for order ID: ${orderId} by supplier ID: ${supplierId}`);
    try {
        const pool = await connectToDatabase();

        // בדיקה האם ההזמנה קיימת ושייכת לספק
        const checkOrderResult = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('supplierId', sql.Int, supplierId)
            .query(`
                SELECT order_id
                FROM Orders
                WHERE order_id = @orderId AND supplier_id = @supplierId
            `);

        if (checkOrderResult.recordset.length === 0) {
            return false; // ההזמנה לא נמצאה או לא שייכת לספק
        }

        const updateResult = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                UPDATE Orders
                SET status = 'בתהליך'
                WHERE order_id = @orderId
            `);

        return updateResult.rowsAffected[0] > 0;
    } catch (err) {
        console.error(`Error approving order ${orderId} by supplier ${supplierId}:`, err);
        throw err;
    }
};

export { createOrder, getAllOrders, getOrderDetails, confirmOrderReceived, getOrdersBySupplierId, approveOrder };