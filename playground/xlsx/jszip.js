/**

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2012 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See LICENSE.markdown.

Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").file("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/
// We use strict, but it should not be placed outside of a function because
// the environment is shared inside the browser.
// "use strict";

/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=|ArrayBuffer=|Uint8Array=|Buffer=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */
var JSZip = function (data, options) {
  // object containing the files :
  // {
  //   "folder/" : {...},
  //   "folder/data.txt" : {...}
  // }
  this.files = {};

  // Where we are in the hierarchy
  this.root = '';

  if (data) {
    this.load(data, options);
  }
};

JSZip.signature = {
  LOCAL_FILE_HEADER: '\x50\x4b\x03\x04',
  CENTRAL_FILE_HEADER: '\x50\x4b\x01\x02',
  CENTRAL_DIRECTORY_END: '\x50\x4b\x05\x06',
  ZIP64_CENTRAL_DIRECTORY_LOCATOR: '\x50\x4b\x06\x07',
  ZIP64_CENTRAL_DIRECTORY_END: '\x50\x4b\x06\x06',
  DATA_DESCRIPTOR: '\x50\x4b\x07\x08',
};

// Default properties for a new file
JSZip.defaults = {
  base64: false,
  binary: false,
  dir: false,
  date: null,
  compression: null,
};

/*
 * List features that require a modern browser, and if the current browser support them.
 */
JSZip.support = {
  // contains true if JSZip can read/generate ArrayBuffer, false otherwise.
  arraybuffer: (function () {
    return (
      typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined'
    );
  })(),
  // contains true if JSZip can read/generate nodejs Buffer, false otherwise.
  nodebuffer: (function () {
    return typeof Buffer !== 'undefined';
  })(),
  // contains true if JSZip can read/generate Uint8Array, false otherwise.
  uint8array: (function () {
    return typeof Uint8Array !== 'undefined';
  })(),
  // contains true if JSZip can read/generate Blob, false otherwise.
  blob: (function () {
    // the spec started with BlobBuilder then replaced it with a construtor for Blob.
    // Result : we have browsers that :
    // * know the BlobBuilder (but with prefix)
    // * know the Blob constructor
    // * know about Blob but not about how to build them
    // About the "=== 0" test : if given the wrong type, it may be converted to a string.
    // Instead of an empty content, we will get "[object Uint8Array]" for example.
    if (typeof ArrayBuffer === 'undefined') {
      return false;
    }
    var buffer = new ArrayBuffer(0);
    try {
      return new Blob([buffer], { type: 'application/zip' }).size === 0;
    } catch (e) {}

    try {
      var BlobBuilder =
        window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;
      var builder = new BlobBuilder();
      builder.append(buffer);
      return builder.getBlob('application/zip').size === 0;
    } catch (e) {}

    return false;
  })(),
};

JSZip.prototype = (function () {
  var textEncoder, textDecoder;
  if (
    JSZip.support.uint8array &&
    typeof TextEncoder === 'function' &&
    typeof TextDecoder === 'function'
  ) {
    textEncoder = new TextEncoder('utf-8');
    textDecoder = new TextDecoder('utf-8');
  }

  /**
   * Returns the raw data of a ZipObject, decompress the content if necessary.
   * @param {ZipObject} file the file to use.
   * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
   */
  var getRawData = function (file) {
    if (file._data instanceof JSZip.CompressedObject) {
      file._data = file._data.getContent();
      file.options.binary = true;
      file.options.base64 = false;

      if (JSZip.utils.getTypeOf(file._data) === 'uint8array') {
        var copy = file._data;
        // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.
        // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).
        file._data = new Uint8Array(copy.length);
        // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
        if (copy.length !== 0) {
          file._data.set(copy, 0);
        }
      }
    }
    return file._data;
  };

  /**
   * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.
   * @param {ZipObject} file the file to use.
   * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
   */
  var getBinaryData = function (file) {
    var result = getRawData(file),
      type = JSZip.utils.getTypeOf(result);
    if (type === 'string') {
      if (!file.options.binary) {
        // unicode text !
        // unicode string => binary string is a painful process, check if we can avoid it.
        if (textEncoder) {
          return textEncoder.encode(result);
        }
        if (JSZip.support.nodebuffer) {
          return new Buffer(result, 'utf-8');
        }
      }
      return file.asBinary();
    }
    return result;
  };

  /**
   * Transform this._data into a string.
   * @param {function} filter a function String -> String, applied if not null on the result.
   * @return {String} the string representing this._data.
   */
  var dataToString = function (asUTF8) {
    var result = getRawData(this);
    if (result === null || typeof result === 'undefined') {
      return '';
    }
    // if the data is a base64 string, we decode it before checking the encoding !
    if (this.options.base64) {
      result = JSZip.base64.decode(result);
    }
    if (asUTF8 && this.options.binary) {
      // JSZip.prototype.utf8decode supports arrays as input
      // skip to array => string step, utf8decode will do it.
      result = JSZip.prototype.utf8decode(result);
    } else {
      // no utf8 transformation, do the array => string step.
      result = JSZip.utils.transformTo('string', result);
    }

    if (!asUTF8 && !this.options.binary) {
      result = JSZip.prototype.utf8encode(result);
    }
    return result;
  };
  /**
   * A simple object representing a file in the zip file.
   * @constructor
   * @param {string} name the name of the file
   * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
   * @param {Object} options the options of the file
   */
  var ZipObject = function (name, data, options) {
    this.name = name;
    this._data = data;
    this.options = options;
  };

  ZipObject.prototype = {
    /**
     * Return the content as UTF8 string.
     * @return {string} the UTF8 string.
     */
    asText: function () {
      return dataToString.call(this, true);
    },
    /**
     * Returns the binary content.
     * @return {string} the content as binary.
     */
    asBinary: function () {
      return dataToString.call(this, false);
    },
    /**
     * Returns the content as a nodejs Buffer.
     * @return {Buffer} the content as a Buffer.
     */
    asNodeBuffer: function () {
      var result = getBinaryData(this);
      return JSZip.utils.transformTo('nodebuffer', result);
    },
    /**
     * Returns the content as an Uint8Array.
     * @return {Uint8Array} the content as an Uint8Array.
     */
    asUint8Array: function () {
      var result = getBinaryData(this);
      return JSZip.utils.transformTo('uint8array', result);
    },
    /**
     * Returns the content as an ArrayBuffer.
     * @return {ArrayBuffer} the content as an ArrayBufer.
     */
    asArrayBuffer: function () {
      return this.asUint8Array().buffer;
    },
  };

  /**
   * Transform an integer into a string in hexadecimal.
   * @private
   * @param {number} dec the number to convert.
   * @param {number} bytes the number of bytes to generate.
   * @returns {string} the result.
   */
  var decToHex = function (dec, bytes) {
    var hex = '',
      i;
    for (i = 0; i < bytes; i++) {
      hex += String.fromCharCode(dec & 0xff);
      dec = dec >>> 8;
    }
    return hex;
  };

  /**
   * Merge the objects passed as parameters into a new one.
   * @private
   * @param {...Object} var_args All objects to merge.
   * @return {Object} a new object with the data of the others.
   */
  var extend = function () {
    var result = {},
      i,
      attr;
    for (i = 0; i < arguments.length; i++) {
      // arguments is not enumerable in some browsers
      for (attr in arguments[i]) {
        if (
          arguments[i].hasOwnProperty(attr) &&
          typeof result[attr] === 'undefined'
        ) {
          result[attr] = arguments[i][attr];
        }
      }
    }
    return result;
  };

  /**
   * Transforms the (incomplete) options from the user into the complete
   * set of options to create a file.
   * @private
   * @param {Object} o the options from the user.
   * @return {Object} the complete set of options.
   */
  var prepareFileAttrs = function (o) {
    o = o || {};
    /*jshint -W041 */
    if (o.base64 === true && o.binary == null) {
      o.binary = true;
    }
    /*jshint +W041 */
    o = extend(o, JSZip.defaults);
    o.date = o.date || new Date();
    if (o.compression !== null) o.compression = o.compression.toUpperCase();

    return o;
  };

  /**
   * Add a file in the current folder.
   * @private
   * @param {string} name the name of the file
   * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
   * @param {Object} o the options of the file
   * @return {Object} the new file.
   */
  var fileAdd = function (name, data, o) {
    // be sure sub folders exist
    var parent = parentFolder(name),
      dataType = JSZip.utils.getTypeOf(data);
    if (parent) {
      folderAdd.call(this, parent);
    }

    o = prepareFileAttrs(o);

    if (o.dir || data === null || typeof data === 'undefined') {
      o.base64 = false;
      o.binary = false;
      data = null;
    } else if (dataType === 'string') {
      if (o.binary && !o.base64) {
        // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask
        if (o.optimizedBinaryString !== true) {
          // this is a string, not in a base64 format.
          // Be sure that this is a correct "binary string"
          data = JSZip.utils.string2binary(data);
        }
      }
    } else {
      // arraybuffer, uint8array, ...
      o.base64 = false;
      o.binary = true;

      if (!dataType && !(data instanceof JSZip.CompressedObject)) {
        throw new Error(
          "The data of '" + name + "' is in an unsupported format !",
        );
      }

      // special case : it's way easier to work with Uint8Array than with ArrayBuffer
      if (dataType === 'arraybuffer') {
        data = JSZip.utils.transformTo('uint8array', data);
      }
    }

    var object = new ZipObject(name, data, o);
    this.files[name] = object;
    return object;
  };

  /**
   * Find the parent folder of the path.
   * @private
   * @param {string} path the path to use
   * @return {string} the parent folder, or ""
   */
  var parentFolder = function (path) {
    if (path.slice(-1) == '/') {
      path = path.substring(0, path.length - 1);
    }
    var lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
  };

  /**
   * Add a (sub) folder in the current folder.
   * @private
   * @param {string} name the folder's name
   * @return {Object} the new folder.
   */
  var folderAdd = function (name) {
    // Check the name ends with a /
    if (name.slice(-1) != '/') {
      name += '/'; // IE doesn't like substr(-1)
    }

    // Does this folder already exist?
    if (!this.files[name]) {
      fileAdd.call(this, name, null, { dir: true });
    }
    return this.files[name];
  };

  /**
   * Generate a JSZip.CompressedObject for a given zipOject.
   * @param {ZipObject} file the object to read.
   * @param {JSZip.compression} compression the compression to use.
   * @return {JSZip.CompressedObject} the compressed result.
   */
  var generateCompressedObjectFrom = function (file, compression) {
    var result = new JSZip.CompressedObject(),
      content;

    // the data has not been decompressed, we might reuse things !
    if (file._data instanceof JSZip.CompressedObject) {
      result.uncompressedSize = file._data.uncompressedSize;
      result.crc32 = file._data.crc32;

      if (result.uncompressedSize === 0 || file.options.dir) {
        compression = JSZip.compressions['STORE'];
        result.compressedContent = '';
        result.crc32 = 0;
      } else if (file._data.compressionMethod === compression.magic) {
        result.compressedContent = file._data.getCompressedContent();
      } else {
        content = file._data.getContent();
        // need to decompress / recompress
        result.compressedContent = compression.compress(
          JSZip.utils.transformTo(compression.compressInputType, content),
        );
      }
    } else {
      // have uncompressed data
      content = getBinaryData(file);
      if (!content || content.length === 0 || file.options.dir) {
        compression = JSZip.compressions['STORE'];
        content = '';
      }
      result.uncompressedSize = content.length;
      result.crc32 = this.crc32(content);
      result.compressedContent = compression.compress(
        JSZip.utils.transformTo(compression.compressInputType, content),
      );
    }

    result.compressedSize = result.compressedContent.length;
    result.compressionMethod = compression.magic;

    return result;
  };

  /**
   * Generate the various parts used in the construction of the final zip file.
   * @param {string} name the file name.
   * @param {ZipObject} file the file content.
   * @param {JSZip.CompressedObject} compressedObject the compressed object.
   * @param {number} offset the current offset from the start of the zip file.
   * @return {object} the zip parts.
   */
  var generateZipParts = function (name, file, compressedObject, offset) {
    var data = compressedObject.compressedContent,
      utfEncodedFileName = this.utf8encode(file.name),
      useUTF8 = utfEncodedFileName !== file.name,
      o = file.options,
      dosTime,
      dosDate;

    // date
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

    dosTime = o.date.getHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | o.date.getMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | (o.date.getSeconds() / 2);

    dosDate = o.date.getFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | (o.date.getMonth() + 1);
    dosDate = dosDate << 5;
    dosDate = dosDate | o.date.getDate();

    var header = '';

    // version needed to extract
    header += '\x0A\x00';
    // general purpose bit flag
    // set bit 11 if utf8
    header += useUTF8 ? '\x00\x08' : '\x00\x00';
    // compression method
    header += compressedObject.compressionMethod;
    // last mod file time
    header += decToHex(dosTime, 2);
    // last mod file date
    header += decToHex(dosDate, 2);
    // crc-32
    header += decToHex(compressedObject.crc32, 4);
    // compressed size
    header += decToHex(compressedObject.compressedSize, 4);
    // uncompressed size
    header += decToHex(compressedObject.uncompressedSize, 4);
    // file name length
    header += decToHex(utfEncodedFileName.length, 2);
    // extra field length
    header += '\x00\x00';

    var fileRecord =
      JSZip.signature.LOCAL_FILE_HEADER + header + utfEncodedFileName;

    var dirRecord =
      JSZip.signature.CENTRAL_FILE_HEADER +
      // version made by (00: DOS)
      '\x14\x00' +
      // file header (common to file and central directory)
      header +
      // file comment length
      '\x00\x00' +
      // disk number start
      '\x00\x00' +
      // internal file attributes TODO
      '\x00\x00' +
      // external file attributes
      (file.options.dir === true ? '\x10\x00\x00\x00' : '\x00\x00\x00\x00') +
      // relative offset of local header
      decToHex(offset, 4) +
      // file name
      utfEncodedFileName;

    return {
      fileRecord: fileRecord,
      dirRecord: dirRecord,
      compressedObject: compressedObject,
    };
  };

  /**
   * An object to write any content to a string.
   * @constructor
   */
  var StringWriter = function () {
    this.data = [];
  };
  StringWriter.prototype = {
    /**
     * Append any content to the current string.
     * @param {Object} input the content to add.
     */
    append: function (input) {
      input = JSZip.utils.transformTo('string', input);
      this.data.push(input);
    },
    /**
     * Finalize the construction an return the result.
     * @return {string} the generated string.
     */
    finalize: function () {
      return this.data.join('');
    },
  };
  /**
   * An object to write any content to an Uint8Array.
   * @constructor
   * @param {number} length The length of the array.
   */
  var Uint8ArrayWriter = function (length) {
    this.data = new Uint8Array(length);
    this.index = 0;
  };
  Uint8ArrayWriter.prototype = {
    /**
     * Append any content to the current array.
     * @param {Object} input the content to add.
     */
    append: function (input) {
      if (input.length !== 0) {
        // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
        input = JSZip.utils.transformTo('uint8array', input);
        this.data.set(input, this.index);
        this.index += input.length;
      }
    },
    /**
     * Finalize the construction an return the result.
     * @return {Uint8Array} the generated array.
     */
    finalize: function () {
      return this.data;
    },
  };

  // return the actual prototype of JSZip
  return {
    /**
     * Read an existing zip and merge the data in the current JSZip object.
     * The implementation is in jszip-load.js, don't forget to include it.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load
     * @param {Object} options Options for loading the stream.
     *  options.base64 : is the stream in base64 ? default : false
     * @return {JSZip} the current JSZip object
     */
    load: function (stream, options) {
      throw new Error(
        'Load method is not defined. Is the file jszip-load.js included ?',
      );
    },

    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function (search) {
      var result = [],
        filename,
        relativePath,
        file,
        fileClone;
      for (filename in this.files) {
        if (!this.files.hasOwnProperty(filename)) {
          continue;
        }
        file = this.files[filename];
        // return a new object, don't let the user mess with our internal objects :)
        fileClone = new ZipObject(file.name, file._data, extend(file.options));
        relativePath = filename.slice(this.root.length, filename.length);
        if (
          filename.slice(0, this.root.length) === this.root && // the file is in the current root
          search(relativePath, fileClone)
        ) {
          // and the file matches the function
          result.push(fileClone);
        }
      }
      return result;
    },

    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function (name, data, o) {
      if (arguments.length === 1) {
        if (JSZip.utils.isRegExp(name)) {
          var regexp = name;
          return this.filter(function (relativePath, file) {
            return !file.options.dir && regexp.test(relativePath);
          });
        } else {
          // text
          return (
            this.filter(function (relativePath, file) {
              return !file.options.dir && relativePath === name;
            })[0] || null
          );
        }
      } else {
        // more than one argument : we have data !
        name = this.root + name;
        fileAdd.call(this, name, data, o);
      }
      return this;
    },

    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function (arg) {
      if (!arg) {
        return this;
      }

      if (JSZip.utils.isRegExp(arg)) {
        return this.filter(function (relativePath, file) {
          return file.options.dir && arg.test(relativePath);
        });
      }

      // else, name is a new folder
      var name = this.root + arg;
      var newFolder = folderAdd.call(this, name);

      // Allow chaining by returning a new object with this folder as the root
      var ret = this.clone();
      ret.root = newFolder.name;
      return ret;
    },

    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function (name) {
      name = this.root + name;
      var file = this.files[name];
      if (!file) {
        // Look for any folders
        if (name.slice(-1) != '/') {
          name += '/';
        }
        file = this.files[name];
      }

      if (file) {
        if (!file.options.dir) {
          // file
          delete this.files[name];
        } else {
          // folder
          var kids = this.filter(function (relativePath, file) {
            return file.name.slice(0, name.length) === name;
          });
          for (var i = 0; i < kids.length; i++) {
            delete this.files[kids[i].name];
          }
        }
      }

      return this;
    },

    /**
     * Generate the complete zip file
     * @param {Object} options the options to generate the zip file :
     * - base64, (deprecated, use type instead) true to generate base64.
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
     */
    generate: function (options) {
      options = extend(options || {}, {
        base64: true,
        compression: 'STORE',
        type: 'base64',
      });

      JSZip.utils.checkSupport(options.type);

      var zipData = [],
        localDirLength = 0,
        centralDirLength = 0,
        writer,
        i;

      // first, generate all the zip parts.
      for (var name in this.files) {
        if (!this.files.hasOwnProperty(name)) {
          continue;
        }
        var file = this.files[name];

        var compressionName =
          file.options.compression || options.compression.toUpperCase();
        var compression = JSZip.compressions[compressionName];
        if (!compression) {
          throw new Error(
            compressionName + ' is not a valid compression method !',
          );
        }

        var compressedObject = generateCompressedObjectFrom.call(
          this,
          file,
          compression,
        );

        var zipPart = generateZipParts.call(
          this,
          name,
          file,
          compressedObject,
          localDirLength,
        );
        localDirLength +=
          zipPart.fileRecord.length + compressedObject.compressedSize;
        centralDirLength += zipPart.dirRecord.length;
        zipData.push(zipPart);
      }

      var dirEnd = '';

      // end of central dir signature
      dirEnd =
        JSZip.signature.CENTRAL_DIRECTORY_END +
        // number of this disk
        '\x00\x00' +
        // number of the disk with the start of the central directory
        '\x00\x00' +
        // total number of entries in the central directory on this disk
        decToHex(zipData.length, 2) +
        // total number of entries in the central directory
        decToHex(zipData.length, 2) +
        // size of the central directory   4 bytes
        decToHex(centralDirLength, 4) +
        // offset of start of central directory with respect to the starting disk number
        decToHex(localDirLength, 4) +
        // .ZIP file comment length
        '\x00\x00';

      // we have all the parts (and the total length)
      // time to create a writer !
      switch (options.type.toLowerCase()) {
        case 'uint8array':
        case 'arraybuffer':
        case 'blob':
        case 'nodebuffer':
          writer = new Uint8ArrayWriter(
            localDirLength + centralDirLength + dirEnd.length,
          );
          break;
        // case "base64" :
        // case "string" :
        default:
          writer = new StringWriter(
            localDirLength + centralDirLength + dirEnd.length,
          );
          break;
      }

      for (i = 0; i < zipData.length; i++) {
        writer.append(zipData[i].fileRecord);
        writer.append(zipData[i].compressedObject.compressedContent);
      }
      for (i = 0; i < zipData.length; i++) {
        writer.append(zipData[i].dirRecord);
      }

      writer.append(dirEnd);

      var zip = writer.finalize();

      switch (options.type.toLowerCase()) {
        // case "zip is an Uint8Array"
        case 'uint8array':
        case 'arraybuffer':
        case 'nodebuffer':
          return JSZip.utils.transformTo(options.type.toLowerCase(), zip);
        case 'blob':
          return JSZip.utils.arrayBuffer2Blob(
            JSZip.utils.transformTo('arraybuffer', zip),
          );

        // case "zip is a string"
        case 'base64':
          return options.base64 ? JSZip.base64.encode(zip) : zip;
        default: // case "string" :
          return zip;
      }
    },

    /**
     *
     *  Javascript crc32
     *  http://www.webtoolkit.info/
     *
     */
    crc32: function crc32(input, crc) {
      if (typeof input === 'undefined' || !input.length) {
        return 0;
      }

      var isArray = JSZip.utils.getTypeOf(input) !== 'string';

      var table = [
        0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f,
        0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
        0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2,
        0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
        0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
        0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
        0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c,
        0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
        0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423,
        0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
        0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106,
        0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
        0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d,
        0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
        0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
        0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
        0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7,
        0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
        0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa,
        0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
        0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81,
        0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
        0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84,
        0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
        0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
        0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
        0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e,
        0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
        0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55,
        0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
        0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28,
        0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
        0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f,
        0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
        0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
        0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
        0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69,
        0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
        0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc,
        0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
        0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693,
        0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
        0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d,
      ];

      if (typeof crc == 'undefined') {
        crc = 0;
      }
      var x = 0;
      var y = 0;
      var byte = 0;

      crc = crc ^ -1;
      for (var i = 0, iTop = input.length; i < iTop; i++) {
        byte = isArray ? input[i] : input.charCodeAt(i);
        y = (crc ^ byte) & 0xff;
        x = table[y];
        crc = (crc >>> 8) ^ x;
      }

      return crc ^ -1;
    },

    // Inspired by http://my.opera.com/GreyWyvern/blog/show.dml/1725165
    clone: function () {
      var newObj = new JSZip();
      for (var i in this) {
        if (typeof this[i] !== 'function') {
          newObj[i] = this[i];
        }
      }
      return newObj;
    },

    /**
     * http://www.webtoolkit.info/javascript-utf8.html
     */
    utf8encode: function (string) {
      // TextEncoder + Uint8Array to binary string is faster than checking every bytes on long strings.
      // http://jsperf.com/utf8encode-vs-textencoder
      // On short strings (file names for example), the TextEncoder API is (currently) slower.
      if (textEncoder) {
        var u8 = textEncoder.encode(string);
        return JSZip.utils.transformTo('string', u8);
      }
      if (JSZip.support.nodebuffer) {
        return JSZip.utils.transformTo('string', new Buffer(string, 'utf-8'));
      }

      // array.join may be slower than string concatenation but generates less objects (less time spent garbage collecting).
      // See also http://jsperf.com/array-direct-assignment-vs-push/31
      var result = [],
        resIndex = 0;

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          result[resIndex++] = String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          result[resIndex++] = String.fromCharCode((c >> 6) | 192);
          result[resIndex++] = String.fromCharCode((c & 63) | 128);
        } else {
          result[resIndex++] = String.fromCharCode((c >> 12) | 224);
          result[resIndex++] = String.fromCharCode(((c >> 6) & 63) | 128);
          result[resIndex++] = String.fromCharCode((c & 63) | 128);
        }
      }

      return result.join('');
    },

    /**
     * http://www.webtoolkit.info/javascript-utf8.html
     */
    utf8decode: function (input) {
      var result = [],
        resIndex = 0;
      var type = JSZip.utils.getTypeOf(input);
      var isArray = type !== 'string';
      var i = 0;
      var c = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;

      // check if we can use the TextDecoder API
      // see http://encoding.spec.whatwg.org/#api
      if (textDecoder) {
        return textDecoder.decode(JSZip.utils.transformTo('uint8array', input));
      }
      if (JSZip.support.nodebuffer) {
        return JSZip.utils.transformTo('nodebuffer', input).toString('utf-8');
      }

      while (i < input.length) {
        c = isArray ? input[i] : input.charCodeAt(i);

        if (c < 128) {
          result[resIndex++] = String.fromCharCode(c);
          i++;
        } else if (c > 191 && c < 224) {
          c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
          result[resIndex++] = String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
          c3 = isArray ? input[i + 2] : input.charCodeAt(i + 2);
          result[resIndex++] = String.fromCharCode(
            ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
          );
          i += 3;
        }
      }

      return result.join('');
    },
  };
})();

/*
 * Compression methods
 * This object is filled in as follow :
 * name : {
 *    magic // the 2 bytes indentifying the compression method
 *    compress // function, take the uncompressed content and return it compressed.
 *    uncompress // function, take the compressed content and return it uncompressed.
 *    compressInputType // string, the type accepted by the compress method. null to accept everything.
 *    uncompressInputType // string, the type accepted by the uncompress method. null to accept everything.
 * }
 *
 * STORE is the default compression method, so it's included in this file.
 * Other methods should go to separated files : the user wants modularity.
 */
JSZip.compressions = {
  STORE: {
    magic: '\x00\x00',
    compress: function (content) {
      return content; // no compression
    },
    uncompress: function (content) {
      return content; // no compression
    },
    compressInputType: null,
    uncompressInputType: null,
  },
};

(function () {
  JSZip.utils = {
    /**
     * Convert a string to a "binary string" : a string containing only char codes between 0 and 255.
     * @param {string} str the string to transform.
     * @return {String} the binary string.
     */
    string2binary: function (str) {
      var result = '';
      for (var i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) & 0xff);
      }
      return result;
    },
    /**
     * Create a Uint8Array from the string.
     * @param {string} str the string to transform.
     * @return {Uint8Array} the typed array.
     * @throws {Error} an Error if the browser doesn't support the requested feature.
     * @deprecated : use JSZip.utils.transformTo instead.
     */
    string2Uint8Array: function (str) {
      return JSZip.utils.transformTo('uint8array', str);
    },

    /**
     * Create a string from the Uint8Array.
     * @param {Uint8Array} array the array to transform.
     * @return {string} the string.
     * @throws {Error} an Error if the browser doesn't support the requested feature.
     * @deprecated : use JSZip.utils.transformTo instead.
     */
    uint8Array2String: function (array) {
      return JSZip.utils.transformTo('string', array);
    },
    /**
     * Create a blob from the given ArrayBuffer.
     * @param {ArrayBuffer} buffer the buffer to transform.
     * @return {Blob} the result.
     * @throws {Error} an Error if the browser doesn't support the requested feature.
     */
    arrayBuffer2Blob: function (buffer) {
      JSZip.utils.checkSupport('blob');

      try {
        // Blob constructor
        return new Blob([buffer], { type: 'application/zip' });
      } catch (e) {}

      try {
        // deprecated, browser only, old way
        var BlobBuilder =
          window.BlobBuilder ||
          window.WebKitBlobBuilder ||
          window.MozBlobBuilder ||
          window.MSBlobBuilder;
        var builder = new BlobBuilder();
        builder.append(buffer);
        return builder.getBlob('application/zip');
      } catch (e) {}

      // well, fuck ?!
      throw new Error("Bug : can't construct the Blob.");
    },
    /**
     * Create a blob from the given string.
     * @param {string} str the string to transform.
     * @return {Blob} the result.
     * @throws {Error} an Error if the browser doesn't support the requested feature.
     */
    string2Blob: function (str) {
      var buffer = JSZip.utils.transformTo('arraybuffer', str);
      return JSZip.utils.arrayBuffer2Blob(buffer);
    },
  };

  /**
   * The identity function.
   * @param {Object} input the input.
   * @return {Object} the same input.
   */
  function identity(input) {
    return input;
  }

  /**
   * Fill in an array with a string.
   * @param {String} str the string to use.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
   * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
   */
  function stringToArrayLike(str, array) {
    for (var i = 0; i < str.length; ++i) {
      array[i] = str.charCodeAt(i) & 0xff;
    }
    return array;
  }

  /**
   * Transform an array-like object to a string.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
   * @return {String} the result.
   */
  function arrayLikeToString(array) {
    // Performances notes :
    // --------------------
    // String.fromCharCode.apply(null, array) is the fastest, see
    // see http://jsperf.com/converting-a-uint8array-to-a-string/2
    // but the stack is limited (and we can get huge arrays !).
    //
    // result += String.fromCharCode(array[i]); generate too many strings !
    //
    // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
    var chunk = 65536;
    var result = [],
      len = array.length,
      type = JSZip.utils.getTypeOf(array),
      k = 0;

    var canUseApply = true;
    try {
      switch (type) {
        case 'uint8array':
          String.fromCharCode.apply(null, new Uint8Array(0));
          break;
        case 'nodebuffer':
          String.fromCharCode.apply(null, new Buffer(0));
          break;
      }
    } catch (e) {
      canUseApply = false;
    }

    // no apply : slow and painful algorithm
    // default browser on android 4.*
    if (!canUseApply) {
      var resultStr = '';
      for (var i = 0; i < array.length; i++) {
        resultStr += String.fromCharCode(array[i]);
      }
      return resultStr;
    }

    while (k < len && chunk > 1) {
      try {
        if (type === 'array' || type === 'nodebuffer') {
          result.push(
            String.fromCharCode.apply(
              null,
              array.slice(k, Math.min(k + chunk, len)),
            ),
          );
        } else {
          result.push(
            String.fromCharCode.apply(
              null,
              array.subarray(k, Math.min(k + chunk, len)),
            ),
          );
        }
        k += chunk;
      } catch (e) {
        chunk = Math.floor(chunk / 2);
      }
    }
    return result.join('');
  }

  /**
   * Copy the data from an array-like to an other array-like.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
   * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
   */
  function arrayLikeToArrayLike(arrayFrom, arrayTo) {
    for (var i = 0; i < arrayFrom.length; i++) {
      arrayTo[i] = arrayFrom[i];
    }
    return arrayTo;
  }

  // a matrix containing functions to transform everything into everything.
  var transform = {};

  // string to ?
  transform['string'] = {
    string: identity,
    array: function (input) {
      return stringToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
      return transform['string']['uint8array'](input).buffer;
    },
    uint8array: function (input) {
      return stringToArrayLike(input, new Uint8Array(input.length));
    },
    nodebuffer: function (input) {
      return stringToArrayLike(input, new Buffer(input.length));
    },
  };

  // array to ?
  transform['array'] = {
    string: arrayLikeToString,
    array: identity,
    arraybuffer: function (input) {
      return new Uint8Array(input).buffer;
    },
    uint8array: function (input) {
      return new Uint8Array(input);
    },
    nodebuffer: function (input) {
      return new Buffer(input);
    },
  };

  // arraybuffer to ?
  transform['arraybuffer'] = {
    string: function (input) {
      return arrayLikeToString(new Uint8Array(input));
    },
    array: function (input) {
      return arrayLikeToArrayLike(
        new Uint8Array(input),
        new Array(input.byteLength),
      );
    },
    arraybuffer: identity,
    uint8array: function (input) {
      return new Uint8Array(input);
    },
    nodebuffer: function (input) {
      return new Buffer(new Uint8Array(input));
    },
  };

  // uint8array to ?
  transform['uint8array'] = {
    string: arrayLikeToString,
    array: function (input) {
      return arrayLikeToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
      return input.buffer;
    },
    uint8array: identity,
    nodebuffer: function (input) {
      return new Buffer(input);
    },
  };

  // nodebuffer to ?
  transform['nodebuffer'] = {
    string: arrayLikeToString,
    array: function (input) {
      return arrayLikeToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
      return transform['nodebuffer']['uint8array'](input).buffer;
    },
    uint8array: function (input) {
      return arrayLikeToArrayLike(input, new Uint8Array(input.length));
    },
    nodebuffer: identity,
  };

  /**
   * Transform an input into any type.
   * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
   * If no output type is specified, the unmodified input will be returned.
   * @param {String} outputType the output type.
   * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
   * @throws {Error} an Error if the browser doesn't support the requested output type.
   */
  JSZip.utils.transformTo = function (outputType, input) {
    if (!input) {
      // undefined, null, etc
      // an empty string won't harm.
      input = '';
    }
    if (!outputType) {
      return input;
    }
    JSZip.utils.checkSupport(outputType);
    var inputType = JSZip.utils.getTypeOf(input);
    var result = transform[inputType][outputType](input);
    return result;
  };

  /**
   * Return the type of the input.
   * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
   * @param {Object} input the input to identify.
   * @return {String} the (lowercase) type of the input.
   */
  JSZip.utils.getTypeOf = function (input) {
    if (typeof input === 'string') {
      return 'string';
    }
    if (Object.prototype.toString.call(input) === '[object Array]') {
      return 'array';
    }
    if (JSZip.support.nodebuffer && Buffer.isBuffer(input)) {
      return 'nodebuffer';
    }
    if (JSZip.support.uint8array && input instanceof Uint8Array) {
      return 'uint8array';
    }
    if (JSZip.support.arraybuffer && input instanceof ArrayBuffer) {
      return 'arraybuffer';
    }
  };

  /**
   * Cross-window, cross-Node-context regular expression detection
   * @param  {Object}  object Anything
   * @return {Boolean}        true if the object is a regular expression,
   * false otherwise
   */
  JSZip.utils.isRegExp = function (object) {
    return Object.prototype.toString.call(object) === '[object RegExp]';
  };

  /**
   * Throw an exception if the type is not supported.
   * @param {String} type the type to check.
   * @throws {Error} an Error if the browser doesn't support the requested type.
   */
  JSZip.utils.checkSupport = function (type) {
    var supported = true;
    switch (type.toLowerCase()) {
      case 'uint8array':
        supported = JSZip.support.uint8array;
        break;
      case 'arraybuffer':
        supported = JSZip.support.arraybuffer;
        break;
      case 'nodebuffer':
        supported = JSZip.support.nodebuffer;
        break;
      case 'blob':
        supported = JSZip.support.blob;
        break;
    }
    if (!supported) {
      throw new Error(type + ' is not supported by this browser');
    }
  };
})();

(function () {
  /**
   * Represents an entry in the zip.
   * The content may or may not be compressed.
   * @constructor
   */
  JSZip.CompressedObject = function () {
    this.compressedSize = 0;
    this.uncompressedSize = 0;
    this.crc32 = 0;
    this.compressionMethod = null;
    this.compressedContent = null;
  };

  JSZip.CompressedObject.prototype = {
    /**
     * Return the decompressed content in an unspecified format.
     * The format will depend on the decompressor.
     * @return {Object} the decompressed content.
     */
    getContent: function () {
      return null; // see implementation
    },
    /**
     * Return the compressed content in an unspecified format.
     * The format will depend on the compressed conten source.
     * @return {Object} the compressed content.
     */
    getCompressedContent: function () {
      return null; // see implementation
    },
  };
})();

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 *  Hacked so that it doesn't utf8 en/decode everything
 **/
JSZip.base64 = (function () {
  // private property
  var _keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return {
    // public method for encoding
    encode: function (input, utf8) {
      var output = '';
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output =
          output +
          _keyStr.charAt(enc1) +
          _keyStr.charAt(enc2) +
          _keyStr.charAt(enc3) +
          _keyStr.charAt(enc4);
      }

      return output;
    },

    // public method for decoding
    decode: function (input, utf8) {
      var output = '';
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }

      return output;
    },
  };
})();

// enforcing Stuk's coding style
// vim: set shiftwidth=3 softtabstop=3:
