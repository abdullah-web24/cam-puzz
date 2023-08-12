const bezHelper = (() => {
  // creates a 2D point
  const P2 = (x = 0, y = x === 0 ? 0 : x.y + ((x = x.x), 0)) => ({ x, y });
  const setP2As = (p, pFrom) => ((p.x = pFrom.x), (p.y = pFrom.y), p);
  // To prevent heap thrashing close over some pre defined 2D points
  const v1 = P2();
  const v2 = P2();
  const v3 = P2();
  const v4 = P2();
  var u, u1, u2;

  // solves quadratic for bezier 2 returns first root
  function solveBezier2(A, B, C) {
    // solve the 2nd order bezier equation.
    // There can be 2 roots, u,u1 hold the results;
    // 2nd order function a+2(-a+b)x+(a-2b+c)x^2
    a = A - 2 * B + C;
    b = 2 * (-A + B);
    c = A;
    a1 = 2 * a;
    c = b * b - 4 * a * c;
    if (c < 0) {
      u = Infinity;
      u1 = Infinity;
      return u;
    } else {
      b1 = Math.sqrt(c);
    }
    u = (-b + b1) / a1;
    u1 = (-b - b1) / a1;
    return u;
  }
  // solves cubic for bezier 3 returns first root
  function solveBezier3(A, B, C, D) {
    // There can be 3 roots, u,u1,u2 hold the results;
    // Solves 3rd order a+(-2a+3b)t+(2a-6b+3c)t^2+(-a+3b-3c+d)t^3 Cardano method for finding roots
    // this function was derived from http://pomax.github.io/bezierinfo/#intersections cube root solver
    // Also see https://en.wikipedia.org/wiki/Cubic_function#Cardano.27s_method

    function crt(v) {
      if (v < 0) return -Math.pow(-v, 1 / 3);
      return Math.pow(v, 1 / 3);
    }
    function sqrt(v) {
      if (v < 0) return -Math.sqrt(-v);
      return Math.sqrt(v);
    }
    var a,
      b,
      c,
      d,
      p,
      p3,
      q,
      q2,
      discriminant,
      U,
      v1,
      r,
      t,
      mp3,
      cosphi,
      phi,
      t1,
      sd;
    u2 = u1 = u = -Infinity;
    d = -A + 3 * B - 3 * C + D;
    a = (3 * A - 6 * B + 3 * C) / d;
    b = (-3 * A + 3 * B) / d;
    c = A / d;
    p = (3 * b - a * a) / 3;
    p3 = p / 3;
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
    q2 = q / 2;
    a /= 3;
    discriminant = q2 * q2 + p3 * p3 * p3;
    if (discriminant < 0) {
      mp3 = -p / 3;
      r = sqrt(mp3 * mp3 * mp3);
      t = -q / (2 * r);
      cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
      phi = Math.acos(cosphi);
      t1 = 2 * crt(r);
      u = t1 * Math.cos(phi / 3) - a;
      u1 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - a;
      u2 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - a;
      return u;
    }
    if (discriminant === 0) {
      U = q2 < 0 ? crt(-q2) : -crt(q2);
      u = 2 * U - a;
      u1 = -U - a;
      return u;
    }
    sd = sqrt(discriminant);
    u = crt(sd - q2) - crt(sd + q2) - a;
    return u;
  }

  // get a point on the bezier at pos ( from 0 to 1 values outside this range will be outside the bezier)
  // p1, p2 are end points and cp1, cp2 are control points.
  // ret is the resulting point. If given it is set to the result, if not given a new point is created
  function getPositionOnBez(pos, p1, p2, cp1, cp2, ret = P2()) {
    if (pos === 0) {
      ret.x = p1.x;
      ret.y = p1.y;
      return ret;
    } else if (pos === 1) {
      ret.x = p2.x;
      ret.y = p2.y;
      return ret;
    }
    v1.x = p1.x;
    v1.y = p1.y;
    var c = pos;
    if (cp2 === undefined) {
      v2.x = cp1.x;
      v2.y = cp1.y;
      v1.x += (v2.x - v1.x) * c;
      v1.y += (v2.y - v1.y) * c;
      v2.x += (p2.x - v2.x) * c;
      v2.y += (p2.y - v2.y) * c;
      ret.x = v1.x + (v2.x - v1.x) * c;
      ret.y = v1.y + (v2.y - v1.y) * c;
      return ret;
    }
    v2.x = cp1.x;
    v2.y = cp1.y;
    v3.x = cp2.x;
    v3.y = cp2.y;
    v1.x += (v2.x - v1.x) * c;
    v1.y += (v2.y - v1.y) * c;
    v2.x += (v3.x - v2.x) * c;
    v2.y += (v3.y - v2.y) * c;
    v3.x += (p2.x - v3.x) * c;
    v3.y += (p2.y - v3.y) * c;
    v1.x += (v2.x - v1.x) * c;
    v1.y += (v2.y - v1.y) * c;
    v2.x += (v3.x - v2.x) * c;
    v2.y += (v3.y - v2.y) * c;
    ret.x = v1.x + (v2.x - v1.x) * c;
    ret.y = v1.y + (v2.y - v1.y) * c;
    return ret;
  }
  const cubicBez = 0;
  const quadraticBez = 1;
  const none = 2;
  var type = none;

  // working bezier
  const p1 = P2();
  const p2 = P2();
  const cp1 = P2();
  const cp2 = P2();
  // rotated bezier
  const rp1 = P2();
  const rp2 = P2();
  const rcp1 = P2();
  const rcp2 = P2();
  // translate and rotate bezier
  function transformBez(pos, rot) {
    const ax = Math.cos(rot);
    const ay = Math.sin(rot);
    var x = p1.x - pos.x;
    var y = p1.y - pos.y;
    rp1.x = x * ax - y * ay;
    rp1.y = x * ay + y * ax;
    x = p2.x - pos.x;
    y = p2.y - pos.y;
    rp2.x = x * ax - y * ay;
    rp2.y = x * ay + y * ax;
    x = cp1.x - pos.x;
    y = cp1.y - pos.y;
    rcp1.x = x * ax - y * ay;
    rcp1.y = x * ay + y * ax;
    if (type === cubicBez) {
      x = cp2.x - pos.x;
      y = cp2.y - pos.y;
      rcp2.x = x * ax - y * ay;
      rcp2.y = x * ay + y * ax;
    }
  }
  function getPosition2(pos, ret) {
    return getPositionOnBez(pos, p1, p2, cp1, undefined, ret);
  }
  function getPosition3(pos, ret) {
    return getPositionOnBez(pos, p1, p2, cp1, cp2, ret);
  }
  const API = {
    getPosOnQBez(pos, p1, cp1, p2, ret) {
      return getPositionOnBez(pos, p1, p2, cp1, undefined, ret);
    },
    getPosOnCBez(pos, p1, cp1, cp2, p2, ret) {
      return getPositionOnBez(pos, p1, p2, cp1, cp2, ret);
    },
    set bezQ(points) {
      setP2As(p1, points[0]);
      setP2As(cp1, points[1]);
      setP2As(p2, points[2]);
      type = quadraticBez;
    },
    set bezC(points) {
      setP2As(p1, points[0]);
      setP2As(cp1, points[1]);
      setP2As(cp2, points[2]);
      setP2As(p2, points[3]);
      type = cubicBez;
    },
    isInside(center, testPoint, pointRadius) {
      drawLine(testPoint, center);
      v1.x = testPoint.x - center.x;
      v1.y = testPoint.y - center.y;
      const pointDist = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const dir = -Math.atan2(v1.y, v1.x);
      transformBez(center, dir);
      if (type === cubicBez) {
        solveBezier3(rp1.y, rcp1.y, rcp2.y, rp2.y);
        if (u < 0 || u > 1) {
          u = u1;
        }
        if (u < 0 || u > 1) {
          u = u2;
        }
        if (u < 0 || u > 1) {
          return;
        }
        getPosition3(u, v4);
      } else {
        solveBezier2(rp1.y, rcp1.y, rp2.y);
        if (u < 0 || u > 1) {
          u = u1;
        }
        if (u < 0 || u > 1) {
          return;
        }
        getPosition2(u, v4);
      }
      drawCircle(v4);
      const dist = Math.sqrt((v4.x - center.x) ** 2 + (v4.y - center.y) ** 2);
      const dist1 = Math.sqrt(
        (v4.x - testPoint.x) ** 2 + (v4.y - testPoint.y) ** 2
      );
      return dist1 < dist && dist > pointDist - pointRadius;
    },
  };

  return API;
})();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const m = { x: 0, y: 0 };
document.addEventListener("mousemove", (e) => {
  var b = canvas.getBoundingClientRect();
  m.x = e.pageX - b.left - scrollX - 2;
  m.y = e.pageY - b.top - scrollY - 2;
});
function drawCircle(p, r = 5, col = "black") {
  ctx.beginPath();
  ctx.strokeStyle = col;
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
}
function drawLine(p1, p2, r = 5, col = "black") {
  ctx.beginPath();
  ctx.strokeStyle = col;
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

const w = 400;
const h = 400;
const diag = Math.sqrt(w * w + h * h);
// creates a 2D point
const P2 = (x = 0, y = x === 0 ? 0 : x.y + ((x = x.x), 0)) => ({ x, y });
const setP2As = (p, pFrom) => ((p.x = pFrom.x), (p.y = pFrom.y), p);
// random int and double
const randI = (min, max = min + (min = 0)) =>
  (Math.random() * (max - min) + min) | 0;
const rand = (min = 1, max = min + (min = 0)) =>
  Math.random() * (max - min) + min;

const theBlobSet = [];
const theBlob = [];
function createCubicBlob(segs) {
  const step = Math.PI / segs;
  for (var i = 0; i < Math.PI * 2; i += step) {
    const dist = rand(diag * (1 / 6), diag * (1 / 5));
    const ang = i + rand(-step * 0.2, step * 0.2);

    const p = P2(w / 2 + Math.cos(ang) * dist, h / 2 + Math.sin(ang) * dist);
    theBlobSet.push(p);
    theBlob.push(P2(p));
  }
  theBlobSet[theBlobSet.length - 1] = theBlobSet[0];
  theBlob[theBlobSet.length - 1] = theBlob[0];
}
createCubicBlob(8);
function animateTheBlob(time) {
  for (var i = 0; i < theBlobSet.length - 1; i++) {
    const ang = Math.sin(time + i) * 6;
    theBlob[i].x = theBlobSet[i].x + Math.cos(ang) * diag * 0.04;
    theBlob[i].y = theBlobSet[i].y + Math.sin(ang) * diag * 0.04;
  }
}

function drawTheBlob() {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  var i = 0;
  ctx.moveTo(theBlob[i].x, theBlob[i++].y);
  while (i < theBlob.length) {
    ctx.bezierCurveTo(
      theBlob[i].x,
      theBlob[i++].y,
      theBlob[i].x,
      theBlob[i++].y,
      theBlob[i].x,
      theBlob[i++].y
    );
  }
  ctx.stroke();
}
var center = P2(w / 2, h / 2);
function testBlob() {
  var i = 0;
  while (i < theBlob.length - 3) {
    bezHelper.bezC = [theBlob[i++], theBlob[i++], theBlob[i++], theBlob[i]];
    if (bezHelper.isInside(center, m, 6)) {
      return true;
    }
  }
  return false;
}

// main update function
function update(timer) {
  ctx.clearRect(0, 0, w, h);
  animateTheBlob(timer / 1000);
  drawTheBlob();

  if (testBlob()) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "black";
  }
  ctx.beginPath();
  ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
  ctx.stroke();
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
