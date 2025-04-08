// services/suppliers.js
import connectToDatabase from '../utils/db.js';
import sql from 'mssql';

const getAllSuppliers = async () => {
    console.log('getAllSuppliers - service');
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Suppliers');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        throw err;
    }
};

const getSupplierById = async (supplier_id) => {
    console.log('getSupplierById - service');
    console.log('supplier_id:', supplier_id); 
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(
                `SELECT * 
            FROM Suppliers
            where supplier_id = ${supplier_id}
            `);
        console.log('result:', result);
        return result.recordset[0];
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        throw err;
    }
};

const addSupplier = async (supplier) => { 
    const { company_name, phone_number, representative_name, email } = supplier;
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        request.input('company_name', sql.NVarChar, company_name);
        request.input('phone_number', sql.NVarChar, phone_number);
        request.input('representative_name', sql.NVarChar, representative_name);
        request.input('email', sql.NVarChar, email);

        const result = await request.query(`
            INSERT INTO Suppliers (company_name, phone_number, representative_name, email)
            VALUES (@company_name, @phone_number, @representative_name, @email);
            SELECT SCOPE_IDENTITY() AS id;
        `);

        return result.recordset[0].id;
    } catch (err) {
        console.error('Error creating supplier:', err);
        throw err;
    }
};

const registerNewSupplier = async (supplier) => {
    const { company_name, phone_number, representative_name, email } = supplier;
    try {
        const pool = await connectToDatabase();

        // בדיקה האם קיים כבר ספק עם אותו אימייל או טלפון
        const checkExistingResult = await pool.request()
            .input('phone_number', sql.NVarChar, phone_number)
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT supplier_id
                FROM Suppliers
                WHERE phone_number = @phone_number OR email = @email
            `);

        if (checkExistingResult.recordset.length > 0) {
            throw new Error('Supplier with this email or phone number already exists.');
        }

        // הוספת הספק החדש
        const request = pool.request();
        request.input('company_name', sql.NVarChar, company_name);
        request.input('phone_number', sql.NVarChar, phone_number);
        request.input('representative_name', sql.NVarChar, representative_name);
        request.input('email', sql.NVarChar, email);

        const insertResult = await request.query(`
            INSERT INTO Suppliers (company_name, phone_number, representative_name, email)
            VALUES (@company_name, @phone_number, @representative_name, @email);
            SELECT SCOPE_IDENTITY() AS id;
        `);

        return insertResult.recordset[0].id;

    } catch (err) {
        console.error('Error registering new supplier:', err);
        throw err;
    }
};

const authenticateSupplier = async (identifier) => { 
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('identifier', sql.NVarChar, identifier)
            .query(`
                SELECT supplier_id, company_name, email, phone_number
                FROM Suppliers
                WHERE email = @identifier OR phone_number = @identifier
            `);

        if (result.recordset.length > 0) {
            return result.recordset[0]; 
        } else {
            return null; 
        }
    } catch (err) {
        console.error('Error authenticating supplier:', err);
        throw err;
    }
};

export { getAllSuppliers, addSupplier as createSupplier, registerNewSupplier, authenticateSupplier, getSupplierById };