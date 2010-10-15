/*
 * 地区信息读取插件，功能如下：
 * 1、异步加载地区列表
 * 2、根据指定地区ID加载
 * @author 咖啡兔
 * @site   www.wsria.cn
 */
(function($){
    $.fn.area = function(settings){
		
		// 内部对象
		var _this = this;
		
		// 获取应用名称
		function getCtx() {
			var url = location.pathname;
			var contextPath = url.substr(0, url.indexOf('/', 1));
			return contextPath;
		};
	
		/* 默认参数 */
        var defaults = {
			// 数据源
			url : getCtx() + '/area/area-info!findArea.action',
			// 直接读取生成好的HTML代码路径
			fromHtmlUrl : getCtx() + '/area/area-info!generateSelectHtmlCode.action',
			topLevel : 1, // 最高级别标示
			defaultValue : null, // 默认值
			layer : null, // 加载地区的级别，默认全部加载
			attrs : {}, // 属性集合
			callback : null // 没加载完一级后回调，有默认值加载时只调用一次
		};
        
        /* 合并默认参数和用户自定义参数  */
        settings = $.extend(true, defaults, settings);
		
		/**
		 * 插件初始化
		 */
		function _plugin_init() {
			if ($.isFunction(settings.defaultValue)){
				settings.defaultValue = settings.defaultValue();
			}
		};
		_plugin_init();
		
		/**
		 * 设置默认值
		 */
		function setDefaultValue() {
			if (settings.defaultValue) {
				$(_this).html('<span>正在加载……</span>').load(settings.fromHtmlUrl, {
					childId : settings.defaultValue
				}, function() {
					$('span', this).remove();
					$('select', _this).attr(settings.attrs).bind('change', loadChilds);
					if ($.isFunction(settings.callback)) {
						settings.callback();
					}
				});
			}
		};
		
		/**
		 * 加载下级地区
		 */
		function loadChilds(options) {
			
			// 检查设置的级别
			if (settings.layer && settings.layer == $('select', _this).length) {
				return;
			}
			
			// 清楚选择的下拉框后面的下拉框
			$(this).nextAll().remove();
			
			// 加载下级创建选择框
			$.getJSON(settings.url, {
				parentId : parseInt($(this).val())
			}, function(areas){
				if (areas.length == 0) {
					if ($.isFunction(settings.callback)) {
						settings.callback();
					}
					return;
				}
				var _level = $('select', _this).length + 1;
				var $select = $('<select/>').data('level', _level).bind('change', loadChilds);
				$.each(areas, function(i, n) {
					$('<option/>', {
						value : n.id,
						text : n.areaName
					}).appendTo($select);
				});
				$(_this).append($select);
				$select.attr(settings.attrs).trigger('change');
			});
		};
		
		/* 循环处理 */
        return this.each(function(){
			// 默认值情况
			if (settings.defaultValue) {
				setDefaultValue();
			} else { // 只显示列表
			
				// 设置第一次加载标志
				if ($('select', this).length == 0) {
					$(this).data('first', true);
				}
				
				// 加载创建选择框
				$.getJSON(settings.url, {
					level : settings.topLevel
				}, function(areas){
					// 创建并绑定事件
					var $select = $('<select/>').data('level', settings.topLevel).bind('change', loadChilds);
					$.each(areas, function(i, n){
						$('<option/>', {
							value: n.id,
							text: n.areaName
						}).appendTo($select);
					});
					$(_this).append($select);
					$select.attr(settings.attrs).trigger('change');
				});
			}
			
        });
        
    };
	
	/**
	 * 获取选中的地区ID
	 */
	$.fn.getAreaId = function(index) {
		if (index) {
			var _select = $('select:eq(' + (parseInt(index) - 1) + ')', this);
			return {text : _select.find('option:selected').text(), value : _select.val()};
		}
		var _select = $('select:last', this)
		return {text : _select.find('option:selected').text(), value : _select.val()};
	};
    
})(jQuery);