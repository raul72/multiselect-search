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
                    showSelectedList = function() {
					$list.html('');

					var vals = mss.get_selected();
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