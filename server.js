const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 5500;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
    res.json({
        apiKey: process.env.AIRTABLE_API_KEY,
        baseId: process.env.AIRTABLE_BASE_ID,
        tableName: process.env.AIRTABLE_TABLE_NAME
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
