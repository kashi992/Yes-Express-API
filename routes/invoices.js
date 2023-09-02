  const express = require('express');
  const router = express.Router();
  const connection = require('../db/db'); // Modify the path as needed
  router.post('/addInvoice', (req, res) => {
    try {
      // Check if the request body is an array and contains data
      if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      // Assuming you're processing the first item in the array
      const invoiceData = req.body[0];
      const { invoiceType, data } = invoiceData;
  
      // Check for valid invoiceType
      if (!invoiceType || (invoiceType !== 'AusInvoice' && invoiceType !== 'PakInvoice')) {
        return res.status(400).json({ error: 'Invalid invoice type' });
      }
  
      // Check for valid invoice data
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Invalid invoice data' });
      }
  
      // Function to insert data into the database
      const insertQuery = (tableName, invoiceData) => {
        const query = `INSERT INTO ${tableName} SET ?`;
  
        connection.query(query, invoiceData, (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data into database' });
          } else {
            const invoiceRegistryData = {
              invoice_id: result.insertId,
              table_name: tableName,
            };
  
            const registryQuery = `INSERT INTO invoiceregistry SET ?`;
            connection.query(registryQuery, invoiceRegistryData, (registryErr, result) => {
              if (registryErr) {
                console.error('Error inserting data into invoiceRegistry:', registryErr);
                return res.status(500).json({ error: 'Error inserting data into database' });
              } else {
                const invoiceId = result.insertId;
                return res.status(200).json({ message: 'Invoice data created successfully', status: '200', invoice_id: invoiceId });
              }
            });
          }
        });
      };
  
      // Insert data based on the invoiceType
      if (invoiceType === 'AusInvoice') {
        const {
          sender_name,
          sender_address,
          sender_postcode,
          sender_phone1,
          sender_phone2,
          sender_email,
          receiver_name,
          receiver_address,
          receiver_postcode,
          receiver_district,
          receiver_city,
          receiver_phone1,
          receiver_phone2,
          receiver_email,
          created_at,
        } = data;
  
        const ausInvoiceData = {
          sender_name,
          sender_address,
          sender_postcode,
          sender_phone1,
          sender_phone2,
          sender_email,
          receiver_name,
          receiver_address,
          receiver_postcode,
          receiver_district,
          receiver_city,
          receiver_phone1,
          receiver_phone2,
          receiver_email,
          created_at,
        };
  
        insertQuery('ausInvoice', ausInvoiceData);
      } else if (invoiceType === 'PakInvoice') {
        const {
          sender_name,
          sender_address,
          sender_postcode,
          sender_district,
          sender_city,
          sender_phone1,
          sender_phone2,
          sender_email,
          receiver_name,
          receiver_address,
          receiver_postcode,
          receiver_phone1,
          receiver_phone2,
          receiver_email,
          created_at,
        } = data;
  
        const pakInvoiceData = {
          sender_name,
          sender_address,
          sender_postcode,
          sender_district,
          sender_city,
          sender_phone1,
          sender_phone2,
          sender_email,
          receiver_name,
          receiver_address,
          receiver_postcode,
          receiver_phone1,
          receiver_phone2,
          receiver_email,
          created_at,
        };
  
        insertQuery('pakInvoice', pakInvoiceData);
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.post('/getInvoices', (req, res) => {
    const {
      invoiceId
    } = req.body;
    console.log("invoiceId", invoiceId)
    if (!invoiceId) {
      return res.status(400).json({
        error: 'Missing invoice ID'
      });
    }
  
    // Retrieve invoice data from the database
    const invoiceQuery = `
      SELECT * FROM invoiceregistry
      WHERE id = ?
    `;
  
    connection.query(invoiceQuery, [invoiceId], (err, invoiceResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Database error'
        });
      }
  
      if (invoiceResult.length === 0) {
        return res.status(404).json({
          error: 'Invoice not found'
        });
      }
  
      const invoiceType = invoiceResult[0].table_name;
      const invoiceId = invoiceResult[0].invoice_id;
      console.log("invoiceType", invoiceType)
      console.log("invoiceId", invoiceId)
  
      const invoiceDataQuery = `
        SELECT * FROM ${invoiceType}
        WHERE id = ?
      `;
      connection.query(invoiceDataQuery, [invoiceId], (invoiceErr, invoiceData) => {
        if (invoiceErr) {
          console.error(invoiceErr);
          return res.status(500).json({
            error: 'Database error'
          });
        }
        if (invoiceData.length === 0) {
          return res.status(404).json({
            error: 'Invoice data not found'
          });
        } else {
          //  return res.status(200).json({invoiceData:invoiceData})
          console.log("innerInvoiceId", invoiceId)
          const productDataQuery = `
          SELECT * FROM products
          WHERE invoice_id = ?
        `;
        connection.query(productDataQuery, [invoiceId], (productErr, productData) => {
            if (productErr) {
              console.error(productErr);
              return res.status(500).json({
                error: 'Database error'
              });
            }
            if (productData.length === 0) {
                    return res.status(200).json({invoiceData:invoiceData,productData:[]})

            } else {

              console.log("productData", productData, "invoiceData", invoiceData)
              const productImageQuery = `
              SELECT * FROM productimages
              WHERE product_id = ?
            `;
            connection.query(productImageQuery,[productData.product_id],(productErr,productImagesData)=>{
              if (productErr) {
                  console.error(productErr);
                  return res.status(500).json({
                    error: 'Database error'
                  });
                }
                if (productImagesData.length === 0) {
                  return res.status(200).json({
                    invoice:invoiceData ,product:[productData]
                })

                }else{
                  
                  return res.status(200).json({
                      invoice:invoiceData ,product:[productData,...productImagesData]
                  })
                }
            })
            }
  
  
          })
        }
      })
     
    });
  });
  module.exports = router;
