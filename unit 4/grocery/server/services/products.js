// services/products.js
import connectToDatabase from '../utils/db.js';
import sql from 'mssql';

const getAllProducts = async () => {
    console.log('getAllProducts - service');
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Products');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
    }
};

const getProductBySupplierId = async (supplierId) => {
    console.log(`getProductBySupplierId - service for supplier ID: ${supplierId}`);
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('supplierId', sql.Int, supplierId)
            .query('SELECT * FROM Products WHERE supplier_id = @supplierId');
        return result.recordset;
    } catch (err) {
        console.error(`Error fetching products for supplier ${supplierId}:`, err);
        throw err;
    }
}

const createProduct = async (product) => {
    const { product_name, price, minimum_quantity, supplier_id } = product;

    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        request.input('product_name', sql.NVarChar, product_name);
        request.input('price', sql.Decimal, price);
        request.input('minimum_quantity', sql.Int, minimum_quantity);
        request.input('supplier_id', sql.Int, supplier_id);

        const result = await request.query(`
            INSERT INTO Products (product_name, price, minimum_quantity, supplier_id)
            VALUES (@product_name, @price, @minimum_quantity, @supplier_id);
            SELECT SCOPE_IDENTITY() AS id;
        `);

        return result.recordset[0].id;
    } catch (err) {
        console.error('Error creating product:', err);
        throw err;
    }
};


export { getAllProducts, createProduct, getProductBySupplierId };