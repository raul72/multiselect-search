/**
 * Multiselect search
 *
 * Copyright (c) 2011 Raul Raat
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
function multiselect_search(ob, settings) {
	if (!ob || !ob.nodeName || ob.nodeName.toString().toLowerCase() !== 'select' || !ob.multiple) {
		// do nothing if given element isn't multiple select
		return;
	}

	settings = settings || {};
	settings.match = settings.match || function (searchterm, item) {return !!item.match(new RegExp(searchterm, "ig"));};
	/**
	 * @see http://www.webmasterworld.com/javascript/3304115.htm
	 */
	function insertafter(newChild, refChild) {
		refChild.parentNode.insertBefore(newChild, refChild.nextSibling);
	}
	/**
	 * @see http://www.quirksmode.org/js/eventSimple.html
	 */
	function addEventSimple(obj, evt, fn) {
		if (obj.addEventListener) {
			obj.addEventListener(evt, fn, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + evt, fn);
		}
	}

	function get_list(ob) {
		var i,
			cnodes = ob.childNodes,
			list = [];
		function new_list_element(node) {
			var text = cnodes[i].innerHTML,
				new_node = document.createElement('option');

			new_node.innerHTML = text;
			new_node.selected = node.selected;

			return {
				text: text,
				o_node: node,
				n_node: new_node,
				visible: true
			};
		}
		for (i in cnodes) {
			// NOTE: For IE there is no hasOwnProperty method for childNodes
			if (!cnodes.hasOwnProperty || cnodes.hasOwnProperty(i)) {
				if (cnodes[i].nodeName && cnodes[i].nodeName.toString().toLowerCase() === 'option') {
					list[list.length] = new_list_element(cnodes[i]);
				}
			}
		}
		return list;
	}

	var list = get_list(ob),
		// container div for multiselect_search
		div = document.createElement('div'),
		// the input area to search select options
		searchbox = document.createElement('input'),
		// new select where we add/remove options form
		select = document.createElement('select'),
		last_search = '',
		ctrl_key_down = false,
		i;

	// mark ctrl key as either up or down
	// TODO: this is broken in IE atm (but workarounded in select-onchange event)
	addEventSimple(window, 'keydown', function (e) {
		var k = e.keyCode || e.which;
		if (k === 17) {
			ctrl_key_down = true;
		}
	});
	addEventSimple(window, 'keyup', function (e) {
		var k = e.keyCode || e.which;
		if (k === 17) {
			ctrl_key_down = false;
		}
	});

	function clearSelect() {
		while (select.hasChildNodes()) {
			select.removeChild(select.firstChild);
		}
	}

	function search() {
		// NOTE: don't use "this" as for IE this is window for others input element
		var term = searchbox.value,
			i;
		if (term === last_search) {
			return;
		}
		last_search = term;
		clearSelect();
		for (i in list) {
			if (list.hasOwnProperty(i)) {
				if (settings.match(term, list[i].text)) {
					select.appendChild(list[i].n_node);
					list[i].visible = true;
				} else {
					list[i].visible = false;
				}
			}
		}
	}

	searchbox.type = 'text';
	if (settings.searchbox_class) {
		searchbox.className = settings.searchbox_class;
	}
	addEventSimple(searchbox, 'keyup', search);

	select.multiple = true;
	if (ob.className) {
		select.className = ob.className;
	}
	for (i in list) {
		if (list.hasOwnProperty(i)) {
			select.appendChild(list[i].n_node);
		}
	}

	addEventSimple(select, 'change', function (e) {
		// only IE has propery ctrlKey for change event
		var i;
		if (e.ctrlKey === true || e.ctrlKey === false) {
			ctrl_key_down = e.ctrlKey;
		}
		for (i in list) {
			if (list.hasOwnProperty(i)) {
				if (!ctrl_key_down && list[i].visible == false) {
					list[i].o_node.selected = list[i].n_node.selected = false;
				} else {
					list[i].o_node.selected = list[i].n_node.selected;
				}
			}
		}
	});

	if (settings.container_id) {
		div.id = settings.container_id;
	}
	if (settings.container_class) {
		div.className = settings.container_class;
	}
	div.appendChild(searchbox);
	div.appendChild(document.createElement('br'));
	div.appendChild(select);

	ob.style.display = 'none';
	insertafter(div, ob);
}