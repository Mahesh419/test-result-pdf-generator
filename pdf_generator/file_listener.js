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

        let fileName = `output_${new Date().getTime()}.pdf`;
        // console.log(summary);
        // console.log(test_cases);
        const doc = new PDFDocument({ margin: 50 });
        
        generateHeader(doc);
        generateOverview(doc, 'Angular', 'Heshan', summary);
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

function generateHeader(doc){
  doc
    .fontSize(18)
    .font('./fonts/Roboto/Roboto-Bold.ttf')
    .fillColor('#404040')
    .text('CODERS GLORY', 50, 80);
  
  doc
    .fontSize(15)
    .font('./fonts/Roboto/Roboto-Bold.ttf')
    .fillColor('#404040')
    .text('TEST RESULTS REPORT', 50, 105);
  
  doc.image('99XT logo black.png', 400, 45, {scale: 0.01});

  doc.font('./fonts/Roboto/Roboto-Light.ttf');
}

function generateOverview(doc, challenge, name, summary) {
    doc.fontSize(12)
      .font('./fonts/Roboto/Roboto-Medium.ttf')
      .text(`Overview`, 50, 155)
      .moveDown();

    doc.font('./fonts/Roboto/Roboto-Light.ttf');

    horizontalLine(doc, 40, 170, 550, 170);  

    doc.fontSize(10)
      .text(`Name: ${name}`, 50, 180)
      .text(`Challenge: ${challenge}`, 50, 200)
      .text(`Date: ${(summary.timestamp.split('T'))[0]}`, 400, 180)
      .text(`Time: ${(summary.timestamp.split('T'))[1]}`, 400, 200)
      .text(`Total tests: ${summary.tests}`, 50, 220)
  
      .moveDown();
}

function generateTableRow(doc, y, col1, col2, col3, col4) {
    doc
      .fontSize(10)
      .text(col1, 50, y, { width: 230, align: "left" })
      .text(col2, 280, y, { width: 120, align: "right" })
      .text(col3, 400, y,  { width: 80, align: "right" });

      if('Pass' === col4){
        doc
          .fillColor('#008000')
          .text(col4, 480, y, { width: 40, align: "right" }).fillColor('#404040');
        return 0;
      }else if('Fail' == col4){
        doc
          .fillColor('#B80F0A')
          .text(col4, 480, y, { width: 40, align: "right" }).fillColor('#404040');
        return 1;
      }else{
        doc
          .text(col4, 480, y, { width: 40, align: "right" });
        return 0;
      }

      //horizontalLine(doc, 40, y - 10, 500, y - 10);
}

function generateResultsTable(doc, test_cases) {

  doc.fontSize(12)  
      .font('./fonts/Roboto/Roboto-Medium.ttf')
      .text(`Test Description`, 50, 255)
      .moveDown();
 
  horizontalLine(doc, 40, 270, 550, 270);

  doc.font('./fonts/Roboto/Roboto-Light.ttf');

    let i,
      invoiceTableTop = 290;
      horizontalLine(doc, 45, 305, 530, 305);

    let failCount = 0;

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

      failCount += generateTableRow(
        doc,
        position,
        test_case.name,
        test_case.classname,
        test_case.time,
        status
      );
    }

    let totalScore = ((i - failCount) / i) * 100;

    doc.fontSize(12)  
    .font('./fonts/Roboto/Roboto-Medium.ttf')
    .text(`Total: ${totalScore} %`, 460, invoiceTableTop + 20 + (i + 1) * 30)
    .moveDown();
}

function horizontalLine(doc, x1, y1, x2, y2){
  doc
    .strokeColor('#A9A9A9')
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke();
}

