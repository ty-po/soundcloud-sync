(function(){
      
      // Soundcloud Boilerplate
      var host2widgetBaseUrl = {
        "wt.soundcloud.test" : "wt.soundcloud.test:9200/",
        "wt.soundcloud.com" : "wt.soundcloud.com/player/",
        "w.soundcloud.com"  : "w.soundcloud.com/player/"
      };

      var consoleBox = document.querySelector('.console');

      var forEach = Array.prototype.forEach;

      function addEvent(element, eventName, callback) {
        if (element.addEventListener) {
          element.addEventListener(eventName, callback, false);
        } else {
          element.attachEvent(eventName, callback, false);
        }
      }

      function clearConsole() {
        consoleBox.value = '';
      }

      function updateConsole(value) {
        consoleBox.value = value +"\n" + consoleBox.value;
      }

      var widgetUrl = "http://api.soundcloud.com/users/1539950/favorites";

      consoleBox.value = "Loading...";

      var iframe = document.querySelector('.iframe');
      iframe.src = location.protocol + "//" + host2widgetBaseUrl["w.soundcloud.com"] + "?url=" + widgetUrl;
      console.log(iframe.src)
      var widget = SC.Widget(iframe);

      var eventKey, eventName;
      for (eventKey in SC.Widget.Events) {
        (function(eventName, eventKey) {
          eventName = SC.Widget.Events[eventKey];
          widget.bind(eventName, function(eventData) {
            updateConsole("SC.Widget.Events." + eventKey +  " " + JSON.stringify(eventData || {}));
          });
        }(eventName, eventKey))
      }

      var actionButtons = document.querySelectorAll('.actionButtons button');
      forEach.call(actionButtons, function(button) {
        addEvent(button, 'click', function(e) {
          if (e.target !== this) {
            e.stopPropagation();
            return false;
          }
          var input = this.querySelector('input');
          var value = input && input.value;
          widget[this.className](value);
        });
      });

      var getterButtons = document.querySelectorAll('.getterButtons button');
      forEach.call(getterButtons, function(button){
        addEvent(button, 'click', function(e) {
          widget[this.className](function(value){
            updateConsole(button.getAttribute('caption') + " " + JSON.stringify(value));
          });
        });
      });

      var widgetLinks = document.querySelectorAll('.widgetLinks a');
      var widgetUrlInput = document.querySelector('.urlInput');
      forEach.call(widgetLinks, function(link) {
        addEvent(link, 'click', function(e) {
          widgetUrlInput.value = this.getAttribute("href");
          e.preventDefault();
        });
      });

      var reloadButton = document.querySelector('.reload');
      addEvent(reloadButton, 'click', function() {
        clearConsole();
        var widgetOptions = getWidgetOptions();
        widgetOptions.callback = function(){
          updateConsole('Widget is reloaded.')
        };
        widget.load(widgetUrlInput.value, widgetOptions);
      });

      function getWidgetOptions() {
        var optionInputs = document.querySelectorAll('.widgetOptions input');
        var widgetOptions = {};
        forEach.call(optionInputs, function(option){
          widgetOptions[option.id] = option.type === 'text' ? option.value : option.checked;
        });
        return widgetOptions;
      }
    }());
