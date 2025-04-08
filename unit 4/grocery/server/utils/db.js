import sql from 'mssql';
import 'dotenv/config'; 

const config = {
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustedConnection: false,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    }
};

const connectToDatabase = async () => {
    try {
        // Create a connection pool
        let pool = await sql.connect(config);
        console.log('Connected to the database!');
        return pool;
    } catch (err) {
        console.error('Database connection failed! Error:', err);
        throw err;
    }
};

export default connectToDatabase; 