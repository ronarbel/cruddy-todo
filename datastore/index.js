const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, counterStr) => {
    var id = counterStr;
    items[id] = text;
    fs.writeFile(exports.dataDir + `/${id}.txt`, text, (err) => {
      if (err) {
        throw ('error creating');
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  // promise version
  const readFileAsync = Promise.promisify(fs.readFile);
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      let data = _.map(files, file => {
        let pathName = exports.dataDir + `/${file}`;
        let id = path.basename(file, '.txt');
        return readFileAsync(pathName)
          .then(text => {
            return {id, text: text.toString()};
          });
      });
      Promise.all(data)
        .then(todos => {
          callback(null, todos);
        });
    }
  });

  // callback version
  // var data = [];
  // fs.readdir(exports.dataDir, (err, files) => {
  //   _.each(files, (fileName) => {
  //     let id = fileName.slice(0, -4);
  //     fileName = id;
  //     data.push({ id, fileName });
  //   });
  //   callback(null, data);
  // });
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + `/${id}.txt`, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id, text: data.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  fs.access(exports.dataDir + `/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(exports.dataDir + `/${id}.txt`, text, () => {
        callback(null, { id, text });
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(exports.dataDir + `/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
