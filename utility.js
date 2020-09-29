function standardize_color(str) {
	const canvas = document.getElementById("graph");
	const ctx = canvas.getContext("2d");
	ctx.save();
	ctx.fillStyle = str;
	var color = ctx.fillStyle;
	ctx.restore();
	return color;
}

function getTextWidth(font, txt) {
	const canvas = document.getElementById("graph");
	const ctx = canvas.getContext("2d");
	ctx.save();
	ctx.font = font;
	var result = ctx.measureText(txt).width;
	ctx.restore();
	return result;
}

function addLight(color, amount) {
  let cc = parseInt(color,16) + amount;
  let c = (cc > 255) ? 255 : (cc);
  c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
  return c;
}

function lighten(color, amount) {
	color = standardize_color(color);
	amount = amount || 50;
	color = (color.indexOf("#") >= 0) ? color.substring(1, color.length) : color;
	amount = parseInt((255*amount)/100);
	return color = `#${addLight(color.substring(0,2), amount)}${addLight(color.substring(2,4), amount)}${addLight(color.substring(4,6), amount)}`;
}

