/*UndoAction*/

var undoStack = [];
var redoStack = [];

function SetTableAction(table) {
	this.nb_row = table.nb_row;
	this.nb_col = table.nb_col;
	
	this.data = new Array(this.nb_row * this.nb_col);

	for (var i = 0; i < this.data.length; i++)
		this.data[i] = table.data[i];
		
	this.row_sep = table.row_sep.clone();
	this.col_sep = table.col_sep.clone();
		
	this.col_info = new Array(this.nb_col);
	this.row_info = new Array(this.nb_row);

	for (var j = 0; j < this.nb_col; j++)
		this.col_info[j] = table.col_info[j].clone();

	for (var i = 0; i < this.nb_row; i++)
		this.row_info[i] = table.row_info[i].clone();
		
	this.title = table.title;
	this.treeType = table.treeType;
	
	this.execute = function() {
		table.init(this.nb_row, this.nb_col);

		//copy
		for (var i = 0; i < this.data.length; i++)
			table.data[i] = this.data[i];
			
		table.row_sep = this.row_sep.clone();
		table.col_sep = this.col_sep.clone();
		
		for (var j = 0; j < this.nb_col; j++)
			table.col_info[j] = this.col_info[j].clone();

		for (var i = 0; i < this.nb_row; i++)
			table.row_info[i] = this.row_info[i].clone();
		
		table.title = this.title;
		table.treeType = this.treeType;
		 
		if (table.treeType == NoTree) {
			table.remove_hcExecute();
		} else {
			table.hcExecute(table.treeType);
		}
		
		table.computeRowLegendWidth();
		table.computeColumnLegendHeight();
		table.refresh();
	};
	
	this.createUndoAction = function(table) {
		return new SetTableAction(table);
	};
	
	this.createRedoAction = function(table) {
		return new SetTableAction(table);
	};
}

function SetTitleAction(table) {
	this.title = table.title;

	this.execute = function() {
		table.title = this.title;
		table.redraw();
	};
	
	this.createUndoAction = function(table) {
		return new SetTitleAction(table);
	}
	
	this.createRedoAction = function(table) {
		return new SetTitleAction(table);
	}
}

function pushUndoAction(undoer) {
	redoStack = [];
	if (undoStack.length >= 50) {
		undoStack.shift();
	}
	
	undoStack.push(undoer);
}

function undo() {
	if (undoStack.length == 0) {
		alert(message_nothing_to_undo);
		return;
	}
	var undoer = undoStack.pop();
	
	redoStack.push(undoer.createRedoAction(table));
	
	undoer.execute();
}

function redo() {
	if (redoStack.length == 0) {
		alert(message_nothing_to_redo);
		return;
	}
	var redoer = redoStack.pop();
	
	undoStack.push(redoer.createUndoAction(table));

	redoer.execute();
}