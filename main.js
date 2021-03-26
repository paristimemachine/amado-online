const NormalMode = 0;
const SelectingColumnMode = 1;
const SelectingRowMode     = 2;
const SelectingRowSepMode  = 3;
const SelectingColumnSepMode = 4;

const EchellePropre = 0;
const EchelleCommune = 1;

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Rect(l, t, w, h) {
	this.left = l;
	this.top = t;
	this.width = w;
	this.height = h;
	
	this.clone = function() {
		return new Rect(this.left,
						this.top,
						this.width,
						this.height);
	};
	
	this.bottom = function() {
		return this.top + this.height;
	};

	this.right = function() {
		return this.left + this.width;
	};
	
	this.center = function() {
		return new Point(Math.round(this.left + this.width/2),
						 Math.round(this.top + this.height/2));
	};
}

function InfoRC(title, mean, sum, init_sum, max) {
    this.title = title;
	this.mean = mean;
	this.sum = sum;
	this.init_sum = init_sum;
	this.max = max;
	
	this.clone = function() {
		return new InfoRC(this.title, this.mean, this.sum, this.init_sum, this.max);
	}
}

function Separator(maximum) {
	this.tab = new Array(maximum);
	this.maximum = maximum;
	this.count = 0;
	
	this.clone = function() {
		var sep = new Separator(this.maximum);
		sep.count = this.count;
		for (var i = 0; i < this.count; i++)
			sep.tab[i] = this.tab[i];
		return sep;
	}
	
	this.appendBefore = function(i) {
		if (!this.isBefore(i) && i < this.maximum) {
			this.tab[this.count] = i;
			this.count++;			
		}
	};
	
	this.appendAfter = function(i) {
		this.appendBefore(i + 1);
	};
	
	this.deleteBefore = function(rc) {
		var pos = 0;
		if (this.isBefore(rc)) {
			while (this.tab[pos] != rc) pos++;
			this.count--;
			for(var i = pos; i < this.count; i++)
				this.tab[i] = this.tab[i+1];					
		}
	};
	
	this.deleteAfter = function(i) {
		this.deleteBefore(i + 1);
	};
	
	this.isBefore = function(rc) {
		for (var i = 0; i < this.count; i++)
			if (this.tab[i] == rc)
				return true;
		return false;
	};
	
	this.isAfter = function(i) {
		return this.isBefore(i + 1);
	};

	this.separatorCount = function() {
		return this.count;
	};
	
	this.at = function(i) {
		return this.tab[i];
	}
}

function Table(row, col) {
	this.treeType = NoTree;

    this.bPourcentage = false; // 1 si il y a eu un pourcentage 0 sinon

	this.bEspRegLigne = false;  // espacement entre ligne ?
    this.bPonderationColonne = false; // la colonne est-elle ponderee ?
	this.bAffichageValeur = false;
	this.maxIntervalLigne = 50;
	this.maxIntervalColonne = 50;

        // mode de representation
	this.mode = 1;
	this.legendeLigneDroite = false;
	this.LegendeColonneHaut = true;
	this.legendeColonneVertical = true;
	
		// le pane

	this.height = 768;
	this.width = 1024;

	// les marges	
	this.margeHaut = 0;
	this.margeBas = 0;
	this.margeDroite = 0;
	this.margeGauche = 0;

		// les intervals 
	this.intervalLigne = 2;
	this.intervalColonne = 2;
	this.intervalLigneValeur = 2;
	this.intervalLigneLibel = 2;
	this.intervalColonneLibel = 2;
		// les groupes
	
	this.bSepVisible = true;	
	this.hauteurGLigne = 8;
	this.largeurGColonne = 8;
	this.separatorColor = "#888888";

		// les legendes
	this.hauteurValeur = 30;
	this.hauteurLegendColonne = 100;
	this.largeurLegendLigne = 100;
	
	this.formatValeur = "0";
	this.nbCaLigne = 10;
	this.nbCaColonne = 10;
 	this.afficheLegendeColonne = true;
 	this.afficheLegendeLigne = true;
 	this.legendeLigneDroite = false;
 	this.echelle = EchelleCommune;
 	this.bEspRegLigne = true;
 	this.bPonderationColonne = true;
 	
 	this.graphColor = "blue";
 	this.valueColor = "red";
 	this.rowLegendColor = "black";
 	this.columnLegendColor = "black";
 	
 	//title
    this.titleHeight = 24;
    this.titleInterval = 12;
    this.title = "Untitled";
    
	this.fromColumn = -1;
	this.toColumn = -1;
	this.fromRow = -1;
	this.toRow = -1;    
	this.fromColumnSep = -1;
	this.newColumnSep = -1;

	this.operate_mode = NormalMode;
	this.graph = 'graph-svg';
	this.autoSize = true;
	
	this.valueFontSize = 12;
	this.rowLegendFontSize = 14;
	this.columnLegendFontSize = 14;
 	
	this.init = function(row, col) {
		this.nb_row = row;
		this.nb_col = col;
		this.data = new Array(this.nb_row * this.nb_col);
		
		this.row_sep = new Separator(row + 1);
		this.col_sep = new Separator(col + 1);
		
		this.col_info = new Array(this.nb_col);
		this.row_info = new Array(this.nb_row);

		for (var j = 0; j < this.nb_col; j++)
			this.col_info[j] = new InfoRC('', 0, 0, 0, 0);

		for (var i = 0; i < this.nb_row; i++)
			this.row_info[i] = new InfoRC('', 0, 0, 0, 0);
		
		this.rects = new Array(this.nb_row * this.nb_col);
		
		this.topRects = new Array(this.nb_row * this.nb_col);
	};


	this.setRect = function(i, j, left, top, right, bottom) {
		this.rects[i*this.nb_col + j] = new Rect(left, top, right - left, bottom - top);
	};

	this.setTopRect = function(i, j, v) {
		this.topRects[i*this.nb_col + j] = v;
	};
	
	
	if (row != undefined && col != undefined)
		this.init(row, col);
	
	this.setValue = function(r, c, v) {
		this.data[r*this.nb_col + c] = v;
	};
	
	this.value = function(r, c) {
		return this.data[r*this.nb_col + c];
	};
	
	this.rowTitle = function(r) {
		return this.row_info[r].title;
	};
	
	this.columnTitle = function(c) {
		return this.col_info[c].title;
	};

	this.parseTable = function(text) {
		text = text.replace(/\r\n/g, '\n');	//Windows -> Unix
		text = text.replace(/\r/g, '\n');	//Mac Os  -> Unix

		text = text.replace(/[\s][\s]*$/, '');
		
		
		var lines = text.split('\n');
		if (lines.length < 2) {
			alert('The table has only ' + lines.length + ' row!');
			return false;
		}


		var sep;
		if (lines[0].indexOf(';') != - 1)
			sep = ';';
		else if (lines[0].indexOf('\t') != - 1)
			sep = '\t';
		else if (lines[0].indexOf(',') != - 1)
			sep = ',';
		else
			return false;

		lines[0] = lines[0].replace( /^[ ][ ]*/, '' ).replace( /[\s][\s]*$/, '' );
		var titles = lines[0].split(sep);
		
		if (titles.length < 2)
			return false;
			

		this.title = titles[0].length > 0 ? titles[0] : "Untitled Table";

		this.init(lines.length - 1, titles.length - 1);

		for (var j = 1; j < titles.length ; j++) {
			this.col_info[j-1].title = ('' + titles[j]).trim();
		}
		
		for (var i = 1; i < lines.length ; i++) {
			lines[i] = lines[i].replace( /^[ ][ ]*/, '' ).replace( /[\t\s][\t\s]*$/, '' );
			var numbers = lines[i].split(sep);
			this.row_info[i - 1].title = numbers[0];
		
			for (var j = 1; j < numbers.length ; j++) {
				this.setValue(i - 1, j - 1, parseFloat(numbers[j]));
			}
		}

		//KHANG 16/01/2020: compute initial sums and keep them
		for (var i = 0; i < this.nb_row; ++i)
			this.row_info[i].init_sum = 0;

		for (var j = 0; j < this.nb_col; ++j)
			this.col_info[j].init_sum = 0;
					
		for (var i = 0; i < this.nb_row; ++i)
			for (var j = 0; j < this.nb_col; ++j) {
				this.row_info[i].init_sum += this.value(i, j);
				this.col_info[j].init_sum += this.value(i, j);
			}
		//KHANG
				
		return true;
	};
	
	
	this.toHtmlString = function() {
	
		var result = "<table border='1'>";
		result += "<tr><td/>";

		for (var j = 0; j < this.nb_col; j++) {
			result += "<td>" + this.columnTitle(j) + "</td>";
		}
		result += "</tr>";

		

		for (var i = 0; i < this.nb_row; i++) {
			result += "<tr><td>" + this.rowTitle(i) + "</td>";
			for (var j = 0; j < this.nb_col; j++)
				result += "<td>" + this.value(i, j) + "</td>";
			result += "</tr>";
		}
		result += "</table>";
		return result;
	};

	this.resize = function(width, height) {
		this.hauteurValeur = (this.bAffichageValeur ? 14 : 0);
	
		var HReel = 0 - this.margeHaut - this.margeBas - this.hauteurLegendColonne - this.intervalColonneLibel
		-(this.intervalLigne + 2*this.intervalLigneValeur + this.hauteurValeur + 10)*this.nb_row
		-(this.hauteurGLigne + 2*this.intervalLigne)*this.row_sep.separatorCount();

        var LReel = 0 - this.margeDroite - this.margeGauche - this.largeurLegendLigne - this.intervalLigneLibel
        	-(this.intervalColonne + 5)*this.nb_col
        	-(this.largeurGColonne + 2*this.intervalColonne)*this.col_sep.separatorCount();
		HReel = -HReel;
		LReel = -LReel;
		
		$('#' + this.graph).width(Math.max(width, LReel));
		$('#' + this.graph).height(Math.max(height, HReel));
		this.compute(Math.max(width, LReel), Math.max(height, HReel));
	};

	this.compute = function(width, height) {
		this.hauteurValeur = (this.bAffichageValeur ? 14 : 0);
			
		for (var i = 0; i < this.nb_row; i++) {
			var max = 0, sum = 0;
			
			for (var j = 0; j < this.nb_col; j++) {
				var v = this.value(i, j);
				if (max < v)
					max = v;
				sum += v;
			}
			this.row_info[i].max = max;
			this.row_info[i].sum = sum;
			this.row_info[i].mean = sum/this.nb_col;
		}
		
		for (var j = 0; j < this.nb_col; j++) {
			var max = 0, sum = 0;
			for (var i = 0; i < this.nb_row; i++) {
				var v = this.value(i, j);
				if (max < v)
					max = v;
				sum += v;
			}
			this.col_info[j].max = max;
			this.col_info[j].sum = sum;
			this.col_info[j].mean = sum/this.nb_row;
		}

		this.width = width;
		this.height = height;
        var HReel;  // hauteur reel disponible
        var LReel;  // largeur reel dispon
        var hauteurLigne, baseLigne, largeurColonne, baseColonne;

		var tmp;
		
        HReel = height - this.margeHaut -  this.titleHeight - this.titleInterval - this.margeBas - this.hauteurLegendColonne - this.intervalColonneLibel
        	-(this.intervalLigne + 2*this.intervalLigneValeur + this.hauteurValeur)*this.nb_row
        	-(this.hauteurGLigne + this.intervalLigne)*this.row_sep.separatorCount();

        LReel = width - this.margeDroite - this.margeGauche - this.largeurLegendLigne - this.intervalLigneLibel
        	-this.intervalColonne*this.nb_col
        	-(this.largeurGColonne + this.intervalColonne)*this.col_sep.separatorCount();

        hauteurLigne = new Array(this.nb_row);
        baseLigne = new Array(this.nb_row);

        largeurColonne = new Array(this.nb_col);
        baseColonne = new Array(this.nb_col);


        // ********************** calcul des hauteurs des lignes *********************************

        if (this.bEspRegLigne) {			// espacement r�gulier entre ligne
        	tmp = HReel/this.nb_row;
			for(var i = 0; i < this.nb_row; i++)
				hauteurLigne[i] = parseInt(tmp);
        } else {
			var sum = 0;
			for (var i = 0; i < this.nb_row; i++)
				sum += this.row_info[i].max;
				
			for(var i = 0; i < this.nb_row; i++)
				hauteurLigne[i] = parseInt(this.row_info[i].max*HReel/sum);
		}

        // placement reel des lignes

        baseLigne[0] = this.margeHaut + this.titleHeight + this.titleInterval + this.hauteurLegendColonne + this.intervalColonneLibel
        		+ this.intervalLigne + this.intervalLigneValeur + this.hauteurValeur + this.intervalLigneValeur
        		+ hauteurLigne[0];

        if (this.row_sep.isBefore(0))
        	baseLigne[0] += (this.hauteurGLigne + this.intervalLigne);

        for(var i = 1; i < this.nb_row; i++) {
            baseLigne[i] = baseLigne[i-1] + this.intervalLigne + this.intervalLigneValeur
            + this.hauteurValeur + this.intervalLigneValeur + hauteurLigne[i];

            // si il y a un groupe avant ligne i

            if (this.row_sep.isBefore(i))
            	baseLigne[i] += (this.hauteurGLigne + this.intervalLigne);
        }


        // ************************ calcul de la largeur des colonnes *********************
		if(this.bPonderationColonne) {
			var sum = 0;
			//var maxCol = new Array(this.nb_col); What's it ? KHANG made as comment
			for (var j = 0; j < this.nb_col; j++)
				sum += this.col_info[j].init_sum; //changed sum -> init_sum

			if (sum == 0) //KHANG: prevent divided by zero
				sum = 1;
				
			
			for (var j = 0; j < this.nb_col; j++)
				largeurColonne[j] = parseInt(LReel*this.col_info[j].init_sum/sum);
		} else {
			tmp = LReel/this.nb_col;
			for(var j = 0; j < this.nb_col; j++)
				largeurColonne[j] = parseInt(tmp);
		}

        //maxIntervalColonne=10;
        // placement r�el des colonnes

        baseColonne[0] = this.margeGauche;
        if (!this.legendeLigneDroite) baseColonne[0] += this.largeurLegendLigne + this.intervalLigneLibel;

        if (this.col_sep.isBefore(0)) baseColonne[0] += (this.largeurGColonne + this.intervalColonne);

        for (var j = 1; j < this.nb_col; j++) {
            baseColonne[j] = baseColonne[j - 1] + largeurColonne[j - 1] + this.intervalColonne;

            // si il y a un groupe avant colonne j
            if (this.col_sep.isBefore(j))
            	baseColonne[j] += (this.largeurGColonne + this.intervalColonne);
        }


    // ********************* CALCUL des rectangles ******************************************

        for (var i = 0; i < this.nb_row; i++) {
            var seuil, tmp, maxtmp;
            if (this.echelle == EchellePropre) {//propre
            	maxtmp = this.row_info[i].max;
                 // prevention division par zero
                if (maxtmp != 0)
                	tmp = hauteurLigne[i]/maxtmp;
                else
                	tmp = 0;
            }
            else if ((this.echelle == EchelleCommune) && (this.bEspRegLigne)) {//commune
				maxtmp = 0; //cả ma trận
				for (var j = 0; j < this.nb_row; j++)
					if (maxtmp < this.row_info[j].max)
						maxtmp = this.row_info[j].max;
				
				// prevention division par zero
				if(maxtmp != 0)
					tmp = hauteurLigne[i]/maxtmp;
				else
					tmp = 0;
            }
            else if ((this.echelle == EchelleCommune) && (!this.bEspRegLigne)) {
            	// prevention division par zero
                maxtmp = this.row_info[i].max;
                if(maxtmp != 0)
                	tmp=hauteurLigne[i]/maxtmp;
                else
					tmp = 0;
            }
            

            seuil = parseInt(this.row_info[i].mean*tmp);

            for (var j = 0; j < this.nb_col; j++) {
            	var top, left, bottom, right;
				bottom = parseInt(baseLigne[i]);
				top = parseInt(bottom - this.value(i, j)*tmp);
				
				
                // cas des arrondis: pour de pas avoir 2 colonnes qui se touchent
				if (i > 0)
					top = Math.max(top, parseInt(baseLigne[i - 1] + this.intervalLigne));
                
                left = parseInt(baseColonne[j]);
                right = parseInt(baseColonne[j]) + parseInt(largeurColonne[j]);
                
                this.setRect(i, j, left, top, right, bottom);
                
                this.setTopRect(i, j, Math.max(bottom - seuil, top));
                
        	}
        }
        this.changed = true;
	};
	
	this.drawTab = function(ctx) {
		var result = '';
		switch (this.mode) {
		case 1:
			for (var i = 0; i < this.nb_row; i++) {
				var mean = this.row_info[i].mean;
				var st = 'background-color: #0ae;';

				for (var j = 0; j < this.nb_col; j++) {
					var rect = this.rect(i, j);
									
					//ctx.fillStyle = this.graphColor;
					//ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
				}
			}
			break;
			
		case 2:
			for (var i = 0; i < this.nb_row; i++) {
				var mean = this.row_info[i].mean;
				var st = 'background-color: #0ae;';

				for (var j = 0; j < this.nb_col; j++) {
					var rect = this.rect(i, j);
									
					ctx.fillStyle = this.graphColor;
					ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
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
						ctx.fillStyle = this.graphColor;
						ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
									
					} else {
						ctx.fillStyle = 'white';
						ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					}
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
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
						ctx.fillStyle = this.graphColor;
						ctx.fillRect(rect.left, rect.top, rect.width, this.topRect(i, j) - rect.top);

						ctx.fillStyle = 'white';
						ctx.fillRect(rect.left, this.topRect(i, j), rect.width, rect.top + rect.height - this.topRect(i, j));
									
					} else {
						ctx.fillStyle = 'white';
						ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					}
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
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
						ctx.fillStyle = this.graphColor;
						ctx.fillRect(rect.left, rect.top, rect.width, this.topRect(i, j) - rect.top);

						ctx.fillStyle = st;
						ctx.fillRect(rect.left, this.topRect(i, j), rect.width, rect.top + rect.height - this.topRect(i, j));
									
					} else {
						ctx.fillStyle = 'white';
						ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					}
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
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
						ctx.fillStyle = this.graphColor;
						ctx.fillRect(rect.left, rect.top, rect.width, this.topRect(i, j) - rect.top);

						ctx.fillStyle = st;
						ctx.fillRect(rect.left, this.topRect(i, j), rect.width, rect.top + rect.height - this.topRect(i, j));
									
					} else {
						ctx.fillStyle = st;
						ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
					}
					
					ctx.strokeStyle = this.graphColor;
					ctx.beginPath();
					ctx.rect(rect.left, rect.top, rect.width, rect.height);
					ctx.stroke();
				}
			}
			break;
		}
		return result;
	};
	
	this.drawLegends = function(ctx) {
		
		var rect;
		var x, y, w, h;
		var result = '';

		ctx.fillStyle = this.rowLegendColor;
		
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
				h = 50;

				ctx.font = this.rowLegendFontSize + "px Arial";
				ctx.textAlign = "start";
				ctx.fillText(nl, x, y);
			} else {
				rect = this.rect(i, 0);
				x = rect.left - this.intervalLigneLibel - this.intervalColonne;
				
				if (this.col_sep.isBefore(0)) {   // cas d'un separateur en premiere colonne
					x -= (this.largeurGColonne + this.intervalColonne);
				}
					
				y = rect.top + rect.height;
				w = this.largeurLegendLigne;
				h = 30;
				
				ctx.font = this.rowLegendFontSize + "px Arial";
				ctx.textAlign = "end";
				ctx.fillText(nl, x, y);
			}
		}
		//column legend
		ctx.fillStyle = this.columnLegendColor;

		for (var j = 0; j < this.nb_col; j++) {
			var libelcolonne = this.columnTitle(j);
			libelcolonne = libelcolonne.substr(0, Math.min(this.nbCaColonne, libelcolonne.length));
			var top, left, bottom, right;
			var rect = this.rect(0, j).clone();
			bottom = this.margeHaut + this.titleHeight + this.titleInterval + this.hauteurLegendColonne;
			rect.top = 0;
			left = rect.left;
			
			if (this.legendeColonneVertical) {
				ctx.save();
				ctx.font = this.columnLegendFontSize + "px Arial";

				ctx.translate(left + rect.width/2, bottom);
				ctx.rotate(-Math.PI/2);

				ctx.textAlign = "start";
				ctx.fillText(libelcolonne, 0, 0);
				ctx.restore();			
			} else {			
				ctx.font = this.columnLegendFontSize + "px Arial";
				ctx.textAlign = "center";
				ctx.fillText(libelcolonne, left + rect.width/2, bottom);
			}
		}
		return result;
	};
	
	this.rect = function(i, j) {
		return this.rects[i*this.nb_col + j];
	};
	
	this.topRect = function(i, j) {
		return this.topRects[i*this.nb_col + j];
	};
	
	this.getRow = function(y) {
		for (var i = 0; i < this.nb_row; i++) {
			var r = this.getRowRect(i);
			if (y >= r.top && y <= r.bottom())
				return i;
		}

		return -1;
	};

	this.getColumn = function(x) {
		for (var j = 0; j < this.nb_col; j++) {
			var r = this.rect(0, j);
			if (x >= r.left && x <= r.right())
				return j;
		}

		return -1;
	};
	
	this.getRowSep = function(y) {
		for (var i = 0; i < this.row_sep.separatorCount(); i++) {
			var rowsep = this.row_sep.at(i);
			var rect = this.getRowSepRectBefore(rowsep).clone();
			if (y >= rect.top && y <= rect.bottom())
				return rowsep;
		}
		return -1;
	}

	this.getColumnSep = function(x) {
		for (var j = 0; j < this.col_sep.separatorCount(); j++) {
			var colsep = this.col_sep.at(j);
			var rect = this.getColumnSepRectBefore(colsep);
			if (x >= rect.left && x <= rect.right())
				return colsep;
		}
		return -1;
	}

	this.getColumnBefore = function(x) {
	    if (this.nb_col < 1)
        return -1;

	    var r = this.rect(0, 0);
		if (x < (r.left + r.right())/2)
	        return 0;
    	if (x < r.right())
			return 1;

		for (var j = 0; j < this.nb_col; j++) {
			var r = this.rect(0, j);
			if (x < r.right())
				return j + 1;
		}

		return -1;
	};

	this.getRowBefore = function(y) {
	    if (this.nb_row < 1)
        return -1;

	    var r = this.getRowRect(0);
		if (y < (r.top + r.bottom())/2)
	        return 0;
    	if (y < r.bottom())
			return 1;

		for (var i = 0; i < this.nb_row; i++) {
			var r = this.getRowRect(i);
			if (y < r.bottom())
				return i + 1;
		}

		return -1;
	};

	this.getRowRect = function(i) {
		var rect = new Rect(0, 0, 0, 0);
		if (i > 0)
			rect.top = this.rect(i - 1, 0).bottom() + this.intervalLigne;
		else 
			 rect.top = this.margeHaut + this.titleHeight + this.titleInterval +
			 					this.hauteurLegendColonne + this.intervalColonneLibel +
			 					this.intervalLigne; // cas de la ligne 0

		// prise en compte des separateurs
		if (this.row_sep.isBefore(i))
			rect.top += (this.hauteurGLigne + this.intervalLigne);
	
		rect.height = this.rect(i, 0).bottom() - rect.top;

		rect.left = this.rect(i, 0).left;
		rect.width = this.rect(i, this.nb_col - 1).right() - rect.left;
	
		return rect;
	};

	this.getColumnRect = function(i) {
		var rect = this.rect(0, i).clone();
		
		rect.top = this.margeHaut + this.titleHeight + this.titleInterval +
									this.hauteurLegendColonne + this.intervalColonneLibel +
									this.intervalLigne;

		if (this.row_sep.isBefore(0))
			rect.top += this.hauteurGLigne + this.intervalLigne;
		
		rect.height = this.rect(this.nb_row - 1, i).bottom() - rect.top;
		return rect;
	};

	this.getColumnLegRect = function(i) { //column + legend
		var rect = this.getColumnRect(i).clone();
		var bottom = rect.bottom()
		rect.top = this.margeHaut + this.titleHeight + this.titleInterval;

		rect.height = bottom - rect.top;
		return rect;
	};
	
	this.getRowLegRect = function(i) { //row + legend
		var rect = this.getRowRect(i).clone();
		var right = rect.right();
		rect.left = this.margeGauche;
		rect.width = right - rect.left;
		return rect;
	};
	
	this.getRowSepRectBefore = function(rowsep) { //Row separator rectangle
		var rect;
		if (rowsep < this.nb_row) {
			rect = this.getRowRect(rowsep).clone();
			rect.top = rect.top - this.intervalLigne - this.hauteurGLigne;
			rect.height = this.hauteurGLigne;
		} else {
			rect = this.getRowRect(this.nb_row - 1).clone();
			rect.top = rect.bottom() + this.intervalLigne;
			rect.height = this.hauteurGLigne;
		}
		return rect;
	};
	
	this.getColumnSepRectBefore = function(colsep) { //Column separator rectangle
		var rect;
		if (colsep < this.nb_col) {
			rect = this.getColumnRect(colsep).clone();
			rect.left = (rect.left - this.intervalColonne - this.largeurGColonne);
			rect.width = this.largeurGColonne;
		} else {
			rect = this.getColumnRect(this.nb_col - 1).clone();
			rect.left = rect.right() + this.intervalColonne;
			rect.width = this.largeurGColonne;
		}
		return rect;	
	};

	this.drawGroups = function(ctx) {

		if (!this.bSepVisible)
			return;
		
		ctx.fillStyle = this.separatorColor;
		ctx.strokeStyle = this.separatorColor;
		for (var i = 0; i < this.row_sep.separatorCount(); i++) {
			var row = this.row_sep.at(i);
			var rect = this.getRowSepRectBefore(row);
			
			ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
			ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
		}

		for (var i = 0; i < this.col_sep.separatorCount(); i++) {
			var col = this.col_sep.at(i);
			var rect = this.getColumnSepRectBefore(col);

			ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
			ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
		}
		
	};
	
	this.drawValues = function(ctx) {
		ctx.fillStyle = this.valueColor;

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
            		
					ctx.font = this.valueFontSize + "px Arial";
					ctx.textAlign = "center";
					ctx.fillText(st, r.left + r.width/2, r.top - this.intervalLigneValeur);
				}
			}
	};
	
	
	//draw on canvas
	this.drawCanvas = function() {
		const canvas = document.getElementById("graph");
		ctx = canvas.getContext("2d");
		
		ctx.canvas.width = canvas.offsetWidth;
		ctx.canvas.height = canvas.offsetHeight;
		
		//Title
		ctx.fillStyle = "bLue";
		ctx.font = "16px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.title, this.width/2, this.margeHaut);

		//test color
		//ctx.fillStyle = this.graphColor;
		//ctx.fillRect(0, 0, 50, 50);
		
		//table
		this.drawTab(ctx);
		
		//Legends
		this.drawLegends(ctx);
		
		//Values
		if (this.bAffichageValeur)
			this.drawValues(ctx);
		
		//Groups
		this.drawGroups(ctx);
		
		//KHANG
		//document.getElementById('graph-svg').innerHTML = this.toSVG();
		//KHANG
		
		//Marker + mover + selector
		switch (this.operate_mode) {
		case SelectingColumnMode:
			if (this.fromColumn != -1 && this.toColumn != -1) {
				
				var r1 = this.getColumnLegRect(this.fromColumn);
				var r2 = this.getColumnLegRect(this.toColumn);
				var rect = new Rect(r1.left, r1.top, r2.right() - r1.left, r1.height);

				ctx.strokeStyle = "black";
				ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				//dragging
				if (this.isDragging) {
					rect.left += (this.currentPointX - this.oldPointX);
					
					ctx.save();
					ctx.strokeStyle = "red";
					ctx.setLineDash([5]);
					ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					ctx.restore();

					if (this.newColumn != undefined && this.newColumn != -1) {
						if (this.newColumn > 0)
							rect = this.getColumnLegRect(this.newColumn - 1);
						else {
							rect = this.getColumnLegRect(0);
							rect.left -= this.intervalColonne;
							rect.width = 0;
						}

						ctx.fillStyle = ctx.strokeStyle = "red";
						ctx.fillRect(rect.right(), rect.top, 4, rect.height);
						ctx.strokeRect(rect.right(), rect.top, 4, rect.height);
					}
				}
				
			}
			break;
			
		case SelectingColumnSepMode:
			if (this.fromColumnSep != -1) {
				var rect = this.getColumnSepRectBefore(this.fromColumnSep);

				ctx.strokeStyle = "black"; //selector
				ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				if (this.isDragging) {
					rect.left += (this.currentPointX - this.oldPointX);					
					//painter.setPen(Qt::DotLine); //mover
					ctx.save();
					ctx.strokeStyle = "red"; //selector
					ctx.setLineDash([5]);
					ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					ctx.restore();
					
					if (this.newColumnSep != undefined && this.newColumnSep != -1) {
						if (this.newColumnSep > 0)
							rect = this.getColumnRect(this.newColumnSep - 1);
						else {
							rect = this.getColumnRect(0);
							rect.left -= this.intervalColonne;
							rect.width = 0;
						}
						
						ctx.fillStyle = ctx.strokeStyle = "red";
						ctx.fillRect(rect.right(), rect.top, 4, rect.height);
						ctx.strokeRect(rect.right(), rect.top, 4, rect.height);
					}
				}
			}
			break;
						
		case SelectingRowMode:
			if (this.fromRow != -1 && this.toRow != -1) {
				
				var r1 = this.getRowLegRect(this.fromRow);
				var r2 = this.getRowLegRect(this.toRow);
				var rect = new Rect(r1.left, r1.top, r1.width, r2.bottom() - r1.top);

				ctx.strokeStyle = "black";
				ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				if (this.isDragging) {
					rect.top += (this.currentPointY - this.oldPointY);
					//$('#log').html('new row: ' + this.newRow);
					
					ctx.save();
					ctx.strokeStyle = "red";
					ctx.setLineDash([5]);
					ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					ctx.restore();

					if (this.newRow != undefined && this.newRow != -1) {
						if (this.newRow > 0)
							rect = this.getRowLegRect(this.newRow - 1);
						else {
							rect = this.getRowLegRect(0);
							rect.top -= this.intervalLigne;
							rect.height = 0;
						}

						ctx.fillStyle = ctx.strokeStyle = "red";
						ctx.fillRect(rect.left, rect.bottom(), rect.width, 4);
						ctx.strokeRect(rect.left, rect.bottom(), rect.width, 4);
					}
				}

			}
			break;
			
		case SelectingRowSepMode:
			if (this.fromRowSep != -1) {
				var rect = this.getRowSepRectBefore(this.fromRowSep).clone();

				ctx.strokeStyle = "black"; //selector
				ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				if (this.isDragging) {
					rect.top += (this.currentPointY - this.oldPointY);					
					//painter.setPen(Qt::DotLine); //mover

					ctx.save();
					ctx.strokeStyle = "red"; //selector
					ctx.setLineDash([5]);
					ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					ctx.restore();
					
					if (this.newRowSep != undefined && this.newRowSep != -1) {
						if (this.newRowSep > 0)
							rect = this.getRowRect(this.newRowSep - 1);
						else {
							rect = this.getRowRect(0);
							rect.top -= this.intervalLigne;
							rect.height = 0;
						}
						
						ctx.fillStyle = ctx.strokeStyle = "red";
						ctx.fillRect(rect.left, rect.bottom(), rect.width, 4);
						ctx.strokeRect(rect.left, rect.bottom(), rect.width, 4);
					}
				}
			}
			break;
			
			
		default:
			break;
		}
		
	};

	//draw on SVG
	this.draw = function() {
		if (this.changed) {
			document.getElementById('graph-svg').innerHTML = this.toSVG();
			this.changed = false;
		}

		$('#amado-marker').attr('visibility', 'hidden');
		$('#amado-mover').attr('visibility', 'hidden');
		$('#amado-selector').attr('visibility', 'hidden');

		//Marker + mover + selector
		switch (this.operate_mode) {
		case SelectingColumnMode:
			if (this.fromColumn != -1 && this.toColumn != -1) {
				
				var r1 = this.getColumnLegRect(this.fromColumn);
				var r2 = this.getColumnLegRect(this.toColumn);
				var rect = new Rect(r1.left, r1.top, r2.right() - r1.left, r1.height);

				
				//ctx.strokeStyle = "black";
				//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
				
				$('#amado-selector').attr('x', rect.left);
				$('#amado-selector').attr('y', rect.top);
				$('#amado-selector').attr('width', rect.width);
				$('#amado-selector').attr('height', rect.height);
				$('#amado-selector').attr('visibility', 'visible');

				//(rect.left, rect.top, rect.width, rect.height);

				//dragging
				if (this.isDragging) {
					rect.left += (this.currentPointX - this.oldPointX);
					
					//ctx.save();
					//ctx.strokeStyle = "red";
					//ctx.setLineDash([5]);
					//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					//ctx.restore();
					
					$('#amado-mover').attr('x', rect.left);
					$('#amado-mover').attr('y', rect.top);
					$('#amado-mover').attr('width', rect.width);
					$('#amado-mover').attr('height', rect.height);
					$('#amado-mover').attr('visibility', 'visible');


					if (this.newColumn != undefined && this.newColumn != -1) {
						if (this.newColumn > 0)
							rect = this.getColumnLegRect(this.newColumn - 1);
						else {
							rect = this.getColumnLegRect(0);
							rect.left -= this.intervalColonne;
							rect.width = 0;
						}

						//ctx.fillStyle = ctx.strokeStyle = "red";
						//ctx.fillRect(rect.right(), rect.top, 4, rect.height);
						//ctx.strokeRect(rect.right(), rect.top, 4, rect.height);

						$('#amado-marker').attr('x', rect.right());
						$('#amado-marker').attr('y', rect.top);
						$('#amado-marker').attr('width', 4);
						$('#amado-marker').attr('height', rect.height);
						$('#amado-marker').attr('visibility', 'visible');
					}
				}
				
			}
			break;
			
		case SelectingColumnSepMode:
			if (this.fromColumnSep != -1) {
				var rect = this.getColumnSepRectBefore(this.fromColumnSep);

				//ctx.strokeStyle = "black"; //selector
				//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
				
				$('#amado-selector').attr('x', rect.left);
				$('#amado-selector').attr('y', rect.top);
				$('#amado-selector').attr('width', rect.width);
				$('#amado-selector').attr('height', rect.height);
				$('#amado-selector').attr('visibility', 'visible');

				if (this.isDragging) {
					rect.left += (this.currentPointX - this.oldPointX);					
					
					//painter.setPen(Qt::DotLine); //mover
					//ctx.save();
					//ctx.strokeStyle = "red"; //selector
					//ctx.setLineDash([5]);
					//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					//ctx.restore();
					
					$('#amado-mover').attr('x', rect.left);
					$('#amado-mover').attr('y', rect.top);
					$('#amado-mover').attr('width', rect.width);
					$('#amado-mover').attr('height', rect.height);
					$('#amado-mover').attr('visibility', 'visible');

					
					if (this.newColumnSep != undefined && this.newColumnSep != -1) {
						if (this.newColumnSep > 0)
							rect = this.getColumnRect(this.newColumnSep - 1);
						else {
							rect = this.getColumnRect(0);
							rect.left -= this.intervalColonne;
							rect.width = 0;
						}
						
						//ctx.fillStyle = ctx.strokeStyle = "red";
						//ctx.fillRect(rect.right(), rect.top, 4, rect.height);
						//ctx.strokeRect(rect.right(), rect.top, 4, rect.height);
						
						$('#amado-marker').attr('x', rect.right());
						$('#amado-marker').attr('y', rect.top);
						$('#amado-marker').attr('width', 4);
						$('#amado-marker').attr('height', rect.height);
						$('#amado-marker').attr('visibility', 'visible');

					}
				}
			}
			break;
						
		case SelectingRowMode:
			if (this.fromRow != -1 && this.toRow != -1) {
				
				var r1 = this.getRowLegRect(this.fromRow);
				var r2 = this.getRowLegRect(this.toRow);
				var rect = new Rect(r1.left, r1.top, r1.width, r2.bottom() - r1.top);

				//ctx.strokeStyle = "black";
				//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				$('#amado-selector').attr('x', rect.left);
				$('#amado-selector').attr('y', rect.top);
				$('#amado-selector').attr('width', rect.width);
				$('#amado-selector').attr('height', rect.height);
				$('#amado-selector').attr('visibility', 'visible');


				if (this.isDragging) {
					rect.top += (this.currentPointY - this.oldPointY);
					//$('#log').html('new row: ' + this.newRow);
					
					//ctx.save();
					//ctx.strokeStyle = "red";
					//ctx.setLineDash([5]);
					//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					//ctx.restore();
					
					$('#amado-mover').attr('x', rect.left);
					$('#amado-mover').attr('y', rect.top);
					$('#amado-mover').attr('width', rect.width);
					$('#amado-mover').attr('height', rect.height);
					$('#amado-mover').attr('visibility', 'visible');

					if (this.newRow != undefined && this.newRow != -1) {
						if (this.newRow > 0)
							rect = this.getRowLegRect(this.newRow - 1);
						else {
							rect = this.getRowLegRect(0);
							rect.top -= this.intervalLigne;
							rect.height = 0;
						}

						//ctx.fillStyle = ctx.strokeStyle = "red";
						//ctx.fillRect(rect.left, rect.bottom(), rect.width, 4);
						//ctx.strokeRect(rect.left, rect.bottom(), rect.width, 4);
						
						$('#amado-marker').attr('x', rect.left);
						$('#amado-marker').attr('y', rect.bottom());
						$('#amado-marker').attr('width', rect.width);
						$('#amado-marker').attr('height', 4);
						$('#amado-marker').attr('visibility', 'visible');
						
					}
				}

			}
			break;
			
		case SelectingRowSepMode:
			if (this.fromRowSep != -1) {
				var rect = this.getRowSepRectBefore(this.fromRowSep).clone();

				//ctx.strokeStyle = "black"; //selector
				//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

				$('#amado-selector').attr('x', rect.left);
				$('#amado-selector').attr('y', rect.top);
				$('#amado-selector').attr('width', rect.width);
				$('#amado-selector').attr('height', rect.height);
				$('#amado-selector').attr('visibility', 'visible');


				if (this.isDragging) {
					rect.top += (this.currentPointY - this.oldPointY);					
					//painter.setPen(Qt::DotLine); //mover

					//ctx.save();
					//ctx.strokeStyle = "red"; //selector
					//ctx.setLineDash([5]);
					//ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
					//ctx.restore();

					$('#amado-mover').attr('x', rect.left);
					$('#amado-mover').attr('y', rect.top);
					$('#amado-mover').attr('width', rect.width);
					$('#amado-mover').attr('height', rect.height);
					$('#amado-mover').attr('visibility', 'visible');
					
					
					if (this.newRowSep != undefined && this.newRowSep != -1) {
						if (this.newRowSep > 0)
							rect = this.getRowRect(this.newRowSep - 1);
						else {
							rect = this.getRowRect(0);
							rect.top -= this.intervalLigne;
							rect.height = 0;
						}
						
						//ctx.fillStyle = ctx.strokeStyle = "red";
						//ctx.fillRect(rect.left, rect.bottom(), rect.width, 4);
						//ctx.strokeRect(rect.left, rect.bottom(), rect.width, 4);

						$('#amado-marker').attr('x', rect.left);
						$('#amado-marker').attr('y', rect.bottom());
						$('#amado-marker').attr('width', rect.width);
						$('#amado-marker').attr('height', 4);
						$('#amado-marker').attr('visibility', 'visible');
						
					}
				}
			}
			break;
			
			
		default:
			break;
		}
		
	};	
	
	this.doSelect = function(x, y) {
		var r1, r2;
		var row, col, rowsep, colsep;
		var done = false;
		
		switch (this.operate_mode) {
		case SelectingColumnMode:
			r1 = this.rect(0, this.fromColumn);
			r2 = this.rect(0, this.toColumn);
			if (x >= r1.left && x <= r2.right())
				done = true;
			break;
			
		case SelectingRowMode:
			r1 = this.getRowLegRect(this.fromRow);
			r2 = this.getRowLegRect(this.toRow);
			if (y >= r1.top && y <= r2.bottom())
				done = true;
			break;
		}
		
		if (!done) {
			row = this.getRow(y);
			col = this.getColumn(x);
			rowsep = this.getRowSep(y);
			colsep = this.getColumnSep(x);

			this.operate_mode = NormalMode;
			if (colsep != -1) {
				//selecting row separator
				this.fromColumnSep = colsep;
				this.operate_mode = SelectingColumnSepMode;
			} else if (rowsep != -1) {
				//selecting row separator
				this.fromRowSep = rowsep;
				this.operate_mode = SelectingRowSepMode;
			} else if (col != -1) {
				//selecting collumn
				this.fromColumn = this.toColumn = col;
				this.operate_mode = SelectingColumnMode;
			} else if (row != -1) {
				//selecting row
				this.fromRow = this.toRow = row;
				this.operate_mode = SelectingRowMode;
			}
		}
	};

	this.mousePressEvent = function() {
	
		var that = this;
		$('#' + this.graph).mousedown(function(event) {
			if (event.which != 1)
				return;

			var parentOffset = $('#' + that.graph).position(); 
			var relX = event.pageX - parentOffset.left;
			var relY = event.pageY - parentOffset.top;

			that.hasMoved = false;
			that.isDragging = true;
			that.oldPointX = relX;
			that.oldPointY = relY;

			that.currentPointX = that.oldPointX;
			that.currentPointY = that.oldPointY;
			
			that.newColumn = that.newRow = -1;

			//selecting block
			if (event.shiftKey || event.ctrlKey || event.metaKey) {
				if (that.operate_mode == SelectingColumnMode) {
					var col = that.getColumn(relX);
					if (col != -1) {
						that.fromColumn = Math.min(col, that.fromColumn);
						that.toColumn = Math.max(col, that.toColumn);
					}
				} else if (that.operate_mode == SelectingRowMode) {
					var row = that.getRow(relY);
					if (row != -1) {
						that.fromRow = Math.min(row, that.fromRow);
						that.toRow = Math.max(row, that.toRow);
					}
				}
			} else {
				that.doSelect(relX, relY);
			}
			that.draw();
			
			$('#' + that.graph).mousemove(function(event) {
				if (that.isDragging  && (that.treeType == NoTree)) {
					var parentOffset = $('#' + that.graph).position(); 
					var relX = event.pageX - parentOffset.left;
					var relY = event.pageY - parentOffset.top;
				
					that.currentPointX = relX;
					//$('#on').html(that.currentPointX);
					that.currentPointY = relY;
					that.hasMoved = true;
					var col, row;
					
					switch (that.operate_mode) {
					case SelectingColumnMode:
						if (true) {
							col = that.getColumnBefore(relX);
							if (col != -1 && (col < that.fromColumn || col > that.toColumn + 1)) {
								that.newColumn = col;
							} else
								that.newColumn = -1;
						}
						break;
					case SelectingRowMode:
						if (true) {
							row = that.getRowBefore(relY);
							if (row != -1 && (row < that.fromRow || row > that.toRow + 1))
								that.newRow = row;
							else
								that.newRow = -1;
						}
						break;
					
					case SelectingColumnSepMode:
						col = that.getColumnBefore(relX);
						if (col != -1 && col != that.fromColumnSep && !that.col_sep.isBefore(col))
							that.newColumnSep = col;
						else
							that.newColumnSep = -1;
						
						break;

					case SelectingRowSepMode:
						row = that.getRowBefore(relY);
						if (row != -1 && row != that.fromRowSep && !that.row_sep.isBefore(row))
							that.newRowSep = row;
						else
							that.newRowSep = -1;
						break;
					}
					that.draw();
				}
				
				event.preventDefault();
			});
			
			event.preventDefault();
		});
	};
	
	this.moveColumnBefore = function(fromCol, toCol, desCol) {
		if (fromCol <= desCol && desCol <= toCol)
			return;

		var index = new Array(this.nb_col);
		var k = 0;
		
		if (desCol < fromCol) {
			for (var i = 0; i < desCol; i++)
				index[k++] = i;
			
			for (var i = fromCol; i <= toCol; i++)
				index[k++] = i;

			for (var i = desCol; i < fromCol; i++)
				index[k++] = i;

			for (var i = toCol + 1; i < this.nb_col; i++)
				index[k++] = i;
		} else {
			for (var i = 0; i < fromCol; i++)
				index[k++] = i;
			
			for (var i = toCol + 1; i < desCol; i++)
				index[k++] = i;

			for (var i = fromCol; i <= toCol; i++)
				index[k++] = i;

			for (var i = desCol; i < this.nb_col; i++)
				index[k++] = i;
		}
		
		var tmpData = new Array(this.nb_row*this.nb_col);
		var tmpInfo = new Array(this.nb_col);
		for (var i = 0; i < this.nb_col; i++) {
			for (var j = 0; j < this.nb_row; j++)
				tmpData[j*this.nb_col + i] = this.data[j*this.nb_col + index[i]];
			tmpInfo[i] = this.col_info[index[i]];
		};
		this.data = tmpData;
		this.col_info = tmpInfo;
	};


	this.moveRowBefore = function(fromRow, toRow, desRow) {
		if (fromRow <= desRow && desRow <= toRow)
			return;
		
		var index = new Array(this.nb_row);
		var k = 0;
		
		if (desRow < fromRow) {
			for (var i = 0; i < desRow; i++)
				index[k++] = i;
			
			for (var i = fromRow; i <= toRow; i++)
				index[k++] = i;

			for (var i = desRow; i < fromRow; i++)
				index[k++] = i;

			for (var i = toRow + 1; i < this.nb_row; i++)
				index[k++] = i;
		} else {
			for (var i = 0; i < fromRow; i++)
				index[k++] = i;
			
			for (var i = toRow + 1; i < desRow; i++)
				index[k++] = i;

			for (var i = fromRow; i <= toRow; i++)
				index[k++] = i;

			for (var i = desRow; i < this.nb_row; i++)
				index[k++] = i;
		}

		var tmpData = new Array(this.nb_row*this.nb_col);
		var tmpInfo = new Array(this.nb_row);
		
		for (var i = 0; i < this.nb_row; i++) {
			for (var j = 0; j < this.nb_col; j++) {
				tmpData[i*this.nb_col + j] = this.value(index[i], j);
			}
			tmpInfo[i] = this.row_info[index[i]];
		};
		this.data = tmpData;
		this.row_info = tmpInfo;
	};

	var that = this;
	$(window).mouseup(function() {
		$('#' + that.graph).unbind('mousemove');
		var hasChanged = false;
		switch (that.operate_mode) {
		case SelectingColumnMode:
			if (that.newColumn != undefined && that.newColumn != -1) {			

				pushUndoAction(new SetTableAction(that));

				that.moveColumnBefore(that.fromColumn, that.toColumn, that.newColumn);
				that.operate_mode = NormalMode;
                that.fromColumn = that.toColumn = that.newColumn = -1;
				that.compute(that.width, that.height);
				hasChanged = true;
			}
			break;

		case SelectingRowMode:
			if (that.newRow != undefined && that.newRow != -1) {

				pushUndoAction(new SetTableAction(that));

				that.moveRowBefore(that.fromRow, that.toRow, that.newRow);
				that.operate_mode = NormalMode;
                that.fromRow = that.toRow = that.newRow = -1;
				that.compute(that.width, that.height);
				hasChanged = true; //not used yet
			}
			break;
			
		case SelectingColumnSepMode:
			if (that.newColumnSep != -1 && that.fromColumnSep != -1) {

				pushUndoAction(new SetTableAction(that));

				//move sep
				that.col_sep.deleteBefore(that.fromColumnSep);

				if (that.newColumnSep > 0)
					that.col_sep.appendAfter(that.newColumnSep - 1);
				else
					that.col_sep.appendBefore(that.newColumnSep);
				that.operate_mode = NormalMode;
				that.fromColumnSep = that.newColumnSep = -1;
				hasChanged = true;
			}
			break;


		case SelectingRowSepMode:
			if (that.newRowSep != -1 && that.fromRowSep != -1) {

				pushUndoAction(new SetTableAction(that));

				//move sep
				that.row_sep.deleteBefore(that.fromRowSep);

				if (that.newRowSep > 0) {
					that.row_sep.appendAfter(that.newRowSep - 1);
				} else {
					that.row_sep.appendBefore(that.newRowSep);
				}
				that.operate_mode = NormalMode;
				that.fromRowSep = that.newRowSep = -1;
				hasChanged = true;
			}
			break;
		}
		
		that.newRow = -1;
		that.newColumn = -1;
		that.newRowSep = -1;
		that.newColumnSep = -1;
		that.hasMoved = false;
		that.isDragging = false;
		
		that.newColumn != -1;
		
		if (hasChanged)
			that.refresh();
		else
			that.draw();
	});
	
	this.refresh = function() {
		this.compute(this.width, this.height);

		if (this.rhc != undefined) {
			this.rhc.refresh();
			this.chc.refresh();
		}
		this.redraw();
	};
	
	this.redraw = function() {
		this.changed = true;
		this.draw();
	};
	
	this.insertSeparator = function() {
		if (this.operate_mode == SelectingColumnMode) {
			this.col_sep.appendBefore(this.fromColumn);
		} else if (this.operate_mode == SelectingRowMode) {
			this.row_sep.appendBefore(this.fromRow);
		}
	
		this.refresh();
	};
	
	this.removeSeparator = function() {
		if (this.operate_mode == SelectingColumnMode) {
			this.col_sep.deleteBefore(this.fromColumn);
		} else if (this.operate_mode == SelectingRowMode) {
			this.row_sep.deleteBefore(this.fromRow);
		}
	
		this.refresh();
	};

	this.transpose = function() {
		pushUndoAction(new SetTableAction(this));
	
		var tmp = new Array(this.nb_row*this.nb_col);
		
		for (var j = 0; j < this.nb_col; j++)
			for (var i = 0; i < this.nb_row; i++)
				tmp[j*this.nb_row + i] = this.value(i, j);
		
		this.data = tmp;
		
		tmp = this.row_info;
		this.row_info = this.col_info;
		this.col_info = tmp;
		
		tmp = this.row_sep;
		this.row_sep = this.col_sep;
		this.col_sep = tmp;
		
		tmp = this.nb_row;
		this.nb_row = this.nb_col;
		this.nb_col = tmp;
		
		//KHANG		
		tmp = this.nbCaLigne;
		this.nbCaLigne = this.nbCaColonne;
		this.nbCaColonne = tmp;
		
		//swap trees if defined
		if (this.rhc) {
			tmp = this.rhc;
			this.rhc = this.chc;
			this.chc = tmp;

			this.rhc.mode = RowMode;
			this.chc.mode = ColumnMode;
			
			tmp = this.rhc.div;
			this.rhc.div = this.chc.div;
			this.chc.div = tmp;
		}
		this.computeRowLegendWidth();
		this.computeColumnLegendHeight();
		this.refresh();
	};
	
	this.pca = function() {
		pushUndoAction(new SetTableAction(this));
	
		this.remove_hc();
		
		var Xt, X, mean, variance;

		mean = [];
		variance = [];
		for (var j = 0; j < this.nb_col; j++) {
			var s = 0;
			for (var i = 0; i < this.nb_row; i++)
				s += this.value(i, j);
			mean[j] = s/this.nb_row;
			s = 0;
			for (var i = 0; i < this.nb_row; i++) {
				var tmp = (this.value(i, j) - mean[j]);
				s +=  tmp * tmp;
			}
			variance[j] = Math.sqrt(s);//this.nb_row;
		}
		
		X = [];
		for (var i = 0; i < this.nb_row; i++) {
			X[i] = [];
			for (var j = 0; j < this.nb_col; j++) {
				X[i][j] = (this.value(i, j) - mean[j])/variance[j];
			}
		}

		Xt = [];
		for (var j = 0; j < this.nb_col; j++) {
			Xt[j] = [];
			for (var i = 0; i < this.nb_row; i++)
				Xt[j][i] = X[i][j];
		}
		
		var V = numeric.dotMMbig(Xt, X);
		
		
		var s = '';
		for (var i = 0; i < X.length; i++) {
			for (var j = 0; j < X[i].length; j++)
				s += X[i][j] + ' ';
			s += '\n';
		}
		
		//centered matrix

		 s = '';
		for (var i = 0; i < V.length; i++) {
			for (var j = 0; j < V[i].length; j++)
				s += V[i][j] + ' ';
			s += '\n';
		}
		//correlation matrix
		

		var ev = numeric.eig(V);

		var v0 = new Array(this.nb_col);
		
		s = '';
		for (var i = 0; i < this.nb_col; i++) {
			v0[i] = ev.E.x[i][0];
			s += v0[i] + ' ';
		}
		//eigen vector
		//alert('v0: ' + s);
		
		var Z = numeric.dotMV(X, v0);

		s = '';
		for (var i = 0; i < Z.length; i++) {
			s += (Z[i]*Math.sqrt(this.nb_row)) + '\n';
		}
		//alert(s);
		
		s = '';
		var W = [];
		for (var i = 0; i < v0.length; i++) {
			W[i] = v0[i]*Math.sqrt(ev.lambda.x[0]);
			s += W[i] + '\n';
		}
		//alert(s);

		this.sort(Z, W);
		this.refresh();	
		
		
		//tracking
		_paq.push(['trackEvent', 'Data', 'Processing', 'PCA']);			
	};
	
	this.nnpca = function() {
		pushUndoAction(new SetTableAction(this));
	
		this.remove_hc();
	
		var Xt, X, mean, variance;

		mean = [];
		variance = [];
		for (var j = 0; j < this.nb_col; j++) {
			var s = 0;
			for (var i = 0; i < this.nb_row; i++)
				s += this.value(i, j);
			mean[j] = s/this.nb_row;
			s = 0;
			for (var i = 0; i < this.nb_row; i++) {
				var tmp = (this.value(i, j) - mean[j]);
				s +=  tmp * tmp;
			}
			variance[j] = Math.sqrt(s);//this.nb_row;
		}
		
		X = [];
		for (var i = 0; i < this.nb_row; i++) {
			X[i] = [];
			for (var j = 0; j < this.nb_col; j++) {
				X[i][j] = (this.value(i, j) - mean[j]);//variance[j];
			}
		}

		Xt = [];
		for (var j = 0; j < this.nb_col; j++) {
			Xt[j] = [];
			for (var i = 0; i < this.nb_row; i++)
				Xt[j][i] = X[i][j];
		}
		
		var V = numeric.dotMMbig(Xt, X);
		
		
		var s = '';
		for (var i = 0; i < X.length; i++) {
			for (var j = 0; j < X[i].length; j++)
				s += X[i][j] + ' ';
			s += '\n';
		}
		
		//centered matrix
		//alert(s);

		 s = '';
		for (var i = 0; i < V.length; i++) {
			for (var j = 0; j < V[i].length; j++)
				s += V[i][j] + ' ';
			s += '\n';
		}
		//correlation matrix
		//alert(s);
		

		var ev = numeric.eig(V);

		var v0 = new Array(this.nb_col);
		
		s = '';
		for (var i = 0; i < this.nb_col; i++) {
			v0[i] = ev.E.x[i][0];
			s += v0[i] + ' ';
		}
		//eigen vector
		//alert('v0: ' + s);
		
		var Z = numeric.dotMV(X, v0);

		s = '';
		for (var i = 0; i < Z.length; i++) {
			s += (Z[i]*Math.sqrt(this.nb_row)) + '\n';
		}
		//alert(s);
		
		s = '';
		var W = [];
		for (var i = 0; i < v0.length; i++) {
			W[i] = v0[i]*Math.sqrt(ev.lambda.x[0]);
			s += W[i] + '\n';
		}
		//alert(s);

		this.sort(Z, W);	
		this.refresh();	

		//tracking
		_paq.push(['trackEvent', 'Data', 'Processing', 'Normalized PCA']);		
	};
	
	
	this.ca = function() {
		pushUndoAction(new SetTableAction(this));
	
		this.remove_hc();

		var Xt, X, p, q;

		X = [];
		p = []; q = [];

		for (var j = 0; j < this.nb_col; j++)
			q[j] = 0;

		for (var i = 0; i < this.nb_row; i++) {
			X[i] = []; p[i] = 0;
			for (var j = 0; j < this.nb_col; j++) {
				X[i][j] = this.value(i, j);
				p[i] += X[i][j];
				q[j] += X[i][j];
			}
		}

		//KHANG check q[i] !=, p[i] != 0
		for (var j = 0; j < this.nb_col; ++j)
			if (q[j] == 0)
				q[j] = 1;

		for (var i = 0; i < this.nb_row; ++i)
			if (p[i] == 0)
				p[j] = 1;
		//END KHANG

//alert(0);
		var V0 = [];
		for (var i = 0; i < this.nb_row; i++) {
			V0[i] = [];
			for (var j = 0; j < this.nb_col; j++) {
				V0[i][j] = X[i][j]/Math.sqrt(p[i]*q[j]);
			}
		}

		var V1;
//alert(3333);
		V1 = [];
		for (var j = 0; j < this.nb_col; j++) {
			V1[j] = [];
			for (var i = 0; i < this.nb_row; i++)
				V1[j][i] = V0[i][j];
		}
		
//alert(1);

		
		var V = numeric.dotMMbig(V1, V0);
		var ev = numeric.eig(V);
		
		var index = [];
		for (var i = 0; i < this.nb_col; i++)
			index[i] = {'id': i, 'val': ev.lambda.x[i]};
				
		index.sort(function(a, b) {return b.val - a.val;});
		
		var s = '';
		var u = [];
		
		var sign = (ev.E.x[0][index[1].id] > 0 ? 1 : -1);
		for (var i = 0; i < this.nb_col; i++) {
			u[i] = sign*ev.E.x[i][index[1].id]/Math.sqrt(q[i]);
			s += ev.E.x[i][index[1].id] + '\n';
		}
			
		for (var i = 0; i < this.nb_row; i++) {
			for (var j = 0; j < this.nb_col; j++) {
				X[i][j] = X[i][j]/p[i];
			}
		}
			
		var Z = numeric.dot(X, u);

		s = '';
		var W = [];
		for (var i = 0; i < u.length; i++) {
			W[i] = u[i]*Math.sqrt(ev.lambda.x[1]);
			s += W[i] + '\n';
		}
		this.sort(Z, W);
		this.refresh();	

		//tracking
		_paq.push(['trackEvent', 'Data', 'Processing', 'Correspondence Analysis']);
	};
	

	this.sortRows = function(Z) {
		var indexes = [];
		for (var i = 0; i < Z.length; i++) {
			indexes[i] = {'index': i, 'value': Z[i]};
		}
		indexes.sort(function(a, b) {return a.value - b.value;});

		//sort
		var tmpData = new Array(this.nb_row*this.nb_col);
		var tmpInfo = new Array(this.nb_row);
		
		for (var i = 0; i < this.nb_row; i++) {
			for (var j = 0; j < this.nb_col; j++) {
				tmpData[i*this.nb_col + j] = this.value(indexes[i].index, j);
			}
			tmpInfo[i] = this.row_info[indexes[i].index];
		};

		this.data = tmpData;
		this.row_info = tmpInfo;
	};
		
	this.sortColumns = function (W) {
		var indexes = [];
		for (var i = 0; i < W.length; i++) {
			indexes[i] = {'index': i, 'value': W[i]};
		}

		indexes.sort(function(a, b) {return a.value - b.value;});
		
		//sort
		var tmpData = new Array(this.nb_row*this.nb_col);
		var tmpInfo = new Array(this.nb_col);

		for (var j = 0; j < this.nb_col; j++) {
			for (var i = 0; i < this.nb_row; i++)
				tmpData[i*this.nb_col + j] = this.data[i*this.nb_col + indexes[j].index];
			tmpInfo[j] = this.col_info[indexes[j].index];
		};
		this.data = tmpData;
		this.col_info = tmpInfo;
	};
	
	this.sort = function (Z, W) {
		this.sortRows(Z);
		this.sortColumns(W);
	};
	
	this.hc = function(type) {
		pushUndoAction(new SetTableAction(this));
		this.hcExecute(type);
		this.refresh();
		
		//tracking
		_paq.push(['trackEvent', 'Data', 'Processing', 'HCA']);
	};
	
	this.hcExecute = function(type) {
		var rhc = new HierarchicalClustering(this, false, type);		
		rhc.compute();

		var chc = new HierarchicalClustering(this, true, type);
		chc.compute();

		this.rhc = rhc;
		this.chc = chc;
		this.sort(rhc.list, chc.list);
		
		this.treeType = type;
	};
	
	this.remove_hc = function() {
		if (this.treeType != NoTree) {
			pushUndoAction(new SetTableAction(this));
			this.remove_hcExecute();
			this.redraw();
		}
	};
	
	this.remove_hcExecute = function() {
		if (this.rhc) {
			this.rhc.remove();
			this.chc.remove();
			this.rhc = null;
			this.chc = null;
			this.treeType = NoTree;
		}
	};
}
