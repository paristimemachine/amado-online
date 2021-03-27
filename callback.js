function setGraphColor() {
	const c = $('#color').val();
	table.graphColor = c;
	$('#GetColorDialog').modal('hide');
	table.changed = true;
	table.redraw();
}

function setValueColor() {
	const c = $('#color').val();
	table.valueColor = c;
	$('#GetColorDialog').modal('hide');
	table.changed = true;
	table.redraw();
}

function setRowLegendColor() {
	const c = $('#color').val();
	table.rowLegendColor = c;
	$('#GetColorDialog').modal('hide');
	table.changed = true;
	table.redraw();
}

function setColumnLegendColor() {
	const c = $('#color').val();
	table.columnLegendColor = c;
	$('#GetColorDialog').modal('hide');
	table.changed = true;
	table.redraw();
}

function setSeparatorColor() {
	const c = $('#color').val();
	table.separatorColor = c;
	$('#GetColorDialog').modal('hide');
	table.changed = true;
	table.redraw();
}

function loadData(data) {
	sync_get(data, function(text) {
		if (!table.parseTable(text)) {
			alert('Error while parsing data');
			return;
		}
		table.remove_hc();
		doLayout(window.innerWidth * 0.8, window.innerHeight * 0.8);
	});
}

function open() {
	const selectedFile = document.getElementById('fileName').files[0];
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			if (!table.parseTable(e.target.result)) {
				alert('Error in loading data.');
				return;
			}
			table.remove_hc();
			doLayout(window.innerWidth * 0.8, window.innerHeight * 0.8);
		};
	})(selectedFile);
	
	// Read in the image file as a data URL.
	reader.readAsText(selectedFile);
	$('#OpenFileDialog').modal('hide');
}

function updateUI(bChecked) {
	$('#widthRange').prop('disabled', bChecked);
	$('#widthText').prop('disabled', bChecked);
	$('#heightRange').prop('disabled', bChecked);
	$('#heightText').prop('disabled', bChecked);
}

function setGraphSize() {
	var dlg = $('#SizeDialog');
	var bChecked = dlg.find('#autoResizeCheck')[0].checked;
	
	if (bChecked) {
		doLayout(window.innerWidth * 0.8, window.innerHeight * 0.8);
		$(window).resize(function() {
			doLayout(window.innerWidth * 0.8, window.innerHeight * 0.8);
		});		
	} else {
		$(window).unbind('resize');
		doLayout(dlg.find('#widthRange').val(), dlg.find('#heightRange').val());
	}
	
	table.autoSize = bChecked;
	
	dlg.modal('hide');
}

function doLayout(w, h) {
	if (table == undefined)
		return;
	
	top_margin = ($('#navbarsMenuBar').outerHeight(true)) || top_margin || 50;
	
	//alert(top_margin);
	table.computeRowLegendWidth(w);
	table.computeColumnLegendHeight(h - top_margin);
	table.resize(w, h - top_margin);
	
	$('#graph-svg').css('left', left_margin);
	$('#graph-svg').css('top', top_margin);


	//$('#row-tree').css('left', (left_margin + table.width));
	//$('#row-tree').css('top', top_margin);
	//$('#row-tree').height(h - top_margin);

	//$('#column-tree').css('left', left_margin);
	//$('#column-tree').css('top', top_margin +  table.height);
	//$('#column-tree').width(w - left_margin);

	/*if (table.rhc != undefined) {
		table.rhc.refresh();
		table.chc.refresh();
	}*/
	
	table.refresh();
}

function display(mode) {
	table.mode = mode;
	table.redraw();
}

function weightingColumn(w) {
	table.bPonderationColonne = w;
	table.refresh();	
}

function scaleOn() {
	table.echelle = EchellePropre;
	table.refresh();
}

function scaleOff() {
	table.echelle = EchelleCommune;
	table.refresh();
}

function setTitle() {
	table.setTitle($('#txtTitle').val());
	$('#SetTitleDialog').modal('hide');
}

function exportSVG() {
	const data = table.toSVG();
	
	const blob = new Blob([data], { type: 'image/svg+xml' });
	
	const url = URL.createObjectURL(blob);
	
	const a = document.createElement('a');
	a.href = url;
	a.download = 'download.svg';
	
	const clickHandler = () => {
		setTimeout(() => {
			URL.revokeObjectURL(url);
			this.removeEventListener('click', clickHandler);
		}, 150);
	};

	a.addEventListener('click', clickHandler, false);
	
	a.click();
}


function exportPNG() {
	const canvas = document.getElementById("graph");
	ctx = canvas.getContext("2d");

	var tree_width = 0, tree_height = 0;
	if (table.rhc) {
		tree_width = table.rhc.tree.rect.center().x + NODE_SIZE/2 + 10 + 2;
		tree_height = table.chc.tree.rect.center().y + NODE_SIZE/2 + 10 + 2;
	}

	$('#graph').css('width', table.width + tree_width);
	$('#graph').css('height', table.height + tree_height);

	ctx.canvas.width = canvas.offsetWidth;
	ctx.canvas.height = canvas.offsetHeight;
	
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Title
	ctx.save();
	ctx.fillStyle = "Blue";
	ctx.font = "16px Arial";
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	ctx.fillText(table.title, table.width/2, table.margeHaut);
	ctx.restore();

	//table
	table.drawTab(ctx);
	
	//Legends
	table.drawLegends(ctx);
	
	//Values
	if (table.bAffichageValeur)
		table.drawValues(ctx);
	
	//Groups
	table.drawGroups(ctx);
	
	//draw tree
	if (table.rhc) {
		var rect = table.rect(0, table.nb_col-1);
		ctx.save();
		ctx.translate(rect.left + rect.width + 10, 0);
		table.rhc.drawCanvas(ctx);
		ctx.restore();
		
		rect = table.rect(table.nb_row-1, 0);
		ctx.save();
		ctx.translate(0, rect.top + rect.height + 10);
		table.chc.drawCanvas(ctx);
		ctx.restore();
	}

	
	var url = canvas.toDataURL("image/png");
	
	const a = document.createElement('a');
	a.href = url;
	a.download = 'download.png';
	
	const clickHandler = () => {
		setTimeout(() => {
			URL.revokeObjectURL(url);
			this.removeEventListener('click', clickHandler);
		}, 150);
	};

	a.addEventListener('click', clickHandler, false);
	a.click();
	
	//$('#graph').css('top', 50);
	$('#graph').css('width', 5);
	$('#graph').css('height', 5);
}

function deleteSelectedObject() {
	if (table.operate_mode == SelectingRowMode & table.fromRow != -1 && table.toRow != -1) {
		table.deleteRows(table.fromRow, table.toRow);
		return;
	}
	
	if (table.operate_mode == SelectingColumnMode && table.fromColumn != -1 && table.toColumn != -1) {
		table.deleteColumns(table.fromColumn, table.toColumn);
		return;
	}

	if (table.operate_mode == SelectingRowSepMode && table.fromRowSep != -1) {
		table.row_sep.deleteBefore(table.fromRowSep);
		table.fromRowSep = -1;
		table.operate_mode = NormalMode;		
		table.refresh();
		return;
	}

	if (table.operate_mode == SelectingColumnSepMode && table.fromColumnSep != -1) {
		table.col_sep.deleteBefore(table.fromColumnSep);
		table.fromColumnSep = -1;
		table.operate_mode = NormalMode;
		table.refresh();
		return;
	}
}

const hrefs = {
	'en': 'help/EN-AMADO-UserGuide-8janv2021.pdf',
	'es': 'help/Fr-Guide-AMADO-8janv2021.pdf',
	'fr': 'help/Fr-Guide-AMADO-8janv2021.pdf',
	'it': 'help/Fr-Guide-AMADO-8janv2021.pdf',
	'ru': 'help/Fr-Guide-AMADO-8janv2021.pdf',
	'uk': 'help/Fr-Guide-AMADO-8janv2021.pdf',
	'vi': 'help/EN-AMADO-UserGuide-8janv2021.pdf',
	'zh': 'help/EN-AMADO-UserGuide-8janv2021.pdf'
};

function setLanguage(lang) {
	setLanguageEx(lang);
	_paq.push(['trackEvent', 'General [main]', 'Choose Language [main]', 'Choose Language [main] ' + lang]);
}

function setLanguageEx(lang) {
	jQuery.i18n.properties({
		name: 'Messages', 
		path: 'lang/', 
		mode: 'both',
		language: lang,
		async: true,
		callback: function() {
			$('.translatable').each(function () {
				$(this).html(eval(this.id));
			});
			
			$('.languageGroup').each(function() {
				$(this).attr('src', 'icon/blank.png');
			});
			$('#image_' + lang).attr('src', 'icon/check.png');
			
			//update userguide file
			$('#menu_help_userguide_href').attr('href', hrefs[lang]);
			
			if (language != lang) {
				language = lang;
				$.cookie('language', language);
			}
		}
	});
}
