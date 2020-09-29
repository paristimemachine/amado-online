Table.prototype.swapRows = function(i, j) {
	for (var k = 0; k < this.nb_col; k++) {
		var temp = this.value(i, k);
		this.setValue(i, k, this.value(j, k));
		this.setValue(j, k, temp);
		
		temp = this.row_info[i];
		this.row_info[i] = this.row_info[j];
		this.row_info[j] = temp;
	}
}


Table.prototype.trieColonne = function(numeroColonne, bAtoZ) {
	pushUndoAction(new SetTableAction(this));

	this.remove_hc();

	var fin = false;
	if (bAtoZ)
		while (!fin) {
			fin = true;
			for (var i = 0; i < this.nb_row - 1; i++) { 
		  		if (this.value(i, numeroColonne) > this.value((i + 1), numeroColonne)) {
		  	 		this.swapRows(i, i + 1);
		  	 		fin = false;
				}
			}
		}
	else
		while (!fin) {
			fin = true;
			for(i = 0; i < this.nb_row - 1; i++){ 
  	 			if (this.value(i, numeroColonne) < this.value((i +1 ), numeroColonne)) { 
  	 				this.swapRows(i, i + 1);
  	 				fin = false;
  	 			}
			}
		}
}

Table.prototype.swapColumns = function(i, j) {
	for (var k = 0; k < this.nb_row; k++) {
		var temp = this.value(k, i);
		this.setValue(k, i, this.value(k, j));
		this.setValue(k, j, temp);
		
		temp = this.col_info[i];
		this.col_info[i] = this.col_info[j];
		this.col_info[j] = temp;
	}
}

Table.prototype.trieLigne = function(numeroLigne, bAtoZ) {
	pushUndoAction(new SetTableAction(this));

	this.remove_hc();

	var fin = false;

	if (bAtoZ)
		while (!fin) {
			fin = true;
			for (var j = 0; j < this.nb_col - 1; j++) { 
		  		if (this.value(numeroLigne, j) > this.value(numeroLigne, (j + 1))) {
		  	 		this.swapColumns(j, j + 1);
		  	 		fin = false;
		  	 	}
			}
		}
	else
		while (!fin) {
			fin = true;
			for (var j = 0; j < this.nb_col - 1; j++) { 
		  		if (this.value(numeroLigne, j) < this.value(numeroLigne, (j + 1))) {
		  	 		this.swapColumns(j, j + 1);
		  	 		fin = false;
		  	 	}
			}
		}
}

Table.prototype.sortTable = function(bAtoZ) {
	switch (this.operate_mode) {
	case SelectingColumnMode:
		if (this.fromColumn == this.toColumn) {
			this.trieColonne(this.fromColumn, bAtoZ);
		}
		this.refresh();
		break;
	case SelectingRowMode:
		if (this.fromRow == this.toRow)
			this.trieLigne(this.fromRow, bAtoZ);
		this.refresh();
		break;
	}
}

Table.prototype.SommeLigne = function(i) {
	var sum = 0.0;
	for (var j = 0; j < this.nb_col; j++)
		sum += this.value(i, j);
	return sum;
}

Table.prototype.SommeColonne = function(j) {
	var sum = 0.0;
	for (var i = 0; i < this.nb_row; i++)
		sum += this.value(i, j);
	return sum;
}

Table.prototype.meanRow = function(i) {
    var mu = 0.0;
    for (var j = 0; j < this.nb_col; j++)
        mu += this.value(i, j);
    return mu/this.nb_col;
}

Table.prototype.meanColumn = function(j) {
	var mu = 0.0;
    for (var i = 0; i < this.nb_row; i++)
        mu += this.value(i, j);
    return mu/this.nb_row;
}

Table.prototype.varianceRow = function(i) {
	var v = 0.0;
    var m = this.meanRow(i);
    for (var j = 0; j < this.nb_col; j++) {
		var x =  this.value(i, j) - m;
        v += x*x;
    }
    return v/this.nb_col;
}

Table.prototype.varianceColumn = function(j) {
	var v = 0.0;
	var m = this.meanColumn(j);

    for (var i = 0; i < this.nb_row; i++) {
		var x = this.value(i, j) - m;
        v += x*x;
    }
    return v/this.nb_row;
}

Table.prototype.normalizeRows = function() {
	pushUndoAction(new SetTableAction(this));

	var tmp, m, v;

    for (var i = 0; i < this.nb_row; i++) {
        m = this.meanRow(i);
        v = Math.sqrt(this.varianceRow(i));
        if (v == 0)
            v = 1.0;
        for (var j = 0; j < this.nb_col; j++)
            this.setValue(i, j, (this.value(i, j) - m)/v);
    }

    // recherche de la plus petite valeur du tableau std par ligne
    for (var i = 0; i < this.nb_row; i++) {
		tmp = this.value(i, 0);
        for (var j = 1; j < this.nb_col; j++)
            if (tmp > this.value(i, j))
                tmp = this.value(i, j);

        for (var j = 0; j < this.nb_col; j++)
			this.setValue(i, j, this.value(i, j) - tmp);
    }
    // d'ou de nouvelles lignes allant de 0 a xx.xx exprimé en ecart type
    this.refresh();
}


Table.prototype.normalizeColumns = function() {
	pushUndoAction(new SetTableAction(this));

	var tmp, m, v;

    for (var j = 0; j < this.nb_col; j++) {
        m = this.meanColumn(j);
        v = Math.sqrt(this.varianceColumn(j));
        if (v == 0)
            v = 1.0;
        for (var i = 0; i < this.nb_row; i++)
            this.setValue(i, j, (this.value(i, j) - m)/v);
    }

    // recherche de la plus petite valeur du tableau std par colonne
	for (var j = 0; j < this.nb_col; j++) {
		tmp = this.value(0, j);
        for (var i = 1; i < this.nb_row; i++)
            if (tmp > this.value(i, j))
                tmp = this.value(i, j);

        for (var i = 0; i < this.nb_row; i++)
			this.setValue(i, j, this.value(i, j) - tmp);
    }
    // d'ou de nouvelles colonnes allant de 0 a xx.xx exprimé en ecart type
    this.refresh();
}


Table.prototype.PourcentageLigne = function() {
	pushUndoAction(new SetTableAction(this));

	var tmp;
	for (var i = 0; i < this.nb_row; i++) {
		var sum = this.SommeLigne(i);
        if (sum != 0)
            tmp = 100.0/sum;
        else
            tmp = 0;

        for (var j = 0; j < this.nb_col; j++)
        	this.setValue(i, j, this.value(i, j) * tmp);
    }
    this.formatValeur = '0.00p';
	this.refresh();
}

Table.prototype.PourcentageColonne = function() {
	pushUndoAction(new SetTableAction(this));

	var tmp;
	for (var j = 0; j < this.nb_col; j++) {
		var sum = this.SommeColonne(j);
        if (sum != 0)
            tmp = 100.0/sum;
        else
            tmp = 0;

        for (var i = 0; i < this.nb_row; i++)
        	this.setValue(i, j, this.value(i, j) * tmp);
    }
    this.formatValeur = '0.00p';
	this.refresh();
}

Table.prototype.deleteRows = function(from, to) {
	pushUndoAction(new SetTableAction(this));

	this.remove_hc();
	this.moveRowBefore(from, to, this.nb_row);
	this.nb_row -= (to - from + 1);
	this.fromRow = Math.min(this.fromRow, this.nb_row - 1);
	this.toRow = Math.min(this.toRow, this.nb_row - 1);
	this.refresh();
}

Table.prototype.deleteColumns = function(from, to) {
	pushUndoAction(new SetTableAction(this));

	this.remove_hc();
	this.moveColumnBefore(from, to, this.nb_col);
	
	var new_col = this.nb_col - (to - from + 1);
	var tmpData = new Array(this.nb_row*new_col);
	for (var i = 0; i < new_col; i++) {
		for (var j = 0; j < this.nb_row; j++)
			tmpData[j*new_col + i] = this.data[j*this.nb_col + i];
	};
	this.data = tmpData;
	
	this.nb_col = new_col;
	this.fromColumn = Math.min(this.fromColumn, this.nb_col - 1);
	this.toColumn = Math.min(this.toColumn, this.nb_col - 1);
	this.refresh();
}

Table.prototype.setScale = function(scale, el) {
	if (this.echelle != scale) {
		this.echelle = scale;
		this.refresh();

		$('.scaleGroup').each(function() {
			$(this).attr('src', 'icon/blank.png');
		});
		$('#' + el).attr('src', 'icon/check.png');
	}
}

Table.prototype.setValueFormat = function(format) {
	if (this.formatValeur != format) {
		this.formatValeur = format;
		this.bAffichageValeur = (format != '');
		this.refresh();
	}
}

Table.prototype.setWidthWeight = function(bWeight, el) {
	if (this.bPonderationColonne != bWeight) {
		this.bPonderationColonne = bWeight;
		this.refresh();
		
		$('.widthGroup').each(function() {
			$(this).attr('src', 'icon/blank.png');
		});
		$('#' + el).attr('src', 'icon/check.png');
	}
}

Table.prototype.computeRowLegendWidth = function(table_width) {
	table_width = table_width || this.width;
	
	var maxlength = 0;
	for (var i = 0; i < this.nb_row; ++i) {
		var nl = this.rowTitle(i);
		nl = nl.substr(0, Math.min(this.nbCaLigne, nl.length));
	
		maxlength = Math.max(maxlength,
							getTextWidth(this.rowLegendFontSize + "px Arial", nl));
	}
	maxlength =  Math.min(maxlength, 0.8*table_width);

	this.largeurLegendLigne = Math.ceil(maxlength);
}

Table.prototype.computeColumnLegendHeight = function(table_height) {

	if (this.legendeColonneVertical) {
		table_height = table_height || this.height;

		var maxlength = 0;
		for (var i = 0; i < this.nb_col; ++i) {
			var nl = this.columnTitle(i);
			nl = nl.substr(0, Math.min(this.nbCaColonne, nl.length));
	
			maxlength = Math.max(maxlength,
								getTextWidth(this.columnLegendFontSize + "px Arial", nl));
		}
		maxlength =  Math.min(maxlength, 0.8*table_height);
	
		this.hauteurLegendColonne = Math.ceil(maxlength);
	} else
		this.hauteurLegendColonne = Math.ceil(this.columnLegendFontSize*1.5);
}

Table.prototype.setRowCharacterCount = function(cnt, force) {
	if (this.nbCaLigne != cnt || force) {
		
		var char_cnt = 0;
		for (var i = 0; i < this.nb_row; ++i) {
			char_cnt = Math.max(char_cnt, this.rowTitle(i).length);
		}
		char_cnt = Math.min(cnt, char_cnt);
		this.nbCaLigne = char_cnt;
		
		this.computeRowLegendWidth();		
		this.refresh();
	}
}

Table.prototype.setColumnCharacterCount = function(cnt, force) {
	if (this.nbCaColonne != cnt || force) {		
		var char_cnt = 0;
		for (var i = 0; i < this.nb_col; ++i) {
			char_cnt = Math.max(char_cnt, this.columnTitle(i).length);
		}
		char_cnt = Math.min(cnt, char_cnt);
		this.nbCaColonne = char_cnt;

		this.computeColumnLegendHeight();

		this.refresh();
	}
}

Table.prototype.setColumnLegendVertical = function(bVertical) {
	if (this.legendeColonneVertical != bVertical) {
		this.legendeColonneVertical = bVertical;
		
		this.computeColumnLegendHeight();
		this.refresh();
	}
}

Table.prototype.setSeparatorVisible = function(bShow) {
	if (this.bSepVisible != bShow) {
		this.bSepVisible = bShow;
		this.redraw();
	}
}

Table.prototype.setSeparatorColor = function(color) {
	if (this.separatorColor != color) {
		this.separatorColor = color;
		this.redraw();
	}
}

Table.prototype.setSeparatorSize = function(nSize) {
	if (this.hauteurGLigne != nSize) {
		this.hauteurGLigne = this.largeurGColonne = nSize;
		this.refresh();
	}
}

Table.prototype.setTitle = function(txtTitle) {
	pushUndoAction(new SetTitleAction(this));

	this.title = txtTitle;
	this.redraw();
}

Table.prototype.setMode = function(nMode, el) {
	if (this.mode != nMode) {
		this.mode = nMode;
		this.redraw();
		$('.modeGroup').each(function() {
			$(this).attr('src', 'icon/blank.png');
		});
		$('#' + el).attr('src', 'icon/check.png');
	}
}

Table.prototype.increaseColumnSpacing = function() {
	if (this.intervalColonne < this.maxIntervalColonne) {
		this.intervalColonne++;
		this.refresh();
	}
}

Table.prototype.decreaseColumnSpacing = function() {
	if (this.intervalColonne > 0) {
		this.intervalColonne--;
		this.refresh();
	}
}

Table.prototype.increaseRowSpacing = function() {
	if (this.intervalLigne < this.maxIntervalLigne) {
		this.intervalLigne++;
		this.refresh();
	}
}

Table.prototype.decreaseRowSpacing = function() {
	if (this.intervalLigne > 0) {
		this.intervalLigne--;
		this.refresh();
	}
}

Table.prototype.toString = function() {
	var result = this.title.trim();
    result = result.replace('\t', ' ');

    for (var i = 0 ; i < this.nb_col; i++)
        result += '\t' + this.columnTitle(i);
    result += '\n';
    for (var i = 0 ; i < this.nb_row; i++) {
        result += this.rowTitle(i);
        for (var j = 0 ; j < this.nb_col; j++)
            result += '\t' + this.value(i, j);
        if (i < this.nb_row - 1)
            result += '\n';
    }
    return result;
}


Table.prototype.setValueFontSize = function(size, val) {
	if (size == 'other') {
		if (!parseInt(val))
			return;
	} else
		val = size;

	this.valueFontSize = val;
	this.redraw();
	
	$('.valueFontSizeGroup').each(function() {
		$(this).attr('src', 'icon/blank.png');
	});
	$('#image_value_' + size).attr('src', 'icon/check.png');
}

Table.prototype.setRowLegendFontSize = function(size, val) {
	if (size == 'other') {
		if (!parseInt(val))
			return;
	} else
		val = size;

	this.rowLegendFontSize = val;
	
	this.computeRowLegendWidth();		
	this.refresh();

	$('.rowLegendFontSizeGroup').each(function() {
		$(this).attr('src', 'icon/blank.png');
	});
	$('#image_row_' + size).attr('src', 'icon/check.png');
}

Table.prototype.setColumnLegendFontSize = function(size, val) {
	if (size == 'other') {
		if (!parseInt(val))
			return;
	} else
		val = size;

	this.columnLegendFontSize = val;

	this.computeColumnLegendHeight();
	this.refresh();

	$('.columnLegendFontSizeGroup').each(function() {
		$(this).attr('src', 'icon/blank.png');
	});
	$('#image_column_' + size).attr('src', 'icon/check.png');
}
