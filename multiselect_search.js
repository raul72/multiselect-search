/**
 * Multiselect search
 *
 * Copyright (c) 2011 Raul Raat
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function(){
	var ctrl_key_down = false,
		cmd_key_down = false,
		initialized = false,
		last_match,
		last_regexp,
		default_settings;

	function match(searchterm, item) {
		if (last_match != searchterm) {
			last_regexp = new RegExp(searchterm, "i");
			last_match = searchterm;
		}
		return !!item.match(last_regexp);
	}

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

	function init() {
		// mark ctrl key as either up or down
		addEventSimple(document, 'keydown', function (e) {
			var k = e.keyCode || e.which;
			if (k === 17) {
				ctrl_key_down = true;
			}
			if (k === 91) {
				cmd_key_down = true;
			}
		});
		addEventSimple(document, 'keyup', function (e) {
			var k = e.keyCode || e.which;
			if (k === 17) {
				ctrl_key_down = false;
			}
			if (k === 91) {
				cmd_key_down = false;
			}
		});
	}

	default_settings = {
		match: match,
		searchbox_class: null,	
		container_id: null,	
		container_class: null,	
		onchange: null	
	};

	function config_merge(old, newc) {
		var i, out = {};
		for (i in old) {
			if (old.hasOwnProperty(i)) {
				if (typeof newc[i] === 'undefined') {
					out[i] = old[i];
				} else {
					out[i] = newc[i];
				}
			}		
		}
		return out;
	}

	window.multiselect_search_defaults = function(settings) {
		default_settings = config_merge(default_settings, settings);
	}

	window.multiselect_search = function (ob, settings) {
		if (!ob || !ob.nodeName || ob.nodeName.toString().toLowerCase() !== 'select' || !ob.multiple) {
			// do nothing if given element isn't multiple select
			return false;
		}

		if (!initialized) {
			init();
			initialized = true;
		}

		settings = settings || {};
		settings = config_merge(default_settings, settings);

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
			i,
			instance = {};

		function get_selected_values() {
			var r = [], i;
			for (i in list) {
				if (list.hasOwnProperty(i) && list[i].o_node.selected) {
					r[r.length] = list[i].text;
				}
			}
			return r;
		}

		function search() {
			// NOTE: don't use "this" as for IE this is window for others input element
			var term = searchbox.value,
				i,
				last_node = null;
			if (term === last_search) {
				return;
			}
			last_search = term;

			for (i in list) {
				if (list.hasOwnProperty(i)) {
					if (!term || settings.match(term, list[i].text)) {
						if (!list[i].visible) {
							if (last_node === null) {
								select.insertBefore(list[i].n_node, select.firstChild);
							} else {
								insertafter(list[i].n_node, last_node)
							}
						}
						list[i].visible = true;
						last_node = list[i].n_node;
					} else if (list[i].visible) {
						select.removeChild(list[i].n_node);
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
			var i;
			for (i in list) {
				if (list.hasOwnProperty(i)) {
					if (!(ctrl_key_down || cmd_key_down) && list[i].visible == false) {
						list[i].o_node.selected = list[i].n_node.selected = false;
					} else {
						list[i].o_node.selected = list[i].n_node.selected;
					}
				}
			}
			if (settings.onchange) {
				settings.onchange();
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

		instance.get_selected_values = get_selected_values;
		instance.container_node = div;
		instance.searchbox_node = searchbox;
		instance.select_node = select;
		
		return instance;
	}
})();
