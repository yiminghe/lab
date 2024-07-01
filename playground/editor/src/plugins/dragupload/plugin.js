KISSY.Editor.add(
  'dragupload',
  function (editor) {
    var S = KISSY,
      KE = S.Editor,
      Node = S.Node,
      Event = S.Event,
      UA = S.UA,
      cfg = editor.cfg.pluginConfig['dragupload'] || {},
      fileInput = cfg.fileInput || 'Filedata',
      sizeLimit = cfg.sizeLimit || Number.MAX_VALUE,
      serverParams = cfg.serverParams || {},
      serverUrl = cfg.serverUrl || '',
      surfix = cfg.surfix || 'png,jpg,jpeg,gif',
      surfix_reg = new RegExp(surfix.split(/,/).join('|') + '$', 'i'),
      document = editor.document;

    var inserted = {},
      startMonitor = false;

    function nodeInsert(ev) {
      var oe = ev.originalEvent;
      var t = oe.target;
      if (S.DOM._4e_name(t) == 'img' && t.src.match(/^file:\/\//)) {
        inserted[t.src] = t;
      }
    }

    Event.on(document, 'dragenter', function (ev) {
      //firefox 会插入伪数据
      if (!startMonitor) {
        Event.on(document, 'DOMNodeInserted', nodeInsert);
        startMonitor = true;
      }
    });
    Event.on(document, 'dragenter dragover', function (ev) {
      ev.halt();
      ev = ev.originalEvent;
      var dt = ev.dataTransfer;
    });
    Event.on(document, 'drop', function (ev) {
      Event.remove(document, 'DOMNodeInserted', nodeInsert);
      startMonitor = false;
      ev.halt();
      ev = ev.originalEvent;
      S.log(ev);
      var archor, ap;
      /**
       * firefox 会自动添加节点
       */
      if (!S.isEmptyObject(inserted)) {
        S.each(inserted, function (el) {
          if (S.DOM._4e_name(el) == 'img') {
            archor = el.nextSibling;
            ap = el.parentNode;
            S.DOM._4e_remove(el);
          }
        });
        inserted = {};
      } else {
        //空行里拖放肯定没问题，其他在文字中间可能不准确
        ap = document.elementFromPoint(ev.clientX, ev.clientY);
        archor = ap.lastChild;
      }

      var dt = ev.dataTransfer;
      dt.dropEffect = 'copy';
      var files = dt.files;
      if (!files) return;
      for (var i = 0; i < files.length; i++) {
        var file = files[i],
          name = file.name,
          size = file.size;
        if (!name.match(surfix_reg)) {
          continue;
        }
        if (size / 1000 > sizeLimit) {
          continue;
        }
        var img = new Node(
          '<img ' +
            "src='" +
            (KE.Config.base + '../theme/loading.gif') +
            "'" +
            '/>',
        );
        ap.insertBefore(img[0], archor);

        fileUpload(file, img);
      }
    });

    if (window['XMLHttpRequest'] && !XMLHttpRequest.prototype.sendAsBinary) {
      XMLHttpRequest.prototype.sendAsBinary = function (datastr, contentType) {
        var bb = new BlobBuilder();
        var len = datastr.length;
        var data = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          data[i] = datastr.charCodeAt(i);
        }
        bb.append(data.buffer);
        this.send(bb.getBlob(contentType));
      };
    }

    /**
     *
     * @param img loading 占位图片
     * @param file 真实数据
     */
    function fileUpload(file, img) {
      var reader = new FileReader();
      //chrome 不支持 addEventListener("load")
      reader.onload = function (ev) {
        // Please report improvements to: marco.buratto at tiscali.it
        var fileName = file.name,
          fileData = ev.target.result,
          boundary = '----kissy-editor-2.1',
          xhr = new XMLHttpRequest();

        xhr.open('POST', serverUrl, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 304) {
              if (xhr.responseText != '') {
                var info = S.JSON.parse(xhr.responseText);
                img[0].src = info.imgUrl;
              }
            } else {
              alert('服务器端出错！');
              img._4e_remove();
              S.log(xhr);
            }

            xhr.onreadystatechange = null;
          }
        };

        var body = '\r\n--' + boundary + '\r\n';
        body +=
          'Content-Disposition: form-data; name="' +
          fileInput +
          '"; filename="' +
          encodeURIComponent(fileName) +
          '"\r\n';
        body +=
          'Content-Type: ' +
          (file.type || 'application/octet-stream') +
          '\r\n\r\n';
        body += fileData + '\r\n';

        serverParams = KE.Utils.normParams(serverParams);
        for (var p in serverParams) {
          if (serverParams.hasOwnProperty(p)) {
            body += '--' + boundary + '\r\n';
            body += 'Content-Disposition: form-data; name="' + p + '"\r\n\r\n';
            body += serverParams[p] + '\r\n';
          }
        }
        body += '--' + boundary + '--';

        xhr.setRequestHeader(
          'Content-Type',
          'multipart/form-data, boundary=' + boundary,
        ); // simulate a file MIME POST request.
        /*xhr.setRequestHeader("Content-Length", body.length);
         */
        xhr.sendAsBinary(
          'Content-Type: multipart/form-data; boundary=' +
            boundary +
            '\r\nContent-Length: ' +
            body.length +
            '\r\n' +
            body +
            '\r\n',
        );
        reader.onload = null;
      };
      reader.readAsBinaryString(file);
    }
  },
  {
    attach: false,
  },
);
