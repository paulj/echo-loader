// Bootstrap scripts
var scripts = [];
if (typeof jQuery == 'undefined') {
  scripts.push('http://cdn.echoenabled.com/clientapps/v2/jquery-pack.js');
}
scripts.push('http://cdn.echoenabled.com/clientapps/v2/stream.js');
scripts.push(function() {
  $(function() {
    // We've bootstrapped the page. Find widgets and load their configurations from the KV store.
    var appKey = $('meta[name=echo.key]').attr('content');
  
    $('.echo-canvas').each(function() {
      var target = $(this);
      var canvasId = target.attr('data-echo-canvas-id');

      $.getJSON('http://api.echoenabled.com/v1/kvs/get?callback=?&appkey=' + appKey + '&key=' + canvasId, function(response) {
        if (response.result == 'error') {
          target.html('Error loading configuration for canvas: ' + response.errorCode + ' (' + response.errorMessage + ')');
          return;
        }
      
        var config = $.parseJSON(response.value);
      
        // Invoked once all the scripts are available on the page.
        var createWidgets = function() {
          // Apply the content to the page.
          target.html(config.content);
        
          // Configure each app
          target.find('.echo-app').each(function() {
            var appTarget = $(this);
            var appId = appTarget.attr('data-echo-app-id');
            var appConfig = config.apps[appId];
            if (appConfig) {
              var current = window;
              $.each(appConfig.obj.split('.'), function(idx, part) {
                current = current[part];
              });

              var fullConfig = $.extend({}, appConfig.config, {
                target: appTarget
              }, (Echo.overrides[canvasId] || {})[appId] || {});

              new current(fullConfig);
            } else {
              appTarget.html("Error configuring app: No configuration found");
            }
          });
        };
      
        if (config.scripts) {
          config.scripts.push(createWidgets);
          head.js.apply(this, config.scripts);
        } else {
          createWidgets();
        }
      });
    });
  });
});

if (!window.Echo) window.Echo = {};
window.Echo.overrides = {};
Echo.override = function(canvas, app, overrides) {
  if (!window.Echo.overrides[canvas]) window.Echo.overrides[canvas] = {};
  window.Echo.overrides[canvas][app] = overrides;
};

head.js.apply(this, scripts);