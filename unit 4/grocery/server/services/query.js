import connectToDatabase from '../utils/db.js';
import sql from 'mssql';

const executeQuery = async (query, params = []) => {
    try {
        let pool = await connectToDatabase();
        let request = pool.request();

        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        let result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Query failed! Error:', err);
        throw err;
    }
};

const getQuery = async (table_name, whereClause = '', orderByClause = '', limit = null, offset = null) => {
    let query = `SELECT * FROM ${table_name}`;

    if (whereClause) {
        query += ` WHERE ${whereClause}`;
    }

    if (orderByClause) {
        query += ` ORDER BY ${orderByClause}`;
    }

    if (limit !== null) {
        query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    }

    return executeQuery(query);
};

const insertQuery = async (table_name, columns, values, params = []) => {
    const columnsString = columns.join(', ');
    const valuesPlaceholders = values.map((_, index) => `@value${index}`).join(', ');

    const query = `INSERT INTO [dbo].${table_name} (${columnsString}) VALUES (${valuesPlaceholders})`;

    values.forEach((value, index) => {
        params.push({
            name: `value${index}`,
            type: sql.NVarChar,
            value: value
        });
    });

    return executeQuery(query, params);
};

export {
    executeQuery,
    getQuery,
    insertQuery,
    connectToDatabase 
};