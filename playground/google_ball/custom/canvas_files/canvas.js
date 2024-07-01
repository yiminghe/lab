$(function () {
  var canvas = $('#c');
  var canvasHeight;
  var canvasWidth;
  var canvasOffset = canvas.offset();
  var canvasY = canvasOffset.top;
  var canvasX = canvasOffset.left;
  var curleft = (curtop = 0);
  var ctx;
  var goNuts = 'noooooo'; // Call it author's discretion
  var dt = 0.1;
  var myPoints = [];

  var pointCollection;

  function init(p) {
    gLength = p.length;

    // using a different method of calculating offsets, hence why lots of code went missing here :)

    pointCollection = new PointCollection();
    pointCollection.points = p;

    // Again slightly modified to simply draw initially with our single point
    draw();
  }

  function toggleEventListeners() {
    // This is the _worst_ toggle ever, but it's close to the end of my lunch time so v0v
    // I also shouldn't be changing the button here but see above, sloppy I know
    if (goNuts == 'noooooo') {
      $(window).bind('mousemove', onMove); // Go nuts you crazy balls!
      goNuts = 'goooooo';
      $('[name=btn]').val('Stop!');
    } else {
      $(window).unbind(); // STOP!
      goNuts = 'noooooo';
      $('[name=btn]').val('Start!');
      init(myPoints);
    }
  }

  function updateCanvasDimensions() {
    canvas.attr({
      height: $(window).height() * 0.8,
      width: $(window).width() * 0.8,
    });
    canvasWidth = canvas.width();
    canvasHeight = canvas.height();

    draw();
  }

  function onMove(e) {
    if (pointCollection)
      pointCollection.mousePos.set(e.pageX - canvasX, e.pageY - canvasY); // using offsets of the canvas allows for accurate movement in flexible canvas sizes
  }

  function timeout() {
    draw();
    update();

    setTimeout(function () {
      timeout();
    }, 30);
  }

  function draw() {
    var tmpCanvas = canvas.get(0);

    if (tmpCanvas.getContext == null) {
      return;
    }

    ctx = tmpCanvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (pointCollection) pointCollection.draw();
  }

  function update() {
    if (pointCollection) pointCollection.update();
  }

  function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.addX = function (x) {
      this.x += x;
    };

    this.addY = function (y) {
      this.y += y;
    };

    this.addZ = function (z) {
      this.z += z;
    };

    this.set = function (x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    };
  }

  function PointCollection() {
    this.mousePos = new Vector(0, 0);
    this.points = new Array();

    this.newPoint = function (x, y, z) {
      var point = new Point(x, y, z);
      this.points.push(point);
      return point;
    };

    this.update = function () {
      var pointsLength = this.points.length;

      for (var i = 0; i < pointsLength; i++) {
        var point = this.points[i];

        if (point == null) continue;

        var dx = this.mousePos.x - point.curPos.x;
        var dy = this.mousePos.y - point.curPos.y;
        var dd = dx * dx + dy * dy;
        var d = Math.sqrt(dd);

        if (d < 150) {
          point.targetPos.x =
            this.mousePos.x < point.curPos.x
              ? point.curPos.x - dx
              : point.curPos.x - dx;
          point.targetPos.y =
            this.mousePos.y < point.curPos.y
              ? point.curPos.y - dy
              : point.curPos.y - dy;
        } else {
          point.targetPos.x = point.originalPos.x;
          point.targetPos.y = point.originalPos.y;
        }

        point.update();
      }
    };

    this.draw = function () {
      var pointsLength = this.points.length;
      for (var i = 0; i < pointsLength; i++) {
        var point = this.points[i];

        if (point == null) continue;

        point.draw();
      }
    };
  }

  function Point(x, y, z, size, colour) {
    this.colour = colour;
    this.curPos = new Vector(x, y, z);
    this.friction = 0.8;
    this.originalPos = new Vector(x, y, z);
    this.radius = size;
    this.size = size;
    this.springStrength = 0.1;
    this.targetPos = new Vector(x, y, z);
    this.velocity = new Vector(0.0, 0.0, 0.0);

    this.update = function () {
      var dx = this.targetPos.x - this.curPos.x;
      var ax = dx * this.springStrength;
      this.velocity.x += ax;
      this.velocity.x *= this.friction;
      this.curPos.x += this.velocity.x;

      var dy = this.targetPos.y - this.curPos.y;
      var ay = dy * this.springStrength;
      this.velocity.y += ay;
      this.velocity.y *= this.friction;
      this.curPos.y += this.velocity.y;

      var dox = this.originalPos.x - this.curPos.x;
      var doy = this.originalPos.y - this.curPos.y;
      var dd = dox * dox + doy * doy;
      var d = Math.sqrt(dd);

      this.targetPos.z = d / 100 + 1;
      var dz = this.targetPos.z - this.curPos.z;
      var az = dz * this.springStrength;
      this.velocity.z += az;
      this.velocity.z *= this.friction;
      this.curPos.z += this.velocity.z;

      this.radius = this.size * this.curPos.z;
      if (this.radius < 1) this.radius = 1;
    };

    this.draw = function () {
      ctx.fillStyle = this.colour;
      ctx.beginPath();
      ctx.arc(this.curPos.x, this.curPos.y, this.radius, 0, Math.PI * 2, true);
      ctx.fill();
    };
  }

  // With a different initial state, we do things a little bit differently
  updateCanvasDimensions();
  init(myPoints);
  $(window).bind('resize', updateCanvasDimensions);

  // Event to trigger point creation
  $('#c').click(function (e) {
    var x = e.pageX - canvasX; // use offsets of the canvas object relative to the page
    var y = e.pageY - canvasY;
    myPoints.push(
      new Point(x, y, 0.0, $('[name=size]').val(), $('[name=color]').val()),
    );
    init(myPoints);
  });

  // The button will trigger ball happiness or cease ball happiness :(
  $('[name=btn]').click(function () {
    toggleEventListeners();
    timeout();
  });
});
