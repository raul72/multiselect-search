/**
 * Multiselect search
 *
 * Copyright (c) 2011 Raul Raat
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function(){
	var reg_space = /\s+/,
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
			obj.attachEvent('on' + evt, function(){
				fn.call(obj, window.event);
			});
		}
	}

	function removeClass(ob, className) {
		if (!ob || !ob.className) {
			return;
		}
		var c = (ob.className || "").split(reg_space),
			nc = [],
			i;
		for (i = 0; i < c.length; i++) {
			if (c[i] != className) {
				nc.push(c[i]);
			}
		}
		ob.className = nc.join(' ');
	}

	default_settings = {
		match: match,
		searchbox_class: null,
		container_id: null,
		container_class: null,
		onchange: null,
		inherit_size: true,
		searchbox: null,
		delay: 200,
		select_class: '',
		option_class: 'mss_option',
		selected_option_class: 'selected'
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
	};

	window.multiselect_search = function (ob, settings) {
		var last_clicked = null;

		if (!ob || !ob.nodeName || ob.nodeName.toString().toLowerCase() !== 'select' || !ob.multiple) {
			// do nothing if given element isn't multiple select
			return false;
		}

		settings = settings || {};
		settings = config_merge(default_settings, settings);

		function shiftclick(s, e) {
			if (s > e) {
				return;
			}
			var i;
			for (i = s; i <= e; i++) {
				if (list[i].visible) {
					list[i].changeState(true, false);
				}
			}
		}

		function get_list(ob) {
			var i,
				cnodes = ob.childNodes,
				list = [],
				selected_option_class = settings.selected_option_class;
			function new_list_element(node, uid) {
				var text = cnodes[i].innerHTML,
					new_node = document.createElement('div');

				function changeState(to, triggerEvent) {
					to = to !== false;
					triggerEvent = triggerEvent !== false;
					if (to) {
						node.selected = true;
						new_node.className = new_node.className + ' ' + selected_option_class;
					} else {
						removeClass(new_node, selected_option_class);
						node.selected = false;
					}
					if (triggerEvent) {
						if (settings.onchange) {
							settings.onchange();
						}
					}
				}

				new_node.innerHTML = text;
				new_node.unselectable = 'on';
				new_node.className = settings.option_class + (node.selected ? ' ' + selected_option_class : '');
				new_node.onclick = function(e) {
					e = e || window.event;
					if (node.selected) {
						changeState(false, false);
					} else {
						changeState(true, false);
					}
					if (e.shiftKey && last_clicked !== null) {
						if (uid < last_clicked) {
							shiftclick(uid, last_clicked);
						} else {
							shiftclick(last_clicked, uid);
						}
					}
					last_clicked = uid;
					if (settings.onchange) {
						settings.onchange();
					}
				};
				return {
					uid: uid,
					text: text,
					o_node: node,
					n_node: new_node,
					visible: true,
					changeState: changeState
				};
			}
			for (i in cnodes) {
				// NOTE: For IE there is no hasOwnProperty method for childNodes
				if (!cnodes.hasOwnProperty || cnodes.hasOwnProperty(i)) {
					if (cnodes[i].nodeName && cnodes[i].nodeName.toString().toLowerCase() === 'option') {
						list[list.length] = new_list_element(cnodes[i], list.length);
					}
				}
			}
			return list;
		}

		var list = get_list(ob),
			div,
			searchbox,
			select,
			last_search = '',
			i,
			instance = {},
			timeout;

		function get_selected() {
			var r = [], i;
			for (i in list) {
				if (list.hasOwnProperty(i) && list[i].o_node.selected) {
					r[r.length] = {
						text: list[i].text,
						changeState: list[i].changeState
					};
				}
			}
			return r;
		}

		function search(term) {
			clearTimeout(timeout);
			timeout = setTimeout(function(){__search(term);}, settings.delay);
		}

		function __search(term) {
			term = term || '';
			var	i;
			if (term === last_search) {
				return;
			}
			last_search = term;

/* - :selected
			if (term == ':selected') {
				for (i in list) {
					if (list.hasOwnProperty(i)) {
						if (list[i].o_node.selected) {
							if (!list[i].visible) {
								list[i].n_node.style.display = 'block';
							}
							list[i].visible = true;
						} else if (list[i].visible) {
							list[i].n_node.style.display = 'none';
							list[i].visible = false;
						}
					}
				}
				select.scrollTop = 0;
				return;
			}
*/

			for (i in list) {
				if (list.hasOwnProperty(i)) {
					if (!term || settings.match(term, list[i].text)) {
						if (!list[i].visible) {
							list[i].n_node.style.display = 'block';
						}
						list[i].visible = true;
					} else if (list[i].visible) {
						list[i].n_node.style.display = 'none';
						list[i].visible = false;
					}
				}
			}
			select.scrollTop = 0;
		}

		// container div
		div = document.createElement('div');
		if (settings.container_id) {
			div.id = settings.container_id;
		}
		if (settings.container_class) {
			div.className = settings.container_class;
		}

		// searchbox
		if (settings.searchbox) {
			searchbox = settings.searchbox;
		} else {
			searchbox = document.createElement('input');
			searchbox.type = 'text';
			if (settings.searchbox_class) {
				searchbox.className = settings.searchbox_class;
			}
			div.appendChild(searchbox);
			div.appendChild(document.createElement('br'));
		}

		addEventSimple(searchbox, 'keyup', function(){search(searchbox.value);});
		// NOTE: paste event doesn't work in Opera and FF < 3.0
		// http://www.quirksmode.org/dom/events/cutcopypaste.html#t03
		addEventSimple(searchbox, 'paste', function(){search(searchbox.value);});


		// duplicated multiselect
		select = document.createElement('div');

		if (settings.inherit_size) {
			select.style.width = parseInt(ob.offsetWidth, 10) + 'px';
			select.style.height = parseInt(ob.offsetHeight, 10) + 'px';
		}

		if (settings.select_class) {
			select.className = settings.select_class;
		} else if (ob.className) {
			select.className = ob.className;
		}
		for (i in list) {
			if (list.hasOwnProperty(i)) {
				select.appendChild(list[i].n_node);
			}
		}

		div.appendChild(select);

		//ob.style.display = 'none';
		insertafter(div, ob);

		instance.get_selected = get_selected;
		instance.get_selected_values = function() {
			// legacy
			var list = get_selected(), vals = [], i;
			for (i = 0; i < list.length; i++) {
				vals[i] = list[i].text;
			}
			return vals;
		};
		instance.container_node = div;
		instance.searchbox_node = searchbox;
		instance.select_node = select;
		instance.search = search;
		instance.changeState = function(to) {
			var i;
			for (i = 0; i < list.length; i++) {
				if (list[i].visible) {
					list[i].changeState(to);
				}
			}
		};

		return instance;
	}
})();
