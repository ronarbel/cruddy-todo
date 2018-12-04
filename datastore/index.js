const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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
  var data = [];
  fs.readdir(exports.dataDir, (err, files) => {
    _.each(files, (text) => {
      let id = text.slice(0, -4);
      text = id;
      data.push({ id, text });
    });
    callback(null, data);
  });
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
