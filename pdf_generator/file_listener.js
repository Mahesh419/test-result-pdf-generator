const fl = require('file-listener');
const fs = require('fs');
const xml2js = require('xml2js');
const PDFDocument = require('pdfkit');
const pdf2s3 = require('./pdf2s3');

var parser = new xml2js.Parser();

var watch = require('node-watch');
 
watch('../test', { recursive: true }, function(evt, name) {
  console.log('%s changed.', name);
  fs.readFile(name, (err, data) => {
      if(err){
          console.log(err);
          return;
      }

      parser.parseString(data, (err, result) => {

        if(err){
            console.log(err);
            return;
        }
        
        summary = result.testsuite.$;
        test_cases = result.testsuite.testcase;

        let fileName = 'output.pdf';

        if(fs.existsSync(`./${fileName}`)){
            fs.unlinkSync(fileName);
        }
        // console.log(summary);
        // console.log(test_cases);
        const doc = new PDFDocument({ margin: 50 });
        
        generateHeader(doc, 'Angular');
        generateChallengeInformation(doc, summary);
        generateResultsTable(doc, test_cases);
        
        writeStream = fs.createWriteStream(fileName)
        doc.pipe(writeStream);
        doc.end();

        writeStream.on('finish', function () {
          pdf2s3.uploadFile(fileName);
        });

      });
  });
});

function generateHeader(doc, title) {
    doc
      .text(`Challenge: ${title}`, 50, 45)
      .moveDown();
}

function generateChallengeInformation(doc, summary) {
    doc
      .text(`Date: ${(summary.timestamp.split('T'))[0]}`, 50, 100)
      .text(`Time: ${(summary.timestamp.split('T'))[1]}`, 50, 115)
      .text(`Total tests: ${summary.tests}`, 50, 130)
  
      .moveDown();
}

function generateTableRow(doc, y, col1, col2, col3, col4) {
    doc
      .fontSize(10)
      .text(col1, 50, y, { width: 230, align: "left" })
      .text(col2, 280, y, { width: 120, align: "right" })
      .text(col3, 400, y,  { width: 50, align: "right" })
      .text(col4, 450, y, { width: 40, align: "right" })
}

function generateResultsTable(doc, test_cases) {
    let i,
      invoiceTableTop = 200;

      generateTableRow(
        doc,
        invoiceTableTop,
        'Test case',
        'Class name',
        'Execution time',
        'Status'
      );
  
    for (i = 0; i < test_cases.length; i++) {
      const test_case = test_cases[i].$;
      const position = invoiceTableTop + (i + 1) * 30;

      let status = 'Pass';
      if(test_cases[i].hasOwnProperty('failure')){
          status = "Fail"
      }

      generateTableRow(
        doc,
        position,
        test_case.name,
        test_case.classname,
        test_case.time,
        status
      );
    }
}

