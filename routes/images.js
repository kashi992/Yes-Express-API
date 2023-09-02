const express = require('express');
const router = express.Router();
const db = require('../db/db'); 

router.post('/addproductimage', (req, res) => {
  const { productId, imageUrl } = req.body;

  console.log('productId:', productId); // Log the productId

  // Check if product_id exists in the products table
  const checkProductExistsQuery = 'SELECT COUNT(*) AS count FROM products WHERE id = ?';
  console.log('checkProductExistsQuery:', checkProductExistsQuery); // Log the query
  db.query(checkProductExistsQuery, [productId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking product existence:', checkErr);
      return res.status(500).json({ error: 'Error checking product existence' });
    }

    console.log('checkResult:', checkResult); // Log the check result

    const productExists = checkResult[0].count > 0;

    if (!productExists) {
      return res.status(400).json({ error: 'Product ID does not exist in products table' });
    }

    // Proceed to insert the product image
    const insertImageQuery = 'INSERT INTO productimages (product_id, image_url) VALUES (?, ?)';
    db.query(insertImageQuery, [productId, imageUrl], (imageErr, imageResult) => {
      if (imageErr) {
        console.error(imageErr);
        return res.status(500).json({ error: 'Error adding product image' });
      }

      res.status(200).json({ status: "200", message: 'Product image added successfully' });
    });
  });
});


module.exports = router;
