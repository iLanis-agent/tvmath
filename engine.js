/* TVMath engine - honest TV size picker. Viewing-angle geometry + resolution distances. Pure logic, no DOM. */
(function (root) {
  'use strict';

  var IN = 0.0254; /* inches to meters */
  /* 16:9 screen: width = diag * cos(atan(9/16)), height = diag * sin(atan(9/16)) */
  var W_RATIO = 0.8716, H_RATIO = 0.4903;

  /* SMPTE 30 deg = cinematic minimum, THX 40 deg = full cinema feel.
     distance = (width/2) / tan(fov/2)  ->  30 deg: dist ~ 1.627 x width... using width directly:
     dist(m) = widthM / (2 * tan(fov/2)) */
  function distForFov(diagIn, fovDeg) {
    var wM = diagIn * IN * W_RATIO;
    return wM / (2 * Math.tan(fovDeg * Math.PI / 360));
  }
  function diagForDist(distM, fovDeg) {
    var wM = distM * 2 * Math.tan(fovDeg * Math.PI / 360);
    return wM / (W_RATIO * IN);
  }
  function fovFor(diagIn, distM) {
    var wM = diagIn * IN * W_RATIO;
    return 2 * Math.atan(wM / (2 * distM)) * 180 / Math.PI;
  }

  /* Lechner-style resolution benefit distances: sit closer than these to actually see the detail. */
  var RES = {
    '1080p': { label: '1080p', benefitX: 1.6 },
    '4k':    { label: '4K', benefitX: 1.0 },
    '8k':    { label: '8K', benefitX: 0.7 }
  };

  var FOV_BANDS = [
    { max: 20, label: 'postage stamp' },
    { max: 26, label: 'small for the room' },
    { max: 30, label: 'decent' },
    { max: 40, label: 'cinematic' },
    { max: 45, label: 'front row' },
    { max: Infinity, label: 'IMAX headache' }
  ];

  function bandFor(v, bands) {
    for (var i = 0; i < bands.length; i++) if (v < bands[i].max) return bands[i].label;
    return bands[bands.length - 1].label;
  }

  function num(x, name, min, max) {
    var v = Number(x);
    if (!isFinite(v) || v < min || v > max) throw new Error(name + ' must be between ' + min + ' and ' + max);
    return v;
  }

  function analyze(input) {
    if (!input || typeof input !== 'object') throw new Error('No input');
    var distM = num(input.distanceM, 'Couch distance', 1, 10);
    var diagIn = num(input.diagonalIn, 'TV size', 24, 120);
    var resKey = String(input.resolution || '4k');
    if (!RES[resKey]) throw new Error('Pick a resolution');

    var fov = Math.round(fovFor(diagIn, distM) * 10) / 10;
    var band = bandFor(fov, FOV_BANDS);

    var rec30 = diagForDist(distM, 30);
    var rec40 = diagForDist(distM, 40);
    /* round to common sizes */
    var sizes = [43, 50, 55, 65, 75, 85, 98];
    function nearest(target) {
      for (var i = 0; i < sizes.length; i++) {
        if (sizes[i] >= target) return sizes[i];
      }
      return sizes[sizes.length - 1];
    }
    var recMin = nearest(rec30); /* smallest common size hitting 30 deg */
    var recMax = nearest(rec40); /* smallest common size hitting 40 deg */

    var res = RES[resKey];
    var benefitDist = Math.round(res.benefitX * diagIn * IN * 100) / 100;
    var resVerdict;
    if (distM <= res.benefitX * diagIn * IN) {
      resVerdict = 'close enough to see every ' + res.label + ' pixel';
    } else {
      resVerdict = 'too far to see the full ' + res.label + ' detail - a cheaper panel would look the same from here';
    }

    var verdict = 'A ' + diagIn + '" TV at ' + distM + ' m fills ' + fov + ' deg of your view - "' + band + '". ' +
      'For your couch, ' + recMin + '" hits the 30 deg cinematic minimum and ' + recMax + '" the 40 deg THX feel. ' +
      'At ' + distM + ' m you are ' + resVerdict + ' (full detail needs ' + benefitDist + ' m or closer).';

    return {
      fov: fov,
      band: band,
      widthM: Math.round(diagIn * IN * W_RATIO * 100) / 100,
      heightM: Math.round(diagIn * IN * H_RATIO * 100) / 100,
      recMin: recMin,
      recMax: recMax,
      rec30In: Math.round(rec30),
      rec40In: Math.round(rec40),
      resolution: res.label,
      benefitDist: benefitDist,
      resVerdict: resVerdict,
      verdict: verdict
    };
  }

  var api = { analyze: analyze, fovFor: fovFor, diagForDist: diagForDist, distForFov: distForFov, RES: RES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TVMathEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
