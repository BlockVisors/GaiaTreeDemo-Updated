"use strict";

(function(){
    var root = this;
    var prev_gaiatreeidparser = root.gaiatreeidparser;
    var designs = ["655566666666.517566666666.511266666666.511126666666.581432266666.111114226666.111112222222.511126666666.511126666666.514136666666.673866666666.655566666666","777666777777.776411677777.766113277777.661181127777.611111127777.611111122222.631111127777.661111177777.761114177777.776511177777.776111677777.777686777777","666111166666.661171186666.611115126666.617111126666.661111322666.111111222222.151111122222.111311122266.611117112666.611111126666.641811266666.661141166666","777888877777.778115187777.785111187777.781111387777.881111187777.841161122222.811314182222.811111128777.819111188777.811113187777.781511187777.778888877777","778888887777.781131188777.784111198777.811111187777.841161187222.811113182222.819111182227.811111158777.811115187777.781311187777.778111987777.777888887777","666677776666.666711117666.677111157666.671112117666.711811217666.713111522222.781111122222.711141217666.711118117666.675131117666.667111147666.666777777666"]
    function RGBToHSL(r, g, b) {
	if (Array.isArray(r)) {
	    g = r[1];
	    b = r[2];
	    r = r[0];
	}
	var r = r / 255;
	var g = g / 255;
	var b = b / 255;
	var cMax = Math.max(r, g, b);
	var cMin = Math.min(r, g, b);
	var delta = cMax - cMin;
	if (delta == 0) {
	    var h = 0;
	} else if (cMax == r) {
	    var h = 60 * (((g - b) / delta) % 6);
	} else if (cMax == g) {
	    var h = 60 * ((b - r) / delta + 2);
	} else if (cMax == b) {
	    var h = 60 * ((r - g) / delta + 4);
	}
	if (h < 0) {
	    h += 360;
	}
	var l = (cMax + cMin) / 2;

	if (delta == 0) {
	    var s = 0;
	} else {
	    var s = delta / (1 - Math.abs(2 * l - 1));
	}

	return [h, s, l]
    }

    function HSLToRGB(h, s, l) {
	if (Array.isArray(h)) {
	    s = h[1];
	    l = h[2];
	    h = h[0];
	}
	var c = (1 - Math.abs(2 * l - 1)) * s;
	var x = c * (1 - Math.abs((h / 60) % 2 - 1));
	var m = l - c / 2;
	if (h >= 0 && h < 60) {
	    var r = c,
		g = x,
		b = 0;
	} else if (h >= 60 && h < 120) {
	    var r = x,
		g = c,
		b = 0;
	} else if (h >= 120 && h < 180) {
	    var r = 0,
		g = c,
		b = x;
	} else if (h >= 180 && h < 240) {
	    var r = 0,
		g = x,
		b = c;
	} else if (h >= 240 && h < 300) {
	    var r = x,
		g = 0,
		b = c;
	} else if (h >= 300 && h < 360) {
	    var r = c,
		g = 0,
		b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);
	return [r, g, b];
    }

    function RGBToHex(arr) {
	var r = arr[0],
	    g = arr[1],
	    b = arr[2];
	return "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
    }

    function derivePalette(r, g, b, invert) {
	var hsl = RGBToHSL(r, g, b);

	var h = hsl[0];
	var s = hsl[1];
	var l = hsl[2];
	var hx = h % 360;
	var hy = (h + 320) % 360;

	var c1 = HSLToRGB(hx, 1, 0.1);
	if (invert) {
	    var c4 = HSLToRGB(hx, 1, 0.2);
	    var c5 = HSLToRGB(hx, 1, 0.45);
	    var c2 = HSLToRGB(hx, 1, 0.7);
	    var c3 = HSLToRGB(hy, 1, 0.8);
	} else {
	    var c2 = HSLToRGB(hx, 1, 0.2);
	    var c3 = HSLToRGB(hx, 1, 0.45);
	    var c4 = HSLToRGB(hx, 1, 0.7);
	    var c5 = HSLToRGB(hy, 1, 0.8);

	}

	return [
	    null,
	    RGBToHex(c1),
	    RGBToHex(c2),
	    RGBToHex(c3),
	    RGBToHex(c4),
	    RGBToHex(c5)
	];
    }

    function hexToBytes(hex){
	var result = []
	for(var i = 0; i < hex.length; i+=2){
	    result.push(parseInt(hex.slice(i, i+2),16));
	}
	return result;
    }

    var gaiatreeidparser = function (gaiatreeId){
	if(gaiatreeId.slice(0,2) == "0x"){
	    gaiatreeId = gaiatreeId.slice(2);
	}
	var bytes = hexToBytes(gaiatreeId);
	var genesis = bytes[0],
	    k = bytes[1],
	    r = bytes[2],
	    g = bytes[3],
	    b = bytes[4];

	var size = size || 10;
	var invert = k >= designs.length;
	k = k % designs.length;
	var design = designs[k].split(".");
	var colors;
	if(genesis){
	    if(k % 2 === 0 && invert || k % 2 === 1 && !invert){
		colors = [null, "#555555", "#d3d3d3", "#ffffff", "#aaaaaa", "#ff9999"];
	    }else{
		colors = [null, "#555555", "#222222", "#111111", "#bbbbbb", "#ff9999"];
	    }
	}else{
	    colors = derivePalette(r, g, b, invert);
	}

	return design.map(function(row){
	    return row.split("").map(function(cell){
		return colors[cell];
	    })
	})
    }

    gaiatreeidparser.noConflict = function(){
	root.gaiatreeidparser = prev_gaiatreeidparser;
	return gaiatreeidparser;
    }

    if( typeof exports !== 'undefined' ) {
	if( typeof module !== 'undefined' && module.exports ) {
	    exports = module.exports = gaiatreeidparser;
	}
	exports.gaiatreeidparser = gaiatreeidparser;
    } else {
	root.gaiatreeidparser = gaiatreeidparser;
    }
}).call(this);
