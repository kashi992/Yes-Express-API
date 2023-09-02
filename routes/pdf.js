// // routes/pdf.js
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
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const signatureImageBase64 = fs.readFileSync(path.join(__dirname, '../images/base64logo.txt'), 'utf8');
const decodedImage = Buffer.from(signatureImageBase64, 'base64');

// Generate PDF
router.post('/generatepdf', (req, res) => {
  const {
    invoiceId,
    signatureImage
  } = req.body;
  console.log("invoiceId", invoiceId,"signatureImage",signatureImage)
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
    const invoiceIdReg=invoiceResult[0].id;
    console.log("invoiceType", invoiceType)
    console.log("invoiceIdReg", invoiceIdReg)

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
        db.query(productDataQuery, [invoiceIdReg], (productErr, productData) => {
          if (productErr) {
            console.error(productErr);
            return res.status(500).json({
              error: 'Database error'
            });
          }
          if (productData.length === 0) {
            return res.status(404).json({
              error: 'Invoice product data not found'
            });
          } else {
            console.log("productData", productData, "invoiceData", invoiceData)
            let doc = new PDFDocument({
              size: "A4",
              margin: 50,
              position:"relative"
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');



            //     // Respond with PDF or appropriate message
            doc.pipe(res);
                // doc.image(signatureImageBase64, {
                //   width: 100,
                //   height: 100,
                //   align: 'left',
                // });
             //   generateHeader(doc);
             doc
             .fontSize(8)
             .text('Invoice Id:',15, 10);
             doc
             .fontSize(8)
             .text(invoiceId,55, 10);
             doc.image(decodedImage, 80, 30,{ width: 60, height: 60, align: 'left', })
             doc.moveDown(1); 
            doc
            .fontSize(10)
            .text('8 Amarina Close,\nMeadow Heights, VIC 3048',  { align: 'right' });
            doc.moveDown(1); 
          doc
            .fontSize(10)
            .text('0476 909 090\nyesexpress.mel@gmail.com',  { align: 'right' });
            doc.moveDown(1); 
            doc.font('Helvetica-Bold');
            doc
              .fontSize(16)
              .text('INTERNATIONAL COURIER & CARGO SERVICES',  { align: 'center' })
            doc.font('Helvetica');
            doc.moveDown(1); 
            doc.font('Helvetica-Bold');
            doc.fontSize(14);
            doc.text('FREIGHT BOOKING FORM',{ align: 'center' });

            //     // Draw sender information box
            doc.rect(100, 170, 210, 150).stroke(); // Draw a rectangle for sender info
            doc.fontSize(12);
            doc.text('SENDER INFORMATION', 110, 180);

            //     // Use Helvetica-Bold for headings and Helvetica for values
            doc.font('Helvetica-Bold');
            doc.text('Name:', 110, 200);
            doc.text('Address:', 110, 220);
            doc.moveDown(1); 
            doc.text('Postcode:', 110, 240);
            doc.text('Phone:', 110, 260);
            doc.text('Email:', 110, 280);

            doc.font('Helvetica');
                    
            doc.text(`${invoiceData[0].sender_name}`, 180, 200);
          //  doc.moveDown(1); 
            doc.text(`${invoiceData[0].sender_address}`, {
              width: 150, // Set the width txt wrapping
             // align: 'center', // Continue on the samo control tee line
            });        
            doc.moveDown(1);   
             doc.text(`${invoiceData[0].sender_postcode}`, 180, 240);
            doc.text(`${invoiceData[0].sender_phone1}`, 180, 260);
            doc.text(`${invoiceData[0].sender_email}`, {
              width: 100, 
              marginTop:2// Set the width txt wrapping
             // align: 'center', // Continue on the samo control tee line
            } );
            

            //     // Draw receiver information box
            doc.rect(340, 170, 200, 150).stroke(); // Draw a rectangle for receiver info
            doc.font('Helvetica-Bold');
            doc.fontSize(12);
            doc.text('RECEIVER INFORMATION', 350, 180);

            // Use Helvetica-Bold for headings and Helvetica for values
            doc.font('Helvetica-Bold');
            doc.text('Name:', 350, 200);
            doc.text('Address:', 350, 220);
            doc.text('Postcode:', 350, 240);

            doc.text('District:', 350, 260);
            doc.text('State:', 350, 280);
            doc.text('Phone:', 350, 300);


            doc.font('Helvetica');
            doc.text(`${invoiceData[0].receiver_name}`, 420, 200);
            doc.text(`${invoiceData[0].receiver_address}`, 420, 220);
            doc.text(`${invoiceData[0].receiver_postcode}`, 420, 240);
            doc.text(`${invoiceData[0].receiver_district}`, 420, 260);
            doc.text(`${invoiceData[0].receiver_city}`, 420, 280);
            doc.text(`${invoiceData[0].receiver_phone1}`, 420, 300);
            doc.font('Helvetica-Bold');
            doc.fontSize(14);
            doc.text('PARCEL INFORMATION', 218, 340);
            // Finalize the PDF and end the response
           // Draw the table headers box
// ... Previous code ...

// Calculate the width of the table
// ... Previous code ...

// Calculate the width of the table
const tableWidth = 440;
const columnWidth = (tableWidth - 50) / 5; // 50 is the right margin

// Draw the table headers box
const tableHeadersBoxTop = 370;
const tableHeadersBoxHeight = 20;
doc.rect(100, tableHeadersBoxTop, tableWidth, tableHeadersBoxHeight).stroke(); // Draw a rectangle around table headers

// Draw the table headers
doc.font('Helvetica-Bold');
doc.fontSize(10);
doc.text('Description', 110, tableHeadersBoxTop + 5);
doc.text('Box/Kg', 100 + columnWidth, tableHeadersBoxTop + 5, { width: columnWidth, align: 'right' });
doc.text('Length (cm)', 100 + 2 * columnWidth, tableHeadersBoxTop + 5, { width: columnWidth, align: 'right' });
doc.text('Width (cm)', 130 + 3 * columnWidth, tableHeadersBoxTop + 5, { width: columnWidth, align: 'right' });
doc.text('Height (cm)', 140 + 4 * columnWidth, tableHeadersBoxTop + 5, { width: columnWidth, align: 'right' });

// Calculate the required height for the product rows box
const totalProductRowsHeight = (productData.length + 1) * 20; // +1 for the total row

// Draw the product rows box
const productRowsBoxTop = tableHeadersBoxTop + tableHeadersBoxHeight;
doc.rect(100, productRowsBoxTop, tableWidth, totalProductRowsHeight).stroke(); // Draw a rectangle around product rows

// Draw the product rows
doc.font('Helvetica');
doc.fontSize(10);

let currentY = productRowsBoxTop + 5; // Starting y-coordinate for the first row

for (const product of productData) {
  doc.text(product.product_name, 110, currentY);
  doc.text(product.box_weight.toString(), 100 + columnWidth, currentY, { width: columnWidth, align: 'right' });
  doc.text(product.length, 100 + 2 * columnWidth, currentY, { width: columnWidth, align: 'right' });
  doc.text(product.width, 130 + 3 * columnWidth, currentY, { width: columnWidth, align: 'right' });
  doc.text(product.height, 140 + 4 * columnWidth, currentY, { width: columnWidth, align: 'right' });

  currentY += 20; // Move down for the next row
}

// Draw total quantity and total weight
const totalQuantity = productData.length;
const totalWeight = productData.reduce((sum, product) => sum + product.box_weight, 0);

// Draw total quantity and total weight
doc.font('Helvetica-Bold');
doc.text(`Total Quantity: ${totalQuantity}`, 100, currentY + 20, { width: tableWidth, align: 'right' });
doc.text(`Total Weight: ${totalWeight} Kg`, 100, currentY + 40, { width: tableWidth, align: 'right' });
// Finalize the PDF and end the response
const termsAndConditions = `
• Please read the terms and conditions before signing the slip.
• Parcel will be delivered 6 to 8 weeks and may be delivered late if customs office is closed or poor weather conditions.
• Complaints must be notified within 24 hours of receiving the parcel, otherwise the company will not be responsible for any
  loss or damage. No claim may be made against Yes Express outside of this time limit.
• Old parcels will be valued at AUD$50. New Parcels will be Valued at AUD$100. For any claims, proof of purchase must be
  provided. No Claim will be entertained by Yes Express exceeding these amounts.
• Shipment of undeclared value shall be accepted for carriage & delivery "On Shipper’s/Sender's Risk Alone".
`;

doc.moveDown(2);
doc.font('Helvetica-Bold'); // Bold font for headings
doc.fontSize(10);
doc.text('Terms & Conditions:', { width: 425, align: 'left' }); // Bold heading
//doc.moveDown(0.5); // Some spacing

doc.font('Helvetica'); // Regular font for content
doc.text(termsAndConditions, { width: 425, align: 'justify' });

doc.moveDown(0.5); // Additional spacing

doc.font('Helvetica-Bold'); // Bold font for headings
doc.text('Customer’s Declaration:', { width: 425, align: 'left' }); // Bold heading
doc.moveDown(0.5); // Some spacing

doc.font('Helvetica'); // Regular font for content
doc.text(`I/We hereby authorize Yes Express to complete all necessary formalities on our behalf, subject to their standard term and
conditions. Also undertake that there are no contraband items (drugs, explosives, aerosols, radioactive material, firearms,
pressured cylinder etc) packed in this consignment.`, { width: 425, align: 'justify' });

// Draw Shipper/Sender Signature line
doc.moveDown(1); // Additional spacing
doc.font('Helvetica-Bold');
doc.text('Shipper/Sender Signature:', { align: 'left' });


if (signatureImage) {
  try {
    const decodedSignature = Buffer.from(signatureImage, 'base64');

    // Calculate the dimensions of the image
    const maxWidth = 150; // Adjust this as needed
    const maxHeight = 80; // Adjust this as needed
    // const imageWidth = Math.min(maxWidth, doc.page.width - 100); // Limit the image width
    // const imageHeight = (imageWidth * maxHeight) / maxWidth;


    // Insert the decoded image into the PDF
    doc.image(decodedSignature, { width: maxWidth, height: maxHeight });
  } catch (error) {
    console.error('Error decoding or inserting signature image:', error);
  }
}

//doc.text('Date:', { align: 'right' });

// Draw Agent Signature line
//doc.moveDown(1); // Additional spacing
doc.font('Helvetica-Bold');
doc.text('Agent Signature:', { align: 'left' });
//doc.text('Date:', { align: 'right' });

// Finalize the PDF and end the response
doc.font('Helvetica');
doc.moveTo(doc.page.width - 100, doc.page.height - 100);

// Check if invoiceData[0].created_at exists and is a valid date string
console.log("invoiceData[0].created_at",invoiceData[0].created_at)
if (invoiceData[0].created_at && invoiceData[0].created_at !="Invalid Date") {
  const createdAtDate = new Date(invoiceData[0].created_at);
  
  // Format the date as 'YYYY-MM-DD' (you can change the format as needed)
  const formattedDate = createdAtDate.toISOString().split('T')[0];
  
  // Display the formatted date
  doc.font('Helvetica');
  doc.fontSize(10);
  doc.text(`Date: ${formattedDate}`, { width: 425, align: 'right' });
}


// Add the text "Date:" at the bottom right corner

doc.end();


// Finalize the PDF and end the response


// Finalize the PDF and end the response


          }


        })
      }
    })
    // db.query(invoiceDataQuery, [invoiceId], (invoiceErr, invoiceData) => {
    //   if (invoiceErr) {
    //     console.error(invoiceErr);
    //     return res.status(500).json({ error: 'Database error' });
    //   }

    //   if (invoiceData.length === 0) {
    //     return res.status(404).json({ error: 'Invoice data not found' });
    //   }

    //   // Create PDF
    //   // const doc = new PDFDocument();
    //   // const filePath = path.join(__dirname, '..', 'pdfs', `invoice_${invoiceId}.pdf`);
    //   // const pdfStream = fs.createWriteStream(filePath);
    //   // doc.pipe(pdfStream);

    //   // // Add content to the PDF
    //   // doc.text('Invoice', { align: 'center', fontSize: 20 });
    //   // doc.text(`Invoice ID: ${invoiceId}`, { align: 'center', fontSize: 14 });
    //   // Add sender, receiver, product information, etc. as needed

    //   // Add signature image
    //   // if (signatureImage) {
    //   //   const signatureImagePath = path.join(__dirname, '..', 'signatures', `${invoiceId}_signature.png`);
    //   //   fs.writeFileSync(signatureImagePath, signatureImage, 'base64');
    //   //   doc.image(signatureImagePath, { align: 'right', width: 100 });
    //   // }

    //  // doc.end();

    //   // pdfStream.on('finish', () => {
    //   //   // Respond with the PDF file
    //   //   return res.download(filePath, `invoice_${invoiceId}.pdf`, () => {
    //   //     // Clean up the generated files
    //   //     fs.unlinkSync(filePath);
    //   //     if (signatureImage) {
    //   //       fs.unlinkSync(signatureImagePath);
    //   //     }
    //   //   });
    //   // });
    // });
  });
});
function generateHeader(doc) {
  doc.image(decodedImage, { width: 50, height: 50 })

    // .fillColor("#444444")
    // .fontSize(20)
    // .text("ACME Inc.", 110, 57)
    // .fontSize(10)
    // .text("ACME Inc.", 200, 50, { align: "right" })
    // .text("123 Main Street", 200, 65, { align: "right" })
    // .text("New York, NY, 10025", 200, 80, { align: "right" })
    // .moveDown();
}
module.exports = router;