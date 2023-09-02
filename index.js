// index.js
const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const invoicesRouter = require('./routes/invoices');
const productsRouter = require('./routes/products');
const imagesRouter = require('./routes/images');
const pdfRouter = require('./routes/pdf');
const allInvoice =require('./routes/allInvoices')
const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/users', usersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/products', productsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/pdf', pdfRouter);
//app.use('/api/getInvoices', allInvoice);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
