var fs = require('fs'),
    xml2js = require('xml2js'),
    pageTitleMap = {},
    builder = new xml2js.Builder(),
    finalResult;

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/files/chapterPageData.xml', function (err, data1) {
    var pageNumber = 1;
    var bigNumber = 0;
    var lastNumberLabel;
    var tmpLabel;
    parser.parseString(data1, function (err, chapterPageData) {
        chapterPageData.bookStructure.sections.forEach(function (sections) {
            sections.section.forEach(function (section) {
                if (bigNumber < +section['$'].identifier) {
                    bigNumber = +section['$'].identifier;
                }
                pageTitleMap[section['$'].identifier] = section['$'].label;
            });
        });
    });
    for (var key = 1; key < bigNumber; key++) {
        if (pageTitleMap[key]) {
            lastNumberLabel = pageTitleMap[key];
        } else {
            pageTitleMap[key] = lastNumberLabel;
        }
    }
    lastNumberLabel = pageTitleMap[bigNumber];

    fs.readFile(__dirname + '/files/findResources.xml', function (err, data2) {
        parser.parseString(data2, function (err, findResources) {
            findResources.container.container.forEach(function (container) {
                container.assets.forEach(function (asset) {
                    asset.asset.forEach(function (obj) {
                        if (!pageTitleMap[obj['$'].pageID]) {
                            obj.name[0] = lastNumberLabel.trim();
                        } else {
                            obj.name[0] = pageTitleMap[obj['$'].pageID].trim();
                        }
                    });
                });
            });
            finalResult = builder.buildObject(findResources);
            fs.writeFile(__dirname + '/files/findResources_result.xml', finalResult, 'utf8', function (err) {
                if (err) {
                    throw err;
                } else {
                    console.log('Process Completed');
                }
            });
        });
    });
});



