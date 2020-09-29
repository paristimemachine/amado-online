Table.prototype.toSVG = function() {
	var result = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + (this.width + 500) + '" height="' + (this.height + 300) + '">\n';

	result += '<g transform="translate(0 0)">\n';

	//draw title
	result += '<text style="fill:blue" x="' + this.width/2 + '" y="' + (this.margeHaut + this.titleHeight) + '" text-anchor="middle">' + this.title + '</text>';
	
	result += '\n';

	//draw table
	result += this.toSVG_Graph();
	
	//draw legends
	result += this.toSVG_Legends();
	
	//groups
	result += this.toSVG_Groups();

	//values
	if (this.bAffichageValeur)
		result += this.toSVG_Values();
	
	//draw tree
	if (this.rhc) {
		var rect = this.rect(0, this.nb_col-1);
		result +=  '<g transform="translate(' + (rect.left + rect.width + 10) + ' 0)">' + 
					this.rhc.toSVG() +
					'</g>\n';
					
		rect = this.rect(this.nb_row-1, 0);
		result +=  '<g transform="translate(0 ' + (rect.top + rect.height + 10) + ')">' + 
					this.chc.toSVG() +
					'</g>\n';
	}
	result += '<rect id="amado-marker" visibility="hidden" style="fill:red;stroke:red;stroke-width:1"/>\n';
	result += '<rect id="amado-selector" visibility="hidden" style="fill:transparent;stroke:black;stroke-width:2"/>\n';
	result += '<rect id="amado-mover" visibility="hidden" style="fill:transparent;stroke:red;stroke-width:2;stroke-dasharray:5,5"/>\n';
	
	result += '</g>\n';
	result += "</svg>";
	return result;
}

Table.prototype.toSVG_Graph = function() {
	var result = '';
	switch (this.mode) {
	case 1:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = 'background-color: #0ae;';

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				result += '<rect style="fill:' + 'white' + ';stroke:' + this.graphColor + '" ' +
									'x="' + rect.left + '" ' +
									'y="' + rect.top + '" ' +
									'width="' + (rect.width) + '" ' +
									'height="' + (rect.height) + '"/>\n';
									
			}
		}
		break;

	case 2:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = 'background-color: #0ae;';

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				result += '<rect style="fill:' + this.graphColor + ';stroke:' + this.graphColor + '" ' +
									'x="' + rect.left + '" ' +
									'y="' + rect.top + '" ' +
									'width="' + (rect.width) + '" ' +
									'height="' + (rect.height) + '"/>\n';
									
			}
		}
		break;
	case 3:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = 'background-color: #0ae;';

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				if (this.value(i, j) > mean) {
					result += '<rect style="fill:' + this.graphColor + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.height) + '"/>\n';
									
				} else
					result += '<rect style="fill:' + 'white' + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.height) + '"/>\n';
			}
		}
		break;

	
	case 4:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = 'background-color: #0ae;';

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				if (this.value(i, j) > mean) {
					result += '<rect style="fill:' + this.graphColor + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (this.topRect(i, j) - rect.top) + '"/>\n';

					result += '<rect style="fill:' + 'white' + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + this.topRect(i, j) + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.top + rect.height - this.topRect(i, j)) + '"/>\n';
									
				} else
					result += '<rect style="fill:' + 'white' + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.height) + '"/>\n';
			}
		}
		break;

	case 5:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = lighten(this.graphColor);

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				if (this.value(i, j) > mean) {
					result += '<rect style="fill:' + this.graphColor + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (this.topRect(i, j) - rect.top) + '"/>\n';

					result += '<rect style="fill:' + st + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + this.topRect(i, j) + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.top + rect.height - this.topRect(i, j)) + '"/>\n';
									
				} else
					result += '<rect style="fill:' + 'white' + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.height) + '"/>\n';
			}
		}
		break;
	
	case 6:
		for (var i = 0; i < this.nb_row; i++) {
			var mean = this.row_info[i].mean;
			var st = lighten(this.graphColor);

			for (var j = 0; j < this.nb_col; j++) {
				var rect = this.rect(i, j);
									
				if (this.value(i, j) > mean) {
					result += '<rect style="fill:' + this.graphColor + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (this.topRect(i, j) - rect.top) + '"/>\n';

					result += '<rect style="fill:' + st + ';stroke:' + this.graphColor + '" ' + 
										'x="' + rect.left + '" ' +
										'y="' + this.topRect(i, j) + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.top + rect.height - this.topRect(i, j)) + '"/>\n';
									
				} else
					result += '<rect style="fill:' + st + ';stroke:' + this.graphColor + '" ' +
										'x="' + rect.left + '" ' +
										'y="' + rect.top + '" ' +
										'width="' + (rect.width) + '" ' +
										'height="' + (rect.height) + '"/>\n';
			}
		}
		break;
	}
	return result;
}


Table.prototype.toSVG_Legends = function() {
	var result = '';	
	var rect;
	var x, y, w, h;
	var result = '';
	for (var i = 0; i < this.nb_row; i++) {
		var nl = this.rowTitle(i);
		nl = nl.substr(0, Math.min(this.nbCaLigne, nl.length));
	
		if (this.legendeLigneDroite) {
			rect = this.rect(i, this.nb_col - 1);
		
			if (this.col_sep.isAfter(this.nb_col - 1))      // cas d'un sepateur en derniere colonne
				x = rect.left + rect.width + this.largeurGColonne + this.intervalColonne;
			else
				x = rect.left + rect.width + this.intervalLigneLibel;
			y = rect.top + rect.height;
			w = this.largeurLegendLigne;
			h = 30;

			result += '<text style="font-size:' + this.rowLegendFontSize + 'px;fill:' + this.rowLegendColor + '" text-anchor="start" ' +
						'x="' + x + '" ' +
						'y="' + (y) + '">' +
						nl + '</text>';
		} else { //left side
			rect = this.rect(i, 0);
			
			x = rect.left - this.intervalLigneLibel - this.intervalColonne;
			if (this.col_sep.isBefore(0))      // cas d'un separateur en premiere colonne
				x -= (this.largeurGColonne + this.intervalColonne);
			
				
			y = rect.top + rect.height;
			w = this.largeurLegendLigne;
			h = 30;

			result += '<text style="font-size:' + this.rowLegendFontSize + 'px;fill:' + this.rowLegendColor + '" text-anchor="end" ' +
							'x="' + (x) + '" ' +
							'y="' + (y) + '" ' +
							'width="' + w + '" ' +
							'height="' + h + '">' +
							nl + '</text>';
		}
	}
	//column legend
	
	result += '\n';
	
	for (var j = 0; j < this.nb_col; j++) {
		var libelcolonne = this.columnTitle(j);
		libelcolonne = libelcolonne.substr(0, Math.min(this.nbCaColonne, libelcolonne.length));
		var top, left, bottom, right;
		var rect = this.rect(0, j).clone();
		bottom = this.margeHaut + this.titleHeight + this.titleInterval + this.hauteurLegendColonne;
		rect.top = 0;
		left = rect.left;
		
		
		if (this.legendeColonneVertical) {
			var trans = 'transform="rotate(-90 ' +
									(left + rect.width/2) + ' ' +
									bottom +
									')" ';
		
			result += '<text style="font-size:' + this.columnLegendFontSize + 'px;fill:' + this.columnLegendColor + '" text-anchor="start" ' + trans +
						'x="' + (left + rect.width/2) + '" ' +
						'y="' + bottom + '" ' +
						'width="' + rect.width + '" ' +
						'height="' + (bottom - rect.top) + '">' +
						libelcolonne + '</text>';
		} else
			result += '<text style="font-size:' + this.columnLegendFontSize + 'px;fill:' + this.columnLegendColor + '" text-anchor="middle" ' +
						'x="' + (left + rect.width/2) + '" ' +
						'y="' + bottom + '" ' +
						'width="' + rect.width + '" ' +
						'height="' + (bottom - rect.top) + '">' +
						libelcolonne + '</text>';
	}
	return result;
}


Table.prototype.toSVG_Groups = function() {
	var result = '';
	
	if (!this.bSepVisible)
		return result;
	
	for (var i = 0; i < this.row_sep.separatorCount(); i++) {
		var row = this.row_sep.at(i);
		var rect = this.getRowSepRectBefore(row);
		result += '<rect style="fill:' + this.separatorColor + '" ' +
				'x="' + (rect.left) + '" ' +
				'y="' + (rect.top) + '" ' +
				'width="' + (rect.width) + '" ' +
				'height="' + (rect.height) + '"/>';
	}

	for (var i = 0; i < this.col_sep.separatorCount(); i++) {
		var col = this.col_sep.at(i);
		var rect = this.getColumnSepRectBefore(col);
		result += '<rect style="fill:' + this.separatorColor + '" ' +
				'x="' + (rect.left) + '" ' +
				'y="' + (rect.top) + '" ' +
				'width="' + (rect.width) + '" ' +
				'height="' + (rect.height) + '"/>';
	}


	return result;	
}

Table.prototype.toSVG_Values = function() {
	var result = '';

	for (var i = 0; i < this.nb_row; i++)
		for (var j = 0; j < this.nb_col; j++) {
			if (this.formatValeur == '') {
			} else {
				var st;
				if (this.formatValeur == '0')
					st = this.value(i, j).toFixed(0);
				else if (this.formatValeur == '0.0')
					st = this.value(i, j).toFixed(1);
				else if (this.formatValeur == '0.00')
					st = this.value(i, j).toFixed(2);
				else if (this.formatValeur == '0.000')
					st = this.value(i, j).toFixed(3);
				else if (this.formatValeur == '0p')
					st = this.value(i, j).toFixed(0) + "%";
				else if (this.formatValeur == '0.0p')
					st = this.value(i, j).toFixed(1) + "%";
				else if (this.formatValeur == '0.00p')
					st = this.value(i, j).toFixed(2) + "%";
				else if (this.formatValeur == '0.000p')
					st = this.value(i, j).toFixed(3) + "%";
				else
					st = this.value(i, j).toFixed(0);

				var r = this.rect(i, j).clone();
				
				result += '<text style="font-size:' + this.valueFontSize + 'px;fill:' + this.valueColor + '" text-anchor="middle" ' +
				'x="' + (r.left + r.width/2) + '" ' +
				'y="' + (r.top - this.intervalLigneValeur) + '">' +
				st + '</text>';
			}
		}
	return result;
}

