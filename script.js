const mysql = require('mysql2');
import routes from './routes/auth';
import middleware from './middleware/auth';

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sarang',        // your MySQL username
    password: 'sarang',        // your MySQL password
    database: 'neelam'  // your database name
});

// SQL query to create products table
const createProductTable = `
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(150),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

// Connect and run query
connection.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL:", err);
        return;
    }
    console.log("✅ Connected to MySQL");

    connection.query(createProductTable, (err) => {
        if (err) {
            console.error("❌ Error creating table:", err);
        } else {
            console.log("✅ 'products' table created successfully!");
        }

        connection.end(); // Close connection
    });
});
app.use('/api/auth', routes);


app.use(middleware);

// Start server

app.listen(5000, () => {
  console.log("Server running on port 5000");
});


