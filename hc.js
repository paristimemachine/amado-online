const RowMode = 1;
const ColumnMode = 2;
const HEIGHT_NODE = 10;
const WIDTH_NODE  = 10;
const INTERVAL = 4;
const NODE_SIZE = 10;

const NoTree = 0;
const SimpleTree = 1;
const NormalizedTree = 2;
const Chi2Tree = 3

function doSwap(rowMode, name) {
	if (rowMode) {
		var node = table.rhc.nodes[name];
		table.rhc.swap(node);
	} else {
		var node = table.chc.nodes[name];
		table.chc.swap(node);
	}
	table.refresh();
}

function HierarchicalClustering(demandeur, transposed, nType) {
    this.tree = 0;
    this.nType = nType;
	this.Demandeur = demandeur;
	if (transposed)
		this.mode = ColumnMode;
	else
		this.mode = RowMode;

	this.distance = function(data, m, n, i, j, byRow) {
		var sum  = 0.0;
		if (byRow) //distance between row[i] and row[j]
			for (var k = 0; k < n; k++) {
				var x = data[i*n + k] - data[j*n  + k];
				sum += x*x;
			}
		else
			for (var k = 0; k < m; k++) {
				var x = data[k*n + i] - data[k*n  + j];
				sum += x*x;
			}
		return sum;
	};

	this.compute = function() {
		var m = this.Demandeur.nb_row;
		var n = this.Demandeur.nb_col;
		var data = new Array(m*n);
		
		var weight, nb_ind;
		var byRow = true;

		switch(this.nType) {
		case SimpleTree:
		case NormalizedTree:
			//Read data
        	for (var i = 0; i < m; i++)
            	for (var j = 0; j < n; j++)
                	data[i*n + j] = this.Demandeur.value(i, j);

	        //Center and normalize data
    	    for (var j = 0; j < n; j++) {
        	    var mu = 0.0;
            	for (var i = 0; i < m; i++)
                	mu += data[i*n + j];
	            mu /= m;
    	        var sigma = 0.0;
        	    if (this.nType == NormalizedTree) {
            	    for (var i = 0; i < m; i++) {
                	    var x = data[i*n + j] - mu;
                    	sigma += x*x;
                	}
                	sigma = Math.sqrt(sigma/m);
            	} else
                	sigma = 1;
                	
				//normalize
            	if (sigma != 0)
                	for (var i = 0; i < m; i++)
                    	data[i*n + j] = (data[i*n + j] - mu)/sigma;
        	}
			
        	//compute weights
        	if (this.mode == RowMode) {
            	weight = new Array(m);
	            for (var i = 0; i < m; i++) {
    	            weight[i] = 1;
            	}
	            nb_ind = m;
	            byRow = true;
        	} else {
            	weight = new Array(n);
	            for (var j = 0; j < n; j++) {
    		        weight[j] = 1;
		        }
        		nb_ind = n;
            	byRow = false;
        	}
			break;
			
		default: //CA
			//Read data
			if (this.mode == RowMode)
				for (var i = 0; i < m; i++)
					for (var j = 0; j < n; j++)
						data[i*n + j] = this.Demandeur.value(i, j);
			else { //In CA, rows and columns play a symetric role.
				var temp = m;
				m = n;
				n = temp;
				for (var i = 0; i < m; i++)
					for (var j = 0; j < n; j++)
						data[i*n + j] = this.Demandeur.value(j, i);
			}
			
			nb_ind = m;
			//compute weight of rows
			weight = new Array(m);
			for (var i = 0; i < m; i++) {
				weight[i] = 0;
				for (var j = 0; j < n; j++)
					weight[i] += data[i*n + j];

				if (weight[i] == 0) //KHANG 16/01/2020: check weight = 0
					weight[i] = 1;
			}
			//Normalize
			for (var j = 0; j < n; j++) {
				var q = 0;
				for (var i = 0; i < m; i++)
					q += data[i*n + j];

				//qDebug() << "q[" << j << "]" << q;
				if (q != 0) {
					q = Math.sqrt(q);
					for (var i = 0; i < m; i++)
						data[i*n + j] = data[i*n + j]/weight[i]/q;
				}
			}
			
			break;

		}
		
		var distances = {};
		var nodes = {};
		this.nodes = {};
	
		//init
		for (var i = 0; i < nb_ind; i++) {
			node = {'id': i,
					'order': i,
					'left': 0,
					'right': 0,
					'parent': 0,
					'n': 1,
					'level': 0
			};
			nodes['#' + i] = node;
			this.nodes['#' + i] = node;
		}
		var nb_nodes = nb_ind;

		var k = 0;
		for (var i = 0; i < nb_ind; i++) {
			for (var j = i + 1; j < nb_ind; j++) {
				var d = this.distance(data, m, n, i, j, byRow);
				distances[i + ':' + j] = {
					'first':  i,
					'second': j,
					'value': d
				};
			}
		}

		var newNode = 0;

		for (var i = 1; i < nb_ind; i++) {
			//find minimum distance;
			var min_dist = null;
			var min_key = '#-1';
			var first;
			var second;

			for (var key in distances) {
				var dist = distances[key];
				if (min_dist == null || dist.value < min_dist) {
					min_dist = dist.value;
					first = dist.first;
					second = dist.second;
					min_key = key;
				}
			}
			
			var leftNode = nodes['#' + first];
			var rightNode = nodes['#' + second];

			newNode = {
				'id': nb_nodes,
				'left':  leftNode,
				'right': rightNode,
				'parent': 0,
				'n': leftNode.n + rightNode.n,
				'level': Math.max(leftNode.level, rightNode.level) + 1
			};
			leftNode.parent = newNode;
			rightNode.parent = newNode;
			  
			delete nodes['#' + first];
			delete nodes['#' + second];

			var dij = min_dist;

			var newdist = [];

			for (var key in distances) {
				if (key != min_key) {
					var dist = distances[key];
					newdist[dist.first + ':' + dist.second] = {
						'first':  dist.first,
						'second': dist.second,
						'value':  dist.value
					};
				}
			}
			
			for (var key in nodes) {
				var node = nodes[key];
				
				var pik_1 = Math.min(leftNode.id, node.id);
				var pik_2 = Math.max(leftNode.id, node.id);


				var pjk_1 = Math.min(rightNode.id, node.id);
				var pjk_2 = Math.max(rightNode.id, node.id);


				var dik = distances[pik_1 + ':' + pik_2].value;
				var djk = distances[pjk_1 + ':' + pjk_2].value;
				
				
				var d = (leftNode.n + node.n)*dik/(newNode.n + node.n) +
						   (rightNode.n + node.n)*djk/(newNode.n + node.n) -
							node.n*dij/(newNode.n + node.n);

							
				delete newdist[pik_1 + ':' + pik_2];
				delete newdist[pjk_1 + ':' + pjk_2];
				
				newdist[node.id + ':' + newNode.id] = {
					'first':  node.id,
					'second': newNode.id,	
					'value' : d
				};
				
			}
			nodes['#' + newNode.id] = newNode;
			this.nodes['#' + newNode.id] = newNode;
			nb_nodes++;


			distances = newdist;
		}

		this.tree = newNode;
		this.order();
	};

	this.order = function() {
	
		var leaves = [];
		this.getLeaves(this.tree, leaves);

		this.list = [];
		for (var i = 0; i < leaves.length; i++)
			this.list[leaves[i].order] = i;

		//after sort
		for (var i = 0; i < leaves.length; i++)
			leaves[i].order = i;
	};

	this.getLeaves = function(node, list) {
	
		if (node == 0)
			return;
		if (node.left == 0 && node.right == 0) {
			list.push(node);
		}
		this.getLeaves(node.left, list);
		this.getLeaves(node.right, list);
	
	};
	
	//swap two children of the node 'node'
	this.swap = function(node) {
		if (node.left != 0 && node.right != 0) {		
			var tmp = node.left;
			node.left = node.right;
			node.right = tmp;
			this.order();
			if (this.mode == RowMode)
				this.Demandeur.sortRows(this.list);
			else
				this.Demandeur.sortColumns(this.list);						
		}
	};

	this.refresh = function() {
		this.computePosition();		
	};
	
	this.computePosition = function(node) {
		if (node == undefined) {
			if (this.tree != undefined) {
				this.computePosition(this.tree);
			}
			return;
		}

		if (node == 0)
			return;
			
		if (node.left == 0 && node.right == 0) { //leaf node
			if (this.mode == RowMode) {
				var rect = this.Demandeur.getRowRect(node.order).clone();
				rect.left = 0;
				rect.top  = rect.bottom() - HEIGHT_NODE; 
				rect.width = WIDTH_NODE;
				rect.height = HEIGHT_NODE;
				node.rect = rect;
			} else {
				var rect = this.Demandeur.getColumnRect(node.order).clone();
				rect.top = 0;
				rect.height = HEIGHT_NODE;
				node.rect = rect;
			}
			return;
		}
		
		//interal node
		this.computePosition(node.left);
		
		this.computePosition(node.right);
	
		if (this.mode == RowMode) {
			var left = Math.max(node.left.rect.right(), node.right.rect.right()) + INTERVAL;
			var top = node.left.rect.top;
			var bottom = node.right.rect.bottom();
			node.rect = new Rect(left, top, WIDTH_NODE, bottom - top);
		} else {
			var top = Math.max(node.left.rect.bottom(), node.right.rect.bottom()) + INTERVAL;
			var left = node.left.rect.left;
			var right = node.right.rect.right();
			node.rect = new Rect(left, top, right - left, HEIGHT_NODE);
		}
	};
	
	
	this.drawTree = function(node) {
		if (node == undefined)
			return this.drawTree(this.tree);
			
		if (node == 0)
			return '';
			
		var result = '';
		if (node.left != 0 && node.right != 0) {
			if (this.mode == RowMode) {
				result += '<div style="background-color:red;position:absolute;left:' + node.left.rect.center().x + 'px' +
								 ';top:' + node.left.rect.center().y + 'px' +
								 ';width:' +  (node.rect.center().x - node.left.rect.center().x) + 'px' +
								 ';height:1px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.rect.center().x + 'px' +
								 ';top:' + node.left.rect.center().y + 'px' +
								 ';width:1' + 'px' +
								 ';height:' + (node.rect.center().y - node.left.rect.center().y) + 'px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.right.rect.center().x + 'px' +
								 ';top:' + (node.right.rect.center().y) + 'px' +
								 ';width:' +  (node.rect.center().x - node.right.rect.center().x) + 'px' +
								 ';height:1px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.rect.center().x + 'px' +
								 ';top:' + node.rect.center().y + 'px' +
								 ';width:1' + 'px' +
								 ';height:' + (node.right.rect.center().y - node.rect.center().y + 1) + 'px"></div>';
								  //hack + 1
			} else {
				result += '<div style="background-color:red;position:absolute;left:' + node.left.rect.center().x + 'px' +
								 ';top:' + node.left.rect.center().y + 'px' +
								 ';width:1' + 'px' +
								 ';height:' + (node.rect.center().y - node.left.rect.center().y) + 'px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.left.rect.center().x + 'px' +
								 ';top:' + node.rect.center().y + 'px' +
								 ';width:' + (node.rect.center().x - node.left.rect.center().x) + 'px' +
								 ';height:' + 1 + 'px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.right.rect.center().x + 'px' +
								 ';top:' + (node.right.rect.center().y) + 'px' +
								 ';width:' +  1 + 'px' +
								 ';height:' + (node.rect.center().y - node.right.rect.center().y) + 'px"></div>';

				result += '<div style="background-color:red;position:absolute;left:' + node.rect.center().x + 'px' +
								 ';top:' + node.rect.center().y + 'px' +
								 ';width:' + (node.right.rect.center().x - node.rect.center().x + 1) + 'px' +
								 ';height:' + 1 + 'px"></div>';
			}
			
		}
		var content = '<a href="javascript:doSwap(' + (this.mode == RowMode) + ',' + ("'#" + node.id + "'") + ');">' +
						'<div style="-webkit-border-radius: 5px;' + 
							'-moz-border-radius: 5px;' +
							'-o-border-radius: 5px;' +
							'-ms-border-radius: 5px;' +
							'-khtml-border-radius: 5px;' +
							'border-radius: 5px;' +
							'background-color:red;width:100%;height:100%"></div></a>';
		
		result += '<div style="-webkit-border-radius: 2px;' + 
							'-moz-border-radius: 2px;' +
							'-o-border-radius: 2px;' +
							'-ms-border-radius: 2px;' +
							'-khtml-border-radius: 2px;' +
							'border-radius: 2px;' +
							'background-color:gray;position:absolute;left:' + (node.rect.center().x - NODE_SIZE/2) + 'px' +
						 ';top:' + (node.rect.center().y - NODE_SIZE/2)  + 'px' +
						 ';width:' + NODE_SIZE + 'px' +
						 ';height:' + NODE_SIZE + 'px">' + content + '</div>';

		return 	result +
				this.drawTree(node.left) + 
				this.drawTree(node.right);
	};
	
	
	
	this.drawCanvas = function(ctx, node) {
		if (node == undefined)
			return this.drawCanvas(ctx, this.tree);
			
		if (node == 0)
			return;
			
		ctx.fillStyle = ctx.strokeStyle = 'red';

		if (node.left != 0 && node.right != 0) {
			if (this.mode == RowMode) {
				ctx.beginPath();
				ctx.moveTo(node.left.rect.center().x, node.left.rect.center().y);
				ctx.lineTo(node.rect.center().x, node.left.rect.center().y);
				ctx.lineTo(node.rect.center().x, node.right.rect.center().y);
				ctx.lineTo(node.right.rect.center().x, node.right.rect.center().y);
				ctx.stroke();
			} else {
				ctx.beginPath();
				ctx.moveTo(node.left.rect.center().x, node.left.rect.center().y);
				ctx.lineTo(node.left.rect.center().x, node.rect.center().y);
				ctx.lineTo(node.right.rect.center().x, node.rect.center().y);
				ctx.lineTo(node.right.rect.center().x, node.right.rect.center().y);
				ctx.stroke();
			}
		}
		
		this.drawCanvas(ctx, node.left);
		this.drawCanvas(ctx, node.right);

		ctx.fillRect((node.rect.center().x - NODE_SIZE/2), (node.rect.center().y - NODE_SIZE/2),
					NODE_SIZE, NODE_SIZE);
	};
	
	this.remove = function() {
		this.tree = 0;
	};
}
