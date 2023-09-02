
// const express = require('express');
// const router = express.Router();
// const db = require('../db/db'); // Adjust the path accordingly
// const PDFDocument = require('pdfkit'); // Import pdfkit

// // Generate PDF
// router.post('/generatepdf', (req, res) => {
//   const { invoiceId } = req.body;

//   if (!invoiceId) {
//     return res.status(400).json({ error: 'Missing invoice ID' });
//   }

//   // Query to retrieve invoice and product data
//   const query = `
//     SELECT IR.*, PD.*
//     FROM invoiceregistry IR
//     LEFT JOIN products PD ON IR.invoice_id = PD.invoice_id
//     WHERE IR.id = ?
//   `;

//   db.query(query, [invoiceId], (err, result) => {
//     console.log("result",result)
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Database error' });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ error: 'Invoice or product data not found' });
//     }

//     const invoiceData = result[0];
//     productData=result


//     // TODO: Create PDF using invoiceData and productData
//     const doc = new PDFDocument();
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');
//     // Respond with PDF or appropriate message
//     doc.pipe(res);
//     // doc.image("../images/Yes_logo.png", {
//     //   width: 100,
//     //   height: 100,
//     //   align: 'left',
//     // });
//     doc.font('Helvetica-Bold');
//     doc
//     .fontSize(16)
//     .text('INTERNATIONAL COURIER & CARGO SERVICES', 160, 60)
//     doc.font('Helvetica');
//   doc
//     .fontSize(12)
//     .text('Address: 8 Amarina Close,\nMeadow Heights, VIC 3048', 160, 100);

//   doc
//     .fontSize(12)
//     .text('Tel: 0476 909 090\nEmail: yesexpress.mel@gmail.com', 160, 140);
//     doc.font('Helvetica-Bold');
//     doc.fontSize(14);
//     doc.text('FREIGHT BOOKING FORM', 160, 180); // Adjust the coordinates as needed


//     doc.font('Helvetica-Bold');
//     // doc.fontSize(16);
//     // doc.text('FREIGHT BOOKING FORM', 100, 200);

//     // Draw sender information box
//     doc.rect(100, 230, 250, 150).stroke(); // Draw a rectangle for sender info
//     doc.fontSize(12);
//     doc.text('SENDER INFORMATION', 110, 240);

//     // Use Helvetica-Bold for headings and Helvetica for values
//     doc.font('Helvetica-Bold');
//     doc.text('Name:', 110, 260);
//     doc.text('Address:', 110, 280);
//     doc.text('Postcode:', 110, 300);
//     doc.text('Phone:', 110, 320);
//     doc.text('Email:', 110, 340);

//     doc.font('Helvetica');
//     // doc.text(`${invoiceData.sender_name}`, 180, 260);
//     // doc.text(`${invoiceData.sender_address}`, 180, 280);
//     // doc.text(`${invoiceData.postcode}`, 180, 300);
//     // doc.text(`${invoiceData.sender_phone}`, 180, 320);
//     // doc.text(`${invoiceData.sender_email}`, 180, 340);

//     // Draw receiver information box
//     doc.rect(400, 230, 250, 150).stroke(); // Draw a rectangle for receiver info
//     doc.fontSize(12);
//     doc.text('RECEIVER INFORMATION', 410, 240);

//     // Use Helvetica-Bold for headings and Helvetica for values
//     doc.font('Helvetica-Bold');
//     doc.text('Name:', 410, 260);
//     doc.text('Address:', 410, 280);
//     doc.text('Postcode:', 410, 300);
//     doc.text('District:', 410, 320);
//     doc.text('State:', 410, 340);

//     doc.font('Helvetica');
//     // doc.text(`${invoiceData.receiver_name}`, 480, 260);
//     // doc.text(`${invoiceData.receiver_address}`, 480, 280);
//     // doc.text(`${invoiceData.postcode}`, 480, 300);
//     // doc.text(`${invoiceData.district}`, 480, 320);
//     // doc.text(`${invoiceData.state}`, 480, 340);
//   // Finalize the PDF and end the response
//   doc.end();

//     //return res.status(200).json({ invoiceData, productData });
//     console.log("productData",productData,"invoiceData",invoiceData)
//   });
// });

// module.exports = router;
// routes/pdf.js
const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Adjust the path accordingly
const fs = require('fs');
const path = require('path');



// Generate PDF
router.post('/allInvoice', (req, res) => {
  const {
    invoiceId
  } = req.body;
 // console.log("invoiceId", invoiceId,"signatureImage",signatureImage)
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

  db.query(invoiceQuery, [invoiceId], (err, invoiceResult) => {
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
    db.query(invoiceDataQuery, [invoiceId], (invoiceErr, invoiceData) => {
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
        db.query(productDataQuery, [invoiceId], (productErr, productData) => {
          if (productErr) {
            console.error(productErr);
            return res.status(500).json({
              error: 'Database error'
            });
          }
          if (productData.length === 0) {
            return res.status(404).json({
              error: 'Product data not found'
            });
          } else {
            console.log("productData", productData, "invoiceData", invoiceData)
            const productImageQuery = `
            SELECT * FROM productimages
            WHERE product_id = ?
          `;
          db.query(productImageQuery,[productData.product_id],(productErr,productImagesData)=>{
            if (productErr) {
                console.error(productErr);
                return res.status(500).json({
                  error: 'Database error'
                });
              }
              if (productImagesData.length === 0) {
                return res.status(404).json({
                  error: ' Product Image data not found'
                });
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