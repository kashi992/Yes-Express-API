const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Adjust the path accordingly

// Add a product
router.post('/addproduct', (req, res) => {
  const { invoiceId, productName, priceOfGoods, boxWeight, length, width, height, cargoType, additionalCost, comments,COD } = req.body;
console.log("COD",COD)
  if (!invoiceId || !productName || !priceOfGoods || !length || !width || !height || !cargoType || !additionalCost) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cargoTypes = ['Dropoff', 'Collection'];
  if (!cargoTypes.includes(cargoType)) {
    return res.status(400).json({ error: 'Invalid cargo type' });
  }

  // Check if invoice_id exists in invoiceRegistry
  const checkInvoiceExistsQuery = 'SELECT COUNT(*) AS count FROM invoiceRegistry WHERE invoice_id = ?';
  db.query(checkInvoiceExistsQuery, [invoiceId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking invoice existence:', checkErr);
      return res.status(500).json({ error: 'Error checking invoice existence' });
    }

    const invoiceExists = checkResult[0].count > 0;

    if (!invoiceExists) {
      return res.status(400).json({ error: 'Invoice ID does not exist in invoiceRegistry' });
    }

    boxCalculation = (length * width * height) / 5000;
    
    // Calculate price based on cargo type and box weight
    let price;  //  cod=


    if(COD==="1"){
      console.log("boxEnter")
      if(boxCalculation<10){
        boxCalculation=10
      }
      if (cargoType === 'Dropoff') {
        price = 6* boxCalculation;
      } else if (cargoType === 'Collection') {
        price = 7 * boxCalculation + (additionalCost ? additionalCost : 0);
      }
    }else{
      if(boxCalculation<30){
        boxCalculation=30
      }
      if (cargoType === 'Dropoff') {
        price = 900 * boxCalculation;
      } else if (cargoType === 'Collection') {
        price = 1000 * boxCalculation + (additionalCost ? additionalCost : 0);
      }
    }

    // Create the query to insert into the products table
    const insertQuery = `
      INSERT INTO products
        (invoice_id, product_name, price_of_goods, box_weight, length, width, height, cargo_type, additional_cost, comments, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Values for the query
    const values = [
      invoiceId,
      productName,
      priceOfGoods,
      boxWeight,
      length,
      width,
      height,
      cargoType,
      additionalCost,
      comments,
      price
    ];

    // Execute the query
    db.query(insertQuery, values, (err,result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      return res.json({status:"200", message: 'Product added successfully',product_id:result.insertId });
    });
  });
});

module.exports = router;
