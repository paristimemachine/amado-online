HierarchicalClustering.prototype.toSVG = function(node) {
	if (node == undefined)
		return this.toSVG(this.tree);
		
	if (node == 0)
		return '';
		
	var result = '';
	
	if (node.left != 0 && node.right != 0) {
		if (this.mode == RowMode) {
			result += '<rect style="fill:red;" ' +
							'x="' + node.left.rect.center().x + '" ' +
							'y="' + node.left.rect.center().y + '" ' +
							'width="' +  (node.rect.center().x - node.left.rect.center().x) + '" ' +
							'height="1"/>';

			result += '<rect style="fill:red;" ' +
							'x="' + node.rect.center().x + '" ' +
							'y="' + node.left.rect.center().y + '" ' +
							'width="1" ' +
							'height="' + (node.rect.center().y - node.left.rect.center().y) + '"/>';

			result += '<rect style="fill:red;" ' +
							'x="' + node.right.rect.center().x + '" ' +
							'y="' + (node.right.rect.center().y) + '" ' +
							'width="' +  (node.rect.center().x - node.right.rect.center().x) + '" ' +
							'height="1"/>';

			result += '<rect style="fill:red" ' +
							'x="' + node.rect.center().x + '" ' +
							'y="' + node.rect.center().y + '" ' +
							'width="' + 1 + '" ' +
							'height="' + (node.right.rect.center().y - node.rect.center().y + 1) + '"/>';
							  //hack + 1
		} else {
			result += '<rect style="fill:red;" ' +
							'x="' + node.left.rect.center().x + '" ' +
							'y="' + node.left.rect.center().y + '" ' +
							'width="' + 1 + '" ' +
							'height="' + (node.rect.center().y - node.left.rect.center().y) + '"/>';

			result += '<rect style="fill:red;" ' +
							'x="' + node.left.rect.center().x + '" ' +
							'y="' + node.rect.center().y + '" ' +
							'width="' + (node.rect.center().x - node.left.rect.center().x) + '" ' +
							'height="' + 1 + '"/>';

			result += '<rect style="fill:red;" ' +
							'x="' + node.right.rect.center().x + '" ' +
							'y="' + (node.right.rect.center().y) + '" ' +
							'width="' +  1 + '" ' +
							'height="' + (node.rect.center().y - node.right.rect.center().y) + '"/>';

			result += '<rect style="fill:red;" ' +
							'x="' + node.rect.center().x + '" ' +
							'y="' + node.rect.center().y + '" ' +
							'width="' + (node.right.rect.center().x - node.rect.center().x + 1) + '" ' +
							'height="' + 1 + '"/>';
							//hack + 1
		}
		
	}
	
	/*var content = '<a href="javascript:doSwap(' + (this.mode == RowMode) + ',' + ("'#" + node.id + "'") + ');">' +
					'<divect style="-webkit-border-radius: 5px;' + 
						'-moz-border-radius: 5px;' +
						'-o-border-radius: 5px;' +
						'-ms-border-radius: 5px;' +
						'-khtml-border-radius: 5px;' +
						'border-radius: 5px;' +
						'backgroundill-color:red;width:100%;height:100%"></div></a>';
	*/
	result += '<a xlink:href="javascript:doSwap(' + (this.mode == RowMode) + ',' + ("'#" + node.id + "'") + ');">';

	result += '<rect style="-webkit-border-radius: 2px;' + 
						'-moz-border-radius: 2px;' +
						'-o-border-radius: 2px;' +
						'-ms-border-radius: 2px;' +
						'-khtml-border-radius: 2px;' +
						'border-radius: 2px;' +
						'fill:gray;position:absolute;" ' +
						'x="' + (node.rect.center().x - NODE_SIZE/2) + '" ' +
					 	'y="' + (node.rect.center().y - NODE_SIZE/2)  + '" ' +
					 	'width="' + NODE_SIZE + '" ' +
					 	'height="' + NODE_SIZE + '">' + '' + '</rect>';

	result += '<circle style="-webkit-border-radius: 2px;' + 
						'-moz-border-radius: 2px;' +
						'-o-border-radius: 2px;' +
						'-ms-border-radius: 2px;' +
						'-khtml-border-radius: 2px;' +
						'border-radius: 2px;' +
						'fill:red;position:absolute;" ' +
						'cx="' + (node.rect.center().x) + '" ' +
					 	'cy="' + (node.rect.center().y)  + '" ' +
					 	'r="' + NODE_SIZE/2 + '">' + '' + '</circle></a>';

	return 	result +
			this.toSVG(node.left) + 
			this.toSVG(node.right);
}