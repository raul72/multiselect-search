/*! Multiselect Search - v0.0.1 - 2012-07-20
* https://github.com/raul72/multiselect-search
* Copyright (c) 2012 raul; Licensed MIT, GPL */

/**
 * Multiselect search
 *
 * Copyright (c) 2011 Raul Raat
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function () {
	var reg_space = /\s+/,
		last_match,
		last_regexp,
		default_settings;

	function match(searchterm, item) {
		if (last_match !== searchterm) {
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
			obj.attachEvent('on' + evt, function () {
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
			if (c[i] !== className) {
				nc.push(c[i]);
			}
		}
		ob.className = nc.join(' ');
	}

	/**
	 * get <option> nodes for html <select> element
	 * @param HTMLSelectElement
	 * @return array list of HTMLOptionElements
	 */
	function getSelectOptions(ob) {
		var i, nodes, nodename, options = [];
		nodes = ob.childNodes;
		for (i in nodes) {
			if (nodes[i].nodeName) {
				nodename = nodes[i].nodeName.toString().toLowerCase();
				if (nodename === 'option') {
					options[options.length] = nodes[i];
				} else if (nodename === 'optgroup') {
					options = options.concat(getSelectOptions(nodes[i]));
				}
			}
		}
		return options;
	}

	/**
	 * fetches options from HTMLSelectElement, creates div nodes
	 * returns list as array where each value is an options with params:
	 * - uid - int - Unique ID, also the key
	 * - text - string - human readable value (option InnerHtml)
	 * - o_node - HTMLOptionElement - the original option
	 * - n_node - HTMLDivElement - the copy of the option
	 * - visible - boolean - is the option currently visible or hidden
	 * - changeState - function ([to = true, [triggerEvent = true]]) - change option selected state
	 * --- to - true to selected, false to deselected
	 * --- triggerEvent - trigger settings.onchange event if it is defined
	 */
	function getOptions(ob, settings) {
		var i,
			optionNodes = getSelectOptions(ob),
			options = [],
			active_option;

		// called out if option is clicked with shiftKey down
		// will change selected status of all the options from last clicked option
		// to currently clicked option to what the selected status of last clicked option
		function shiftClick(obj) {
			if (!active_option) {
				return;
			}
			var start, end, i, new_status = active_option.o_node.selected;
			if (obj.uid < active_option.uid) {
				start = obj.uid;
				end = active_option.uid;
			} else {
				start = active_option.uid;
				end = obj.uid;
			}
			if (start !== end) {
				for (i = start; i <= end; i++) {
					if (options[i].visible) {
						options[i].changeState(new_status, false);
					}
				}
			}
		}
		function create_optionObj(o_node, uid) {
			var n_node = document.createElement('div'),
				optionObj = {
					uid: uid,
					text: o_node.innerHTML,
					o_node: o_node,
					n_node: n_node,
					visible: true,
					show: function () {
						n_node.style.display = 'block';
					},
					hide: function () {
						n_node.style.display = 'none';
					}
				};

			optionObj.changeState = function (to, triggerEvent) {
				to = to !== false;
				triggerEvent = triggerEvent !== false;
				if (to) {
					o_node.selected = true;
					n_node.className = n_node.className + ' ' + settings.selected_option_class;
				} else {
					removeClass(n_node, settings.selected_option_class);
					o_node.selected = false;
				}
				if (triggerEvent) {
					if (settings.onchange) {
						settings.onchange();
					}
				}
			};

			n_node.innerHTML = optionObj.text;
			n_node.unselectable = 'on';
			n_node.className = settings.option_class + (o_node.selected ? ' ' + settings.selected_option_class : '');
			n_node.onclick = function (e) {
				e = e || window.event;
				if (o_node.selected) {
					optionObj.changeState(false, false);
				} else {
					optionObj.changeState(true, false);
				}
				if (active_option) {
					removeClass(active_option.n_node, 'active');
					if (e.shiftKey) {
						shiftClick(optionObj);
					}
				}
				active_option = optionObj;
				n_node.className = n_node.className + ' active';
				if (settings.onchange) {
					settings.onchange();
				}
			};
			return optionObj;
		}
		for (i in optionNodes) {
			if (optionNodes.hasOwnProperty(i)) {
				options[options.length] = create_optionObj(optionNodes[i], options.length);
			}
		}
		return options;
	}

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

	window.multiselect_search_defaults = function (settings) {
		default_settings = config_merge(default_settings, settings);
	};

	default_settings = {
		match: match,
		searchbox_class: null,
		container_id: null,
		container_class: null,
		onchange: null,
		inherit_size: true,
		searchbox_inherit_size: false,
		searchbox: null,
		delay: 200,
		select_class: 'mss',
		option_class: 'mss_option',
		selected_option_class: 'selected'
	};

	window.multiselect_search = function (ob, settings) {

		if (!ob || !ob.nodeName || ob.nodeName.toString().toLowerCase() !== 'select' || !ob.multiple) {
			// do nothing if given element isn't multiple select
			return false;
		}

		settings = config_merge(default_settings, settings || {});

		var list = getOptions(ob, settings),
			div,
			searchbox,
			select,
			last_search = '',
			i,
			instance = {},
			timeout;

		if (!list.length) {
			return;
		}

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
			timeout = setTimeout(function () {__search(term); }, settings.delay);
		}

		function __search(term, forced) {
			term = term || '';
			forced = forced === true;
			var	i, m;
			if (term === last_search && !forced) {
				return;
			}
			last_search = term;

			for (i in list) {
				if (list.hasOwnProperty(i)) {
					m = settings.match.call(instance, term, list[i].text);
					if (m === -1) {
						continue;
					}
					if (!term || m) {
						if (!list[i].visible) {
							list[i].show();
						}
						list[i].visible = true;
					} else if (list[i].visible) {
						list[i].hide();
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

		addEventSimple(searchbox, 'keyup', function () {search(searchbox.value); });
		// NOTE: paste event doesn't work in Opera and FF < 3.0
		// http://www.quirksmode.org/dom/events/cutcopypaste.html#t03
		addEventSimple(searchbox, 'paste', function () {search(searchbox.value); });


		// duplicated multiselect
		select = document.createElement('div');

		if (settings.inherit_size) {
			select.style.width = parseInt(ob.offsetWidth, 10) + 'px';
			select.style.height = parseInt(ob.offsetHeight, 10) + 'px';
		}
		if (settings.searchbox_inherit_size) {
			searchbox.style.width = parseInt(ob.offsetWidth, 10) + 'px';
		}

		if (settings.select_class) {
			select.className = settings.select_class;
		}
		for (i in list) {
			if (list.hasOwnProperty(i)) {
				select.appendChild(list[i].n_node);
			}
		}

		div.appendChild(select);

		ob.style.display = 'none';
		insertafter(div, ob);

		instance.get_selected = get_selected;
		instance.get_selected_values = function () {
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
		instance.onchange = function (method) {
			if (typeof settings.onchange !== 'function') {
				settings.onchange = method;
				return;
			}
			var old = settings.onchange;
			settings.onchange = function () {
				old();
				method();
			};
		};
		instance.changeState = function (to, visibleOnly) {
			var i;
			visibleOnly = visibleOnly === true;
			for (i = 0; i < list.length; i++) {
				if (!visibleOnly || list[i].visible) {
					list[i].changeState(to, false);
				}
			}
			if (settings.onchange) {
				settings.onchange();
			}
		};
		instance.showSelected = function () {
			var i, selected = [], visble = [];
			for (i = 0; i < list.length; i++) {
				if (list[i].o_node.selected) {
					selected[selected.length] = list[i].uid;
				}
				if (list[i].visible) {
					visble[visble.length] = list[i].uid;
				}
			}
			if (selected.join() === visble.join()) {
				// already showing selected, do search
				__search(searchbox.value, true);
				return;
			}

			// TODO: this largely duplicates contents of __search method
			for (i in list) {
				if (list.hasOwnProperty(i)) {
					if (list[i].o_node.selected) {
						if (!list[i].visible) {
							list[i].show();
						}
						list[i].visible = true;
					} else if (list[i].visible) {
						list[i].hide();
						list[i].visible = false;
					}
				}
			}
			select.scrollTop = 0;
		};
		return instance;
	};
})();

(function($){
	/**
	 * jQuery plugin for multiselect_search
	 *
	 * @param options {selectAllLinks: false,showSelectedLink: false,showSelectedList: false}
	 * @param mss_config - config passed on to multiselect_search
	 */
	$.fn.mss = function(options, mss_config) {
		var settings = {
				selectAllLinks: false,
				showSelectedLink: false,
				showSelectedList: false
			};
		$.extend(settings, options);

		this.each(function() {

			var mss = multiselect_search(this, mss_config);
			if (!mss) {
				return;
			}

			if (!settings.selectAllLinks && !settings.showSelectedLink && !settings.showSelectedList) {
				return;
			}

			var $footer = $('<span/>').addClass('mss_footer').appendTo(mss.container_node);

			if (settings.selectAllLinks) {
				$('<a/>')
					.html('select all')
					.attr('href', '#')
					.click(function(){
						mss.changeState(true, true);
						return false;
					})
					.appendTo($footer);

				$('<span/>').html(' | ').appendTo($footer);

				$('<a/>')
					.html('select none')
					.attr('href', '#')
					.click(function(){
						mss.changeState(false, true);
						return false;
					})
					.appendTo($footer);

				if (settings.showSelectedLink) {
					$('<span/>').html(' | ').appendTo($footer);
				}
			}
			if (settings.showSelectedLink) {
				$('<a/>')
					.html('show selected')
					.attr('href', '#')
					.click(function(){
						mss.showSelected();
						return false;
					})
					.appendTo($footer);
			}
			if (settings.showSelectedList) {
				var $list = $('<div/>').appendTo($footer),
				showSelectedList = function () {
					$list.html('');

					var vals = mss.get_selected(),
						i;
					if (!vals.length) {
						return;
					}
					$list.append('Selected Items:');

					$.each(vals, function(i) {
						var opt = this;
						$list.append(' ' + this.text + ' (');
						$list.append(
							$('<a/>')
								.html('x')
								.attr('href', '#')
								.click(function(){
									opt.changeState(false);
									return false;
							})
						);
						$list.append(')' + (i + 1 < vals.length ? ',' : ''));
					});
				};
				showSelectedList();
				mss.onchange(showSelectedList);
			}
		});
	};
})(jQuery);