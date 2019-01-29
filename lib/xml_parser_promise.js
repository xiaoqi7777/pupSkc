const xml2js = require('xml2js');

function parse_xml(xml, option) {
  const parser = new xml2js.Parser(option);
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, _jo) => {
      if (err) {
        reject(err);
      } else {
        resolve(_jo);
      }
    });
  });
}

export { parse_xml }
