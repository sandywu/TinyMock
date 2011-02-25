/**
 * TinyMock - Mini Native XHR Mock
 * @Author Sandy
 * @Param request {string} - the Request URL need Mocked
 * @Param response {string} - the Response JSON String
 */

var TinyMock = (function() {

	var _OrigXhr = XMLHttpRequest, jsonPool = {}, delay = 1500, NOOP = function(){};

	function isFunction ( fn ) {
		return {}.toString.call( fn ) == '[object Function]';
	}

	function mockedOpen(method, url, isAsync) {
		
		var data, url = (typeof url == 'string' ? url.trim() : String( url ));
		
		if (!(data = queryRequest( url ))) {
			throw new Error('mockedOpen(): Can\'t find Route "' + url + '"');
		} else {
			this.__data__ = data;
		}
	}

	function mockedSend() {

		var _self = this;

		var timer = setTimeout(function() {	mockedResponse( _self ); }, delay);
	}

	function mockedResponse( xhr ) {
		
		function _wrap( handler ) {
			return function() {
				xhr.__done__ || ((xhr.__done__ = true) && handler());			
			}
		}
	
		xhr.readyState = 4;
		xhr.responseText = xhr.__data__;
		
		[xhr.onreadystatechange, xhr.onload].forEach(function(fn) {
			isFunction(fn) && fn !== NOOP ? _wrap(fn)() : void('WooHoo');
		});
	}

	function FakedXhr() {

		var xhr = {
			'statusText': 200,
			'readyState': 4,
			'open': mockedOpen,		
			'send': mockedSend,
			'abort': NOOP,
			'setRequestHeader': NOOP,
			'getResponseHeader': NOOP,
			'getAllResponseHeaders': NOOP,
			'onreadystatechange': NOOP,
			'onload': NOOP
		}

		return xhr;
	}

	function queryRequest( req ) {
		return jsonPool.hasOwnProperty( req ) && jsonPool[ req ];
	}

	function addRequest(req, json) {
		queryRequest( req ) ? void('WooHoo') : (jsonPool[ req ] = json);
	}

	(function __init__() {
		window.XMLHttpRequest = function() {
			return new (TinyMock.enabled ? FakedXhr : _OrigXhr);
		}
	})();
	
	return function(request, response) {
		addRequest(request, JSON.stringify( response ));
	}

})();

