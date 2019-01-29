const http = require('http');
const qs = require('querystring');

function httpPost(host, port, uri, postData, option) {
  //const content = JSON.stringify(postData);
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: host,
      port: port,
      method: 'POST',
      path: uri,
      agent: false,
      timeout: (option && option.timeout) ? option.timeout : 1500,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      }
    }, (res) => {
      let rawData = ""
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
};

function httpPut(host, port, uri, putData) {
  const content = JSON.stringify(putData);
  console.log(content + "##")
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: host,
      port: port,
      method: 'PUT',
      path: uri,
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
      }
    }, (res) => {
      let rawData = ""
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });

    req.on('error', (e) => {
      reject({
        code: 1111,
        message: e.message
      });
    });
    req.write(content);
    req.end();
  });
};

function httpGet(host, port, uri, postData) {
  const content = JSON.stringify(postData);
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: host,
      port: port,
      method: 'GET',
      path: uri,
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
      }
    }, (res) => {
      let rawData = ""
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });

    req.on('error', (e) => {
      reject({
        code: 1111,
        message: e.message
      });
    });
    req.write(content);
    req.end();
  });
}

function httpOption(options, xml) {
  return new Promise((resolve, reject) => {
    let req = http.request(options, (res) => {
      let rawData = "";
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });
    req.on("error", (e) => {
      reject({
        code: 1111,
        message: e.message
      });
    });
    req.write(xml);
    req.end();
  });
}


function httpPost2(host, port, uri, postData) {
  const content = JSON.stringify(postData);
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: host,
      port: port,
      method: 'POST',
      path: uri,
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
      }
    }, (res) => {
      let rawData = ""
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });

    req.on('error', (e) => {
      reject({
        code: 1111,
        message: e.message
      });
    });
    req.write(content);
    req.end();
  });
};

function httpDelete(host, port, uri, deleteData) {
  const content = JSON.stringify(deleteData);
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: host,
      port: port,
      method: 'DELETE',
      path: uri,
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
      }
    }, (res) => {
      let rawData = ""
      res.on('data', (data) => {
        rawData += data;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    });

    req.on('error', (e) => {
      reject({
        code: 1111,
        message: e.message
      });
    });
    req.write(content);
    req.end();
  });
};

export { httpPost, httpGet, httpPut, httpOption, httpPost2, httpDelete }
