var utils = {
  distance: function(p0, p1) {
		var dx = p1.x - p0.x,
			  dy = p1.y - p0.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
  circleCollision: function(c0, c1) {
		return utils.distance(c0, c1) <= c0.radius + c1.radius;
	}
};

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    interval = 1000/60,
    now,
    then = Date.now(),
    delta,
    gravity = 0,
    friction = 1,
    c = 0,
    keys = [],
    player = {},
    circles = [];

function Player(x, y) {
  this.width = 18;
  this.height = 24;
  this.color = '#000000';

  this.x = x;
  this.y = y + this.height;
  this.velX = 0;
  this.speed = 6;
  this.friction = 1;

  this.handleKeys = function() {

    // Move Right
    if(keys[39]) {
      if(this.velX < this.speed) {
        this.velX += this.speed;
      }
    }

    // Move Left
    if(keys[37]) {
      if(this.velX > -this.speed) {
        this.velX -= this.speed;
      }
    }

  }

  this.update = function() {
    this.handleKeys();

    this.velX *= this.friction;
    this.x += this.velX;

    if(this.x > canvas.width - this.width) {
      this.color = 'red';
      this.x = -this.width;
    } else if(this.x < -this.width) {
      this.x = canvas.width;
    }

    this.draw();
  }

  this.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
  }
}

function Circle(id, x, y, velX, velY, color, radius, flag) {
  var randNum = Math.random();
  this.id = id;
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.originalColor = color;
  this.color = color;
  this.radius = (flag <= 4) ? radius * 0.35 : radius + 5;

  this.update = function() {

    // Bounce off ceiling and floor
    if(this.y + this.radius + this.velY > canvas.height || this.y - this.radius + this.velY <= 0) {
      this.velY = -this.velY * friction;
    } else {
      this.velY += gravity;
    }

    // Bounce off walls
    if(this.x + this.radius + this.velX > canvas.width || this.x - this.radius + this.velX <= 0) {
      this.velX = -this.velX * friction;
    }

    this.hitTest();

    this.x += this.velX;
    this.y += this.velY;

    this.draw();
  }

  this.hitTest = function() {
    for(var i=0; i < circles.length; i++) {
      var otherCircle = circles[i];

      if(otherCircle.id !== this.id) {
        if(utils.circleCollision(this, otherCircle)) {
          // console.log("collision");
        }
      }
    }
  }
  this.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
  }
  this.draw = function() {
    ctx.beginPath();
    if (flag > 4) ctx.strokeStyle = '#010101';
    ctx.lineWidth = 1;
    ctx.fillStyle = this.color;
    console.log(flag)
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    if (flag <= 4) ctx.fill();
    if (flag > 4) ctx.stroke();
    ctx.closePath();
  }
}

function animate() {
  requestAnimationFrame(animate);
  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    player.update();

    // Draw Circles
    for(var i=0; i < circles.length; i++) {
      circles[i].update();
    }

  }
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Capture Events
  addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
  });

  addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
  });

  player = new Player(100, canvas.height);
  console.log(player);

  var numCircles = 5,
      clearCircles = 10,
      colors = [
        '#81e2d8',
        '#96e8df',
        '#b6ebe5'
      ],
      v = 0;

  for(var i=0; i < (numCircles + clearCircles); i++) {

    var velMax = 3,
        velMin = 1,
        randRadius = Math.floor(Math.random() * 17) + 5,
        randX = Math.random() * (canvas.width - randRadius * 2) + randRadius,
        randY = Math.random() * (canvas.height - randRadius * 2) + randRadius,
        randVelY = Math.ceil(Math.random() * velMax) + velMin,
        randVelX = Math.ceil(Math.random() * velMax) + velMin,
        randColor = colors[Math.floor(Math.random() * colors.length)];

    /*if (i <= 4) {
      randRadius = Math.floor(Math.random() * 5) + 1;
    }*/
    // Make sure this new circle doesn't overlap an existing one (don't add to the cicles array if so, which will cause the generation loop to run again until the required number of circles have been created)
    for(var j=0; j < circles.length; j++) {
      if(utils.circleCollision({ x: randX, y: randY, radius: randRadius }, circles[j])) {
        randX = Math.random() * (canvas.width - randRadius * 2) + randRadius;
        randY = Math.random() * (canvas.height - randRadius * 2) + randRadius;
        j = -1;
      }
    }
    circles.push(new Circle(circles.length, randX, randY, randVelX, randVelY, randColor, randRadius, v));
    v++;
  }

  animate();
}

init();
