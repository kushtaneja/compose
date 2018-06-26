require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"CameraLayer":[function(require,module,exports){
var CameraLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CameraLayer = (function(superClass) {
  extend(CameraLayer, superClass);

  function CameraLayer(options) {
    var baseOptions, customProps, ref, ref1, ref2, ref3, ref4;
    if (options == null) {
      options = {};
    }
    customProps = {
      facing: true,
      flipped: true,
      autoFlip: true,
      resolution: true,
      fit: true
    };
    baseOptions = Object.keys(options).filter(function(key) {
      return !customProps[key];
    }).reduce(function(clone, key) {
      clone[key] = options[key];
      return clone;
    }, {});
    CameraLayer.__super__.constructor.call(this, baseOptions);
    this._facing = (ref = options.facing) != null ? ref : 'back';
    this._flipped = (ref1 = options.flipped) != null ? ref1 : false;
    this._autoFlip = (ref2 = options.autoFlip) != null ? ref2 : true;
    this._resolution = (ref3 = options.resolution) != null ? ref3 : 480;
    this._started = false;
    this._device = null;
    this._matchedFacing = 'unknown';
    this._stream = null;
    this._scheduledRestart = null;
    this._recording = null;
    this.backgroundColor = 'transparent';
    this.clip = true;
    this.player.src = '';
    this.player.autoplay = true;
    this.player.muted = true;
    this.player.playsinline = true;
    this.player.style.objectFit = (ref4 = options.fit) != null ? ref4 : 'cover';
  }

  CameraLayer.define('facing', {
    get: function() {
      return this._facing;
    },
    set: function(facing) {
      this._facing = facing === 'front' ? facing : 'back';
      return this._setRestart();
    }
  });

  CameraLayer.define('flipped', {
    get: function() {
      return this._flipped;
    },
    set: function(flipped) {
      this._flipped = flipped;
      return this._setRestart();
    }
  });

  CameraLayer.define('autoFlip', {
    get: function() {
      return this._autoFlip;
    },
    set: function(autoFlip) {
      this._autoFlip = autoFlip;
      return this._setRestart();
    }
  });

  CameraLayer.define('resolution', {
    get: function() {
      return this._resolution;
    },
    set: function(resolution) {
      this._resolution = resolution;
      return this._setRestart();
    }
  });

  CameraLayer.define('fit', {
    get: function() {
      return this.player.style.objectFit;
    },
    set: function(fit) {
      return this.player.style.objectFit = fit;
    }
  });

  CameraLayer.define('isRecording', {
    get: function() {
      var ref;
      return ((ref = this._recording) != null ? ref.recorder.state : void 0) === 'recording';
    }
  });

  CameraLayer.prototype.toggleFacing = function() {
    this._facing = this._facing === 'front' ? 'back' : 'front';
    return this._setRestart();
  };

  CameraLayer.prototype.capture = function(width, height, ratio) {
    var canvas, context, url;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (ratio == null) {
      ratio = window.devicePixelRatio;
    }
    canvas = document.createElement("canvas");
    canvas.width = ratio * width;
    canvas.height = ratio * height;
    context = canvas.getContext("2d");
    this.draw(context);
    url = canvas.toDataURL();
    this.emit('capture', url);
    return url;
  };

  CameraLayer.prototype.draw = function(context) {
    var clipBox, cover, layerBox, ref, videoBox, videoHeight, videoWidth, x, y;
    if (!context) {
      return;
    }
    cover = function(srcW, srcH, dstW, dstH) {
      var scale, scaleX, scaleY;
      scaleX = dstW / srcW;
      scaleY = dstH / srcH;
      scale = scaleX > scaleY ? scaleX : scaleY;
      return {
        width: srcW * scale,
        height: srcH * scale
      };
    };
    ref = this.player, videoWidth = ref.videoWidth, videoHeight = ref.videoHeight;
    clipBox = {
      width: context.canvas.width,
      height: context.canvas.height
    };
    layerBox = cover(this.width, this.height, clipBox.width, clipBox.height);
    videoBox = cover(videoWidth, videoHeight, layerBox.width, layerBox.height);
    x = (clipBox.width - videoBox.width) / 2;
    y = (clipBox.height - videoBox.height) / 2;
    return context.drawImage(this.player, x, y, videoBox.width, videoBox.height);
  };

  CameraLayer.prototype.start = function() {
    return this._enumerateDevices().then((function(_this) {
      return function(devices) {
        var device, i, len;
        devices = devices.filter(function(device) {
          return device.kind === 'videoinput';
        });
        for (i = 0, len = devices.length; i < len; i++) {
          device = devices[i];
          if (device.label.indexOf(_this._facing) !== -1) {
            _this._matchedFacing = _this._facing;
            return device;
          }
        }
        _this._matchedFacing = 'unknown';
        if (devices.length > 0) {
          return devices[0];
        } else {
          return Promise.reject();
        }
      };
    })(this)).then((function(_this) {
      return function(device) {
        var constraints, ref;
        if (!device || device.deviceId === ((ref = _this._device) != null ? ref.deviceId : void 0)) {
          return;
        }
        _this.stop();
        _this._device = device;
        constraints = {
          video: {
            mandatory: {
              minWidth: _this._resolution,
              minHeight: _this._resolution
            },
            optional: [
              {
                sourceId: _this._device.deviceId
              }
            ]
          },
          audio: true
        };
        return _this._getUserMedia(constraints);
      };
    })(this)).then((function(_this) {
      return function(stream) {
        _this.player.srcObject = stream;
        _this._started = true;
        _this._stream = stream;
        return _this._flip();
      };
    })(this))["catch"](function(error) {
      return console.error(error);
    });
  };

  CameraLayer.prototype.stop = function() {
    var ref;
    this._started = false;
    this.player.pause();
    this.player.srcObject = null;
    if ((ref = this._stream) != null) {
      ref.getTracks().forEach(function(track) {
        return track.stop();
      });
    }
    this._stream = null;
    this._device = null;
    if (this._scheduledRestart) {
      cancelAnimationFrame(this._scheduledRestart);
      return this._scheduledRestart = null;
    }
  };

  CameraLayer.prototype.startRecording = function() {
    var chunks, recorder;
    if (this._recording) {
      this._recording.recorder.stop();
      this._recording = null;
    }
    chunks = [];
    recorder = new MediaRecorder(this._stream, {
      mimeType: 'video/webm'
    });
    recorder.addEventListener('start', (function(_this) {
      return function(event) {
        return _this.emit('startrecording');
      };
    })(this));
    recorder.addEventListener('dataavailable', function(event) {
      return chunks.push(event.data);
    });
    recorder.addEventListener('stop', (function(_this) {
      return function(event) {
        var blob, url;
        blob = new Blob(chunks);
        url = window.URL.createObjectURL(blob);
        _this.emit('stoprecording');
        return _this.emit('record', url);
      };
    })(this));
    recorder.start();
    return this._recording = {
      recorder: recorder,
      chunks: chunks
    };
  };

  CameraLayer.prototype.stopRecording = function() {
    if (!this._recording) {
      return;
    }
    this._recording.recorder.stop();
    return this._recording = null;
  };

  CameraLayer.prototype.onCapture = function(callback) {
    return this.on('capture', callback);
  };

  CameraLayer.prototype.onStartRecording = function(callback) {
    return this.on('startrecording', callback);
  };

  CameraLayer.prototype.onStopRecording = function(callback) {
    return this.on('stoprecording', callback);
  };

  CameraLayer.prototype.onRecord = function(callback) {
    return this.on('record', callback);
  };

  CameraLayer.prototype._setRestart = function() {
    if (!this._started || this._scheduledRestart) {
      return;
    }
    return this._scheduledRestart = requestAnimationFrame((function(_this) {
      return function() {
        _this._scheduledRestart = null;
        return _this.start();
      };
    })(this));
  };

  CameraLayer.prototype._flip = function() {
    var x;
    if (this._autoFlip) {
      this._flipped = this._matchedFacing === 'front';
    }
    x = this._flipped ? -1 : 1;
    return this.player.style.webkitTransform = "scale(" + x + ", 1)";
  };

  CameraLayer.prototype._enumerateDevices = function() {
    try {
      return navigator.mediaDevices.enumerateDevices();
    } catch (error1) {
      return Promise.reject();
    }
  };

  CameraLayer.prototype._getUserMedia = function(constraints) {
    return new Promise(function(resolve, reject) {
      var gum;
      try {
        gum = navigator.getUserMedia || navigator.webkitGetUserMedia;
        return gum.call(navigator, constraints, resolve, reject);
      } catch (error1) {
        return reject();
      }
    });
  };

  return CameraLayer;

})(VideoLayer);

if (typeof module !== "undefined" && module !== null) {
  module.exports = CameraLayer;
}

Framer.CameraLayer = CameraLayer;


},{}],"Keyboard":[function(require,module,exports){
var keyMap;

exports.backspace = 8;

exports.tab = 9;

exports.enter = 13;

exports.shift = 16;

exports.ctrl = 17;

exports.alt = 18;

exports.caps = 20;

exports.escape = 27;

exports.pageUp = 33;

exports.pageDown = 34;

exports.left = 37;

exports.up = 38;

exports.right = 39;

exports.down = 40;

exports["delete"] = 46;

exports.zero = 48;

exports.one = 49;

exports.two = 50;

exports.three = 51;

exports.four = 52;

exports.five = 53;

exports.six = 54;

exports.seven = 55;

exports.eight = 56;

exports.nine = 57;

exports.a = 65;

exports.b = 66;

exports.c = 67;

exports.d = 68;

exports.e = 69;

exports.f = 70;

exports.g = 71;

exports.h = 72;

exports.i = 73;

exports.j = 74;

exports.k = 75;

exports.l = 76;

exports.m = 77;

exports.n = 78;

exports.o = 79;

exports.p = 80;

exports.q = 81;

exports.r = 82;

exports.s = 83;

exports.t = 84;

exports.u = 85;

exports.v = 86;

exports.w = 87;

exports.x = 88;

exports.y = 89;

exports.z = 90;

exports.numZero = 96;

exports.numOne = 97;

exports.numTwo = 98;

exports.numThree = 99;

exports.numFour = 100;

exports.numFive = 101;

exports.numSix = 102;

exports.numSeven = 103;

exports.numEight = 104;

exports.numNine = 105;

exports.fOne = 112;

exports.fTwo = 113;

exports.fThree = 114;

exports.fFour = 115;

exports.fFive = 116;

exports.fSix = 117;

exports.fSeven = 118;

exports.fEight = 119;

exports.fNine = 120;

exports.fTen = 121;

exports.semiColon = 186;

exports.equalSign = 187;

exports.comma = 188;

exports.dash = 189;

exports.period = 190;

exports.forwardSlash = 191;

exports.openBracket = 219;

exports.backSlash = 220;

exports.closeBracket = 221;

exports.singleQuote = 222;

keyMap = {};

exports.onKey = function(key, handler, throttleTime) {
  return keyMap[key] = Utils.throttle(throttleTime, handler);
};

exports.offKey = function(key) {
  return delete keyMap[key];
};

window.addEventListener('keydown', function(event) {
  var handler;
  event.preventDefault();
  handler = keyMap[event.keyCode];
  if (handler) {
    return handler();
  }
});


},{}],"framer-camera-input/CameraInput":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.CameraInput = (function(superClass) {
  extend(CameraInput, superClass);

  function CameraInput(options) {
    this.options = options != null ? options : {};
    _.defaults(this.options, {
      ignoreEvents: false
    });
    CameraInput.__super__.constructor.call(this, this.options);
    this.changeHandler = function(event) {
      var file, url;
      if (this.options.callback) {
        file = this._element.files[0];
        url = URL.createObjectURL(file);
        return this.options.callback(url, file.type);
      }
    };
    this.changeHandler = this.changeHandler.bind(this);
    Events.wrap(this._element).addEventListener("change", this.changeHandler);
  }

  CameraInput.prototype._createElement = function() {
    if (this._element != null) {
      return;
    }
    this._element = document.createElement("input");
    this._element.type = "file";
    this._element.capture = true;
    this._element.classList.add("framerLayer");
    this._element.style["-webkit-appearance"] = "none";
    this._element.style["-webkit-text-size-adjust"] = "none";
    this._element.style["outline"] = "none";
    switch (this.options.accept) {
      case "image":
        return this._element.accept = "image/*";
      case "video":
        return this._element.accept = "video/*";
      default:
        return this._element.accept = "image/*,video/*";
    }
  };

  CameraInput.define("accept", {
    get: function() {
      return this._element.accept;
    },
    set: function(value) {
      switch (value) {
        case "image":
          return this._element.accept = "image/*";
        case "video":
          return this._element.accept = "video/*";
        default:
          return this._element.accept = "image/*,video/*";
      }
    }
  });

  return CameraInput;

})(TextLayer);


},{}],"input-framer/input":[function(require,module,exports){
var _inputStyle, calculatePixelRatio, growthRatio, imageHeight,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.keyboardLayer = new Layer({
  x: 0,
  y: Screen.height,
  width: Screen.width,
  height: 432,
  html: "<img style='width: 100%;' src='modules/keyboard.png'/>"
});

growthRatio = Screen.width / 732;

imageHeight = growthRatio * 432;

_inputStyle = Object.assign({}, Framer.LayerStyle, calculatePixelRatio = function(layer, value) {
  return (value * layer.context.pixelMultiplier) + "px";
}, {
  fontSize: function(layer) {
    return calculatePixelRatio(layer, layer._properties.fontSize);
  },
  lineHeight: function(layer) {
    return layer._properties.lineHeight + "em";
  },
  padding: function(layer) {
    var padding, paddingValue, paddingValues, pixelMultiplier;
    pixelMultiplier = layer.context.pixelMultiplier;
    padding = [];
    paddingValue = layer._properties.padding;
    if (Number.isInteger(paddingValue)) {
      return calculatePixelRatio(layer, paddingValue);
    }
    paddingValues = layer._properties.padding.split(" ");
    switch (paddingValues.length) {
      case 4:
        padding.top = parseFloat(paddingValues[0]);
        padding.right = parseFloat(paddingValues[1]);
        padding.bottom = parseFloat(paddingValues[2]);
        padding.left = parseFloat(paddingValues[3]);
        break;
      case 3:
        padding.top = parseFloat(paddingValues[0]);
        padding.right = parseFloat(paddingValues[1]);
        padding.bottom = parseFloat(paddingValues[2]);
        padding.left = parseFloat(paddingValues[1]);
        break;
      case 2:
        padding.top = parseFloat(paddingValues[0]);
        padding.right = parseFloat(paddingValues[1]);
        padding.bottom = parseFloat(paddingValues[0]);
        padding.left = parseFloat(paddingValues[1]);
        break;
      default:
        padding.top = parseFloat(paddingValues[0]);
        padding.right = parseFloat(paddingValues[0]);
        padding.bottom = parseFloat(paddingValues[0]);
        padding.left = parseFloat(paddingValues[0]);
    }
    return (padding.top * pixelMultiplier) + "px " + (padding.right * pixelMultiplier) + "px " + (padding.bottom * pixelMultiplier) + "px " + (padding.left * pixelMultiplier) + "px";
  }
});

exports.keyboardLayer.states = {
  shown: {
    y: Screen.height - imageHeight
  }
};

exports.keyboardLayer.states.animationOptions = {
  curve: "spring(500,50,15)"
};

exports.Input = (function(superClass) {
  extend(Input, superClass);

  Input.define("style", {
    get: function() {
      return this.input.style;
    },
    set: function(value) {
      return _.extend(this.input.style, value);
    }
  });

  Input.define("value", {
    get: function() {
      return this.input.value;
    },
    set: function(value) {
      return this.input.value = value;
    }
  });

  function Input(options) {
    if (options == null) {
      options = {};
    }
    this.enable = bind(this.enable, this);
    if (options.setup == null) {
      options.setup = false;
    }
    if (options.width == null) {
      options.width = Screen.width;
    }
    if (options.clip == null) {
      options.clip = false;
    }
    if (options.height == null) {
      options.height = 60;
    }
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "rgba(255, 60, 47, .5)" : "rgba(255, 255, 255, .01)";
    }
    if (options.fontSize == null) {
      options.fontSize = 30;
    }
    if (options.lineHeight == null) {
      options.lineHeight = 1;
    }
    if (options.padding == null) {
      options.padding = 10;
    }
    if (options.text == null) {
      options.text = "";
    }
    if (options.placeholder == null) {
      options.placeholder = "";
    }
    if (options.virtualKeyboard == null) {
      options.virtualKeyboard = Utils.isMobile() ? false : true;
    }
    if (options.type == null) {
      options.type = "text";
    }
    if (options.goButton == null) {
      options.goButton = false;
    }
    if (options.autoCorrect == null) {
      options.autoCorrect = "on";
    }
    if (options.autoComplete == null) {
      options.autoComplete = "on";
    }
    if (options.autoCapitalize == null) {
      options.autoCapitalize = "on";
    }
    if (options.spellCheck == null) {
      options.spellCheck = "on";
    }
    if (options.autofocus == null) {
      options.autofocus = false;
    }
    if (options.textColor == null) {
      options.textColor = "#000";
    }
    if (options.fontFamily == null) {
      options.fontFamily = "-apple-system";
    }
    if (options.fontWeight == null) {
      options.fontWeight = "500";
    }
    if (options.submit == null) {
      options.submit = false;
    }
    if (options.tabIndex == null) {
      options.tabIndex = 0;
    }
    if (options.textarea == null) {
      options.textarea = false;
    }
    if (options.disabled == null) {
      options.disabled = false;
    }
    Input.__super__.constructor.call(this, options);
    this._properties.fontSize = options.fontSize;
    this._properties.lineHeight = options.lineHeight;
    this._properties.padding = options.padding;
    if (options.placeholderColor != null) {
      this.placeholderColor = options.placeholderColor;
    }
    this.input = document.createElement(options.textarea ? 'textarea' : 'input');
    this.input.id = "input-" + (_.now());
    this.input.style.width = _inputStyle["width"](this);
    this.input.style.height = _inputStyle["height"](this);
    this.input.style.fontSize = _inputStyle["fontSize"](this);
    this.input.style.lineHeight = _inputStyle["lineHeight"](this);
    this.input.style.outline = "none";
    this.input.style.border = "none";
    this.input.style.backgroundColor = options.backgroundColor;
    this.input.style.padding = _inputStyle["padding"](this);
    this.input.style.fontFamily = options.fontFamily;
    this.input.style.color = options.textColor;
    this.input.style.fontWeight = options.fontWeight;
    this.input.value = options.text;
    this.input.type = options.type;
    this.input.placeholder = options.placeholder;
    this.input.setAttribute("tabindex", options.tabindex);
    this.input.setAttribute("autocorrect", options.autoCorrect);
    this.input.setAttribute("autocomplete", options.autoComplete);
    this.input.setAttribute("autocapitalize", options.autoCapitalize);
    if (options.disabled === true) {
      this.input.setAttribute("disabled", true);
    }
    if (options.autofocus === true) {
      this.input.setAttribute("autofocus", true);
    }
    this.input.setAttribute("spellcheck", options.spellCheck);
    this.form = document.createElement("form");
    if ((options.goButton && !options.submit) || !options.submit) {
      this.form.action = "#";
      this.form.addEventListener("submit", function(event) {
        return event.preventDefault();
      });
    }
    this.form.appendChild(this.input);
    this._element.appendChild(this.form);
    this.backgroundColor = "transparent";
    if (this.placeholderColor) {
      this.updatePlaceholderColor(options.placeholderColor);
    }
    if (!Utils.isMobile() && options.virtualKeyboard === true) {
      this.input.addEventListener("focus", function() {
        exports.keyboardLayer.bringToFront();
        return exports.keyboardLayer.stateCycle();
      });
      this.input.addEventListener("blur", function() {
        return exports.keyboardLayer.animate("default");
      });
    }
  }

  Input.prototype.updatePlaceholderColor = function(color) {
    var css;
    this.placeholderColor = color;
    if (this.pageStyle != null) {
      document.head.removeChild(this.pageStyle);
    }
    this.pageStyle = document.createElement("style");
    this.pageStyle.type = "text/css";
    css = "#" + this.input.id + "::-webkit-input-placeholder { color: " + this.placeholderColor + "; }";
    this.pageStyle.appendChild(document.createTextNode(css));
    return document.head.appendChild(this.pageStyle);
  };

  Input.prototype.focus = function() {
    return this.input.focus();
  };

  Input.prototype.unfocus = function() {
    return this.input.blur();
  };

  Input.prototype.onFocus = function(cb) {
    return this.input.addEventListener("focus", function() {
      return cb.apply(this);
    });
  };

  Input.prototype.onBlur = function(cb) {
    return this.input.addEventListener("blur", function() {
      return cb.apply(this);
    });
  };

  Input.prototype.onUnfocus = Input.onBlur;

  Input.prototype.disable = function() {
    return this.input.setAttribute("disabled", true);
  };

  Input.prototype.enable = function() {
    return this.input.removeAttribute("disabled", true);
  };

  return Input;

})(Layer);


},{}],"input":[function(require,module,exports){
arguments[4]["input-framer/input"][0].apply(exports,arguments)
},{"dup":"input-framer/input"}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3Rhbm1heWpvc2hpL0Rlc2t0b3AvU2hhcmVDaGF0X0ZyYW1lci9jb21wb3NlLmZyYW1lci9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3Rhbm1heWpvc2hpL0Rlc2t0b3AvU2hhcmVDaGF0X0ZyYW1lci9jb21wb3NlLmZyYW1lci9tb2R1bGVzL2lucHV0LWZyYW1lci9pbnB1dC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy90YW5tYXlqb3NoaS9EZXNrdG9wL1NoYXJlQ2hhdF9GcmFtZXIvY29tcG9zZS5mcmFtZXIvbW9kdWxlcy9mcmFtZXItY2FtZXJhLWlucHV0L0NhbWVyYUlucHV0LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3Rhbm1heWpvc2hpL0Rlc2t0b3AvU2hhcmVDaGF0X0ZyYW1lci9jb21wb3NlLmZyYW1lci9tb2R1bGVzL0tleWJvYXJkLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3Rhbm1heWpvc2hpL0Rlc2t0b3AvU2hhcmVDaGF0X0ZyYW1lci9jb21wb3NlLmZyYW1lci9tb2R1bGVzL0NhbWVyYUxheWVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyBBZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIHlvdXIgcHJvamVjdCBpbiBGcmFtZXIgU3R1ZGlvLiBcbiMgbXlNb2R1bGUgPSByZXF1aXJlIFwibXlNb2R1bGVcIlxuIyBSZWZlcmVuY2UgdGhlIGNvbnRlbnRzIGJ5IG5hbWUsIGxpa2UgbXlNb2R1bGUubXlGdW5jdGlvbigpIG9yIG15TW9kdWxlLm15VmFyXG5cbmV4cG9ydHMubXlWYXIgPSBcIm15VmFyaWFibGVcIlxuXG5leHBvcnRzLm15RnVuY3Rpb24gPSAtPlxuXHRwcmludCBcIm15RnVuY3Rpb24gaXMgcnVubmluZ1wiXG5cbmV4cG9ydHMubXlBcnJheSA9IFsxLCAyLCAzXSIsImV4cG9ydHMua2V5Ym9hcmRMYXllciA9IG5ldyBMYXllclxuXHR4OjAsIHk6U2NyZWVuLmhlaWdodCwgd2lkdGg6U2NyZWVuLndpZHRoLCBoZWlnaHQ6NDMyXG5cdGh0bWw6XCI8aW1nIHN0eWxlPSd3aWR0aDogMTAwJTsnIHNyYz0nbW9kdWxlcy9rZXlib2FyZC5wbmcnLz5cIlxuXG4jc2NyZWVuIHdpZHRoIHZzLiBzaXplIG9mIGltYWdlIHdpZHRoXG5ncm93dGhSYXRpbyA9IFNjcmVlbi53aWR0aCAvIDczMlxuaW1hZ2VIZWlnaHQgPSBncm93dGhSYXRpbyAqIDQzMlxuXG4jIEV4dGVuZHMgdGhlIExheWVyU3R5bGUgY2xhc3Mgd2hpY2ggZG9lcyB0aGUgcGl4ZWwgcmF0aW8gY2FsY3VsYXRpb25zIGluIGZyYW1lclxuX2lucHV0U3R5bGUgPVxuXHRPYmplY3QuYXNzaWduKHt9LCBGcmFtZXIuTGF5ZXJTdHlsZSxcblx0XHRjYWxjdWxhdGVQaXhlbFJhdGlvID0gKGxheWVyLCB2YWx1ZSkgLT5cblx0XHRcdCh2YWx1ZSAqIGxheWVyLmNvbnRleHQucGl4ZWxNdWx0aXBsaWVyKSArIFwicHhcIlxuXG5cdFx0Zm9udFNpemU6IChsYXllcikgLT5cblx0XHRcdGNhbGN1bGF0ZVBpeGVsUmF0aW8obGF5ZXIsIGxheWVyLl9wcm9wZXJ0aWVzLmZvbnRTaXplKVxuXG5cdFx0bGluZUhlaWdodDogKGxheWVyKSAtPlxuXHRcdFx0KGxheWVyLl9wcm9wZXJ0aWVzLmxpbmVIZWlnaHQpICsgXCJlbVwiXG5cblx0XHRwYWRkaW5nOiAobGF5ZXIpIC0+XG5cdFx0XHR7IHBpeGVsTXVsdGlwbGllciB9ID0gbGF5ZXIuY29udGV4dFxuXHRcdFx0cGFkZGluZyA9IFtdXG5cdFx0XHRwYWRkaW5nVmFsdWUgPSBsYXllci5fcHJvcGVydGllcy5wYWRkaW5nXG5cblx0XHRcdCMgQ2hlY2sgaWYgd2UgaGF2ZSBhIHNpbmdsZSBudW1iZXIgYXMgaW50ZWdlclxuXHRcdFx0aWYgTnVtYmVyLmlzSW50ZWdlcihwYWRkaW5nVmFsdWUpXG5cdFx0XHRcdHJldHVybiBjYWxjdWxhdGVQaXhlbFJhdGlvKGxheWVyLCBwYWRkaW5nVmFsdWUpXG5cblx0XHRcdCMgSWYgd2UgaGF2ZSBtdWx0aXBsZSB2YWx1ZXMgdGhleSBjb21lIGFzIHN0cmluZyAoZS5nLiBcIjEgMiAzIDRcIilcblx0XHRcdHBhZGRpbmdWYWx1ZXMgPSBsYXllci5fcHJvcGVydGllcy5wYWRkaW5nLnNwbGl0KFwiIFwiKVxuXG5cdFx0XHRzd2l0Y2ggcGFkZGluZ1ZhbHVlcy5sZW5ndGhcblx0XHRcdFx0d2hlbiA0XG5cdFx0XHRcdFx0cGFkZGluZy50b3AgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMF0pXG5cdFx0XHRcdFx0cGFkZGluZy5yaWdodCA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1sxXSlcblx0XHRcdFx0XHRwYWRkaW5nLmJvdHRvbSA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1syXSlcblx0XHRcdFx0XHRwYWRkaW5nLmxlZnQgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbM10pXG5cblx0XHRcdFx0d2hlbiAzXG5cdFx0XHRcdFx0cGFkZGluZy50b3AgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMF0pXG5cdFx0XHRcdFx0cGFkZGluZy5yaWdodCA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1sxXSlcblx0XHRcdFx0XHRwYWRkaW5nLmJvdHRvbSA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1syXSlcblx0XHRcdFx0XHRwYWRkaW5nLmxlZnQgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMV0pXG5cblx0XHRcdFx0d2hlbiAyXG5cdFx0XHRcdFx0cGFkZGluZy50b3AgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMF0pXG5cdFx0XHRcdFx0cGFkZGluZy5yaWdodCA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1sxXSlcblx0XHRcdFx0XHRwYWRkaW5nLmJvdHRvbSA9IHBhcnNlRmxvYXQocGFkZGluZ1ZhbHVlc1swXSlcblx0XHRcdFx0XHRwYWRkaW5nLmxlZnQgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMV0pXG5cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHBhZGRpbmcudG9wID0gcGFyc2VGbG9hdChwYWRkaW5nVmFsdWVzWzBdKVxuXHRcdFx0XHRcdHBhZGRpbmcucmlnaHQgPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMF0pXG5cdFx0XHRcdFx0cGFkZGluZy5ib3R0b20gPSBwYXJzZUZsb2F0KHBhZGRpbmdWYWx1ZXNbMF0pXG5cdFx0XHRcdFx0cGFkZGluZy5sZWZ0ID0gcGFyc2VGbG9hdChwYWRkaW5nVmFsdWVzWzBdKVxuXG5cdFx0XHQjIFJldHVybiBhcyA0LXZhbHVlIHN0cmluZyAoZS5nIFwiMXB4IDJweCAzcHggNHB4XCIpXG5cdFx0XHRcIiN7cGFkZGluZy50b3AgKiBwaXhlbE11bHRpcGxpZXJ9cHggI3twYWRkaW5nLnJpZ2h0ICogcGl4ZWxNdWx0aXBsaWVyfXB4ICN7cGFkZGluZy5ib3R0b20gKiBwaXhlbE11bHRpcGxpZXJ9cHggI3twYWRkaW5nLmxlZnQgKiBwaXhlbE11bHRpcGxpZXJ9cHhcIlxuXHQpXG5cbmV4cG9ydHMua2V5Ym9hcmRMYXllci5zdGF0ZXMgPVxuXHRzaG93bjpcblx0XHR5OiBTY3JlZW4uaGVpZ2h0IC0gaW1hZ2VIZWlnaHRcblxuZXhwb3J0cy5rZXlib2FyZExheWVyLnN0YXRlcy5hbmltYXRpb25PcHRpb25zID1cblx0Y3VydmU6IFwic3ByaW5nKDUwMCw1MCwxNSlcIlxuXG5jbGFzcyBleHBvcnRzLklucHV0IGV4dGVuZHMgTGF5ZXJcblx0QGRlZmluZSBcInN0eWxlXCIsXG5cdFx0Z2V0OiAtPiBAaW5wdXQuc3R5bGVcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdF8uZXh0ZW5kIEBpbnB1dC5zdHlsZSwgdmFsdWVcblxuXHRAZGVmaW5lIFwidmFsdWVcIixcblx0XHRnZXQ6IC0+IEBpbnB1dC52YWx1ZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QGlucHV0LnZhbHVlID0gdmFsdWVcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zLnNldHVwID89IGZhbHNlXG5cdFx0b3B0aW9ucy53aWR0aCA/PSBTY3JlZW4ud2lkdGhcblx0XHRvcHRpb25zLmNsaXAgPz0gZmFsc2Vcblx0XHRvcHRpb25zLmhlaWdodCA/PSA2MFxuXHRcdG9wdGlvbnMuYmFja2dyb3VuZENvbG9yID89IGlmIG9wdGlvbnMuc2V0dXAgdGhlbiBcInJnYmEoMjU1LCA2MCwgNDcsIC41KVwiIGVsc2UgXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIC4wMSlcIiAjIFwidHJhbnNwYXJlbnRcIiBzZWVtcyB0byBjYXVzZSBhIGJ1ZyBpbiBsYXRlc3Qgc2FmYXJpIHZlcnNpb25cblx0XHRvcHRpb25zLmZvbnRTaXplID89IDMwXG5cdFx0b3B0aW9ucy5saW5lSGVpZ2h0ID89IDFcblx0XHRvcHRpb25zLnBhZGRpbmcgPz0gMTBcblx0XHRvcHRpb25zLnRleHQgPz0gXCJcIlxuXHRcdG9wdGlvbnMucGxhY2Vob2xkZXIgPz0gXCJcIlxuXHRcdG9wdGlvbnMudmlydHVhbEtleWJvYXJkID89IGlmIFV0aWxzLmlzTW9iaWxlKCkgdGhlbiBmYWxzZSBlbHNlIHRydWVcblx0XHRvcHRpb25zLnR5cGUgPz0gXCJ0ZXh0XCJcblx0XHRvcHRpb25zLmdvQnV0dG9uID89IGZhbHNlXG5cdFx0b3B0aW9ucy5hdXRvQ29ycmVjdCA/PSBcIm9uXCJcblx0XHRvcHRpb25zLmF1dG9Db21wbGV0ZSA/PSBcIm9uXCJcblx0XHRvcHRpb25zLmF1dG9DYXBpdGFsaXplID89IFwib25cIlxuXHRcdG9wdGlvbnMuc3BlbGxDaGVjayA/PSBcIm9uXCJcblx0XHRvcHRpb25zLmF1dG9mb2N1cyA/PSBmYWxzZVxuXHRcdG9wdGlvbnMudGV4dENvbG9yID89IFwiIzAwMFwiXG5cdFx0b3B0aW9ucy5mb250RmFtaWx5ID89IFwiLWFwcGxlLXN5c3RlbVwiXG5cdFx0b3B0aW9ucy5mb250V2VpZ2h0ID89IFwiNTAwXCJcblx0XHRvcHRpb25zLnN1Ym1pdCA/PSBmYWxzZVxuXHRcdG9wdGlvbnMudGFiSW5kZXggPz0gMFxuXHRcdG9wdGlvbnMudGV4dGFyZWEgPz0gZmFsc2Vcblx0XHRvcHRpb25zLmRpc2FibGVkID89IGZhbHNlXG5cblx0XHRzdXBlciBvcHRpb25zXG5cblx0XHQjIEFkZCBhZGRpdGlvbmFsIHByb3BlcnRpZXNcblx0XHRAX3Byb3BlcnRpZXMuZm9udFNpemUgPSBvcHRpb25zLmZvbnRTaXplXG5cdFx0QF9wcm9wZXJ0aWVzLmxpbmVIZWlnaHQgPSBvcHRpb25zLmxpbmVIZWlnaHRcblx0XHRAX3Byb3BlcnRpZXMucGFkZGluZyA9IG9wdGlvbnMucGFkZGluZ1xuXG5cdFx0QHBsYWNlaG9sZGVyQ29sb3IgPSBvcHRpb25zLnBsYWNlaG9sZGVyQ29sb3IgaWYgb3B0aW9ucy5wbGFjZWhvbGRlckNvbG9yP1xuXHRcdEBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaWYgb3B0aW9ucy50ZXh0YXJlYSB0aGVuICd0ZXh0YXJlYScgZWxzZSAnaW5wdXQnXG5cdFx0QGlucHV0LmlkID0gXCJpbnB1dC0je18ubm93KCl9XCJcblxuXHRcdCMgQWRkIHN0eWxpbmcgdG8gdGhlIGlucHV0IGVsZW1lbnRcblx0XHRAaW5wdXQuc3R5bGUud2lkdGggPSBfaW5wdXRTdHlsZVtcIndpZHRoXCJdKEApXG5cdFx0QGlucHV0LnN0eWxlLmhlaWdodCA9IF9pbnB1dFN0eWxlW1wiaGVpZ2h0XCJdKEApXG5cdFx0QGlucHV0LnN0eWxlLmZvbnRTaXplID0gX2lucHV0U3R5bGVbXCJmb250U2l6ZVwiXShAKVxuXHRcdEBpbnB1dC5zdHlsZS5saW5lSGVpZ2h0ID0gX2lucHV0U3R5bGVbXCJsaW5lSGVpZ2h0XCJdKEApXG5cdFx0QGlucHV0LnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIlxuXHRcdEBpbnB1dC5zdHlsZS5ib3JkZXIgPSBcIm5vbmVcIlxuXHRcdEBpbnB1dC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmJhY2tncm91bmRDb2xvclxuXHRcdEBpbnB1dC5zdHlsZS5wYWRkaW5nID0gX2lucHV0U3R5bGVbXCJwYWRkaW5nXCJdKEApXG5cdFx0QGlucHV0LnN0eWxlLmZvbnRGYW1pbHkgPSBvcHRpb25zLmZvbnRGYW1pbHlcblx0XHRAaW5wdXQuc3R5bGUuY29sb3IgPSBvcHRpb25zLnRleHRDb2xvclxuXHRcdEBpbnB1dC5zdHlsZS5mb250V2VpZ2h0ID0gb3B0aW9ucy5mb250V2VpZ2h0XG5cblx0XHRAaW5wdXQudmFsdWUgPSBvcHRpb25zLnRleHRcblx0XHRAaW5wdXQudHlwZSA9IG9wdGlvbnMudHlwZVxuXHRcdEBpbnB1dC5wbGFjZWhvbGRlciA9IG9wdGlvbnMucGxhY2Vob2xkZXJcblx0XHRAaW5wdXQuc2V0QXR0cmlidXRlIFwidGFiaW5kZXhcIiwgb3B0aW9ucy50YWJpbmRleFxuXHRcdEBpbnB1dC5zZXRBdHRyaWJ1dGUgXCJhdXRvY29ycmVjdFwiLCBvcHRpb25zLmF1dG9Db3JyZWN0XG5cdFx0QGlucHV0LnNldEF0dHJpYnV0ZSBcImF1dG9jb21wbGV0ZVwiLCBvcHRpb25zLmF1dG9Db21wbGV0ZVxuXHRcdEBpbnB1dC5zZXRBdHRyaWJ1dGUgXCJhdXRvY2FwaXRhbGl6ZVwiLCBvcHRpb25zLmF1dG9DYXBpdGFsaXplXG5cdFx0aWYgb3B0aW9ucy5kaXNhYmxlZCA9PSB0cnVlXG5cdFx0XHRAaW5wdXQuc2V0QXR0cmlidXRlIFwiZGlzYWJsZWRcIiwgdHJ1ZVxuXHRcdGlmIG9wdGlvbnMuYXV0b2ZvY3VzID09IHRydWVcblx0XHRcdEBpbnB1dC5zZXRBdHRyaWJ1dGUgXCJhdXRvZm9jdXNcIiwgdHJ1ZVxuXHRcdEBpbnB1dC5zZXRBdHRyaWJ1dGUgXCJzcGVsbGNoZWNrXCIsIG9wdGlvbnMuc3BlbGxDaGVja1xuXHRcdEBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImZvcm1cIlxuXG5cdFx0aWYgKG9wdGlvbnMuZ29CdXR0b24gJiYgIW9wdGlvbnMuc3VibWl0KSB8fCAhb3B0aW9ucy5zdWJtaXRcblx0XHRcdEBmb3JtLmFjdGlvbiA9IFwiI1wiXG5cdFx0XHRAZm9ybS5hZGRFdmVudExpc3RlbmVyIFwic3VibWl0XCIsIChldmVudCkgLT5cblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0QGZvcm0uYXBwZW5kQ2hpbGQgQGlucHV0XG5cdFx0QF9lbGVtZW50LmFwcGVuZENoaWxkIEBmb3JtXG5cblx0XHRAYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiXG5cdFx0QHVwZGF0ZVBsYWNlaG9sZGVyQ29sb3Igb3B0aW9ucy5wbGFjZWhvbGRlckNvbG9yIGlmIEBwbGFjZWhvbGRlckNvbG9yXG5cblx0XHQjb25seSBzaG93IGhvbm9yIHZpcnR1YWwga2V5Ym9hcmQgb3B0aW9uIHdoZW4gbm90IG9uIG1vYmlsZSxcblx0XHQjb3RoZXJ3aXNlIGlnbm9yZVxuXHRcdGlmICFVdGlscy5pc01vYmlsZSgpICYmIG9wdGlvbnMudmlydHVhbEtleWJvYXJkIGlzIHRydWVcblx0XHRcdEBpbnB1dC5hZGRFdmVudExpc3RlbmVyIFwiZm9jdXNcIiwgLT5cblx0XHRcdFx0ZXhwb3J0cy5rZXlib2FyZExheWVyLmJyaW5nVG9Gcm9udCgpXG5cdFx0XHRcdGV4cG9ydHMua2V5Ym9hcmRMYXllci5zdGF0ZUN5Y2xlKClcblx0XHRcdEBpbnB1dC5hZGRFdmVudExpc3RlbmVyIFwiYmx1clwiLCAtPlxuXHRcdFx0XHRleHBvcnRzLmtleWJvYXJkTGF5ZXIuYW5pbWF0ZShcImRlZmF1bHRcIilcblxuXHR1cGRhdGVQbGFjZWhvbGRlckNvbG9yOiAoY29sb3IpIC0+XG5cdFx0QHBsYWNlaG9sZGVyQ29sb3IgPSBjb2xvclxuXHRcdGlmIEBwYWdlU3R5bGU/XG5cdFx0XHRkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkIEBwYWdlU3R5bGVcblx0XHRAcGFnZVN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInN0eWxlXCJcblx0XHRAcGFnZVN0eWxlLnR5cGUgPSBcInRleHQvY3NzXCJcblx0XHRjc3MgPSBcIiMje0BpbnB1dC5pZH06Oi13ZWJraXQtaW5wdXQtcGxhY2Vob2xkZXIgeyBjb2xvcjogI3tAcGxhY2Vob2xkZXJDb2xvcn07IH1cIlxuXHRcdEBwYWdlU3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUgY3NzKVxuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQgQHBhZ2VTdHlsZVxuXG5cdGZvY3VzOiAoKSAtPlxuXHRcdEBpbnB1dC5mb2N1cygpXG5cblx0dW5mb2N1czogKCkgLT5cblx0XHRAaW5wdXQuYmx1cigpXG5cblx0b25Gb2N1czogKGNiKSAtPlxuXHRcdEBpbnB1dC5hZGRFdmVudExpc3RlbmVyIFwiZm9jdXNcIiwgLT5cblx0XHRcdGNiLmFwcGx5KEApXG5cblx0b25CbHVyOiAoY2IpIC0+XG5cdFx0QGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgXCJibHVyXCIsIC0+XG5cdFx0XHRjYi5hcHBseShAKVxuXG5cdG9uVW5mb2N1czogdGhpcy5vbkJsdXJcblx0XG5cdGRpc2FibGU6ICgpIC0+XG5cdFx0QGlucHV0LnNldEF0dHJpYnV0ZSBcImRpc2FibGVkXCIsIHRydWVcblxuXHRlbmFibGU6ICgpID0+XG5cdFx0QGlucHV0LnJlbW92ZUF0dHJpYnV0ZSBcImRpc2FibGVkXCIsIHRydWVcblx0XG4iLCJjbGFzcyBleHBvcnRzLkNhbWVyYUlucHV0IGV4dGVuZHMgVGV4dExheWVyXG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cdFx0Xy5kZWZhdWx0cyBAb3B0aW9ucyxcblx0XHRcdGlnbm9yZUV2ZW50czogZmFsc2Vcblx0XHRzdXBlciBAb3B0aW9uc1xuXG5cdFx0QGNoYW5nZUhhbmRsZXIgPSAoZXZlbnQpIC0+XG5cdFx0XHRpZihAb3B0aW9ucy5jYWxsYmFjaylcblx0XHRcdFx0ZmlsZSA9IEBfZWxlbWVudC5maWxlc1swXVxuXHRcdFx0XHR1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpXG5cdFx0XHRcdEBvcHRpb25zLmNhbGxiYWNrKHVybCwgZmlsZS50eXBlKVxuXG5cdFx0QGNoYW5nZUhhbmRsZXIgPSBAY2hhbmdlSGFuZGxlci5iaW5kIEBcblx0XHRFdmVudHMud3JhcChAX2VsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIgXCJjaGFuZ2VcIiwgQGNoYW5nZUhhbmRsZXJcblxuXHRfY3JlYXRlRWxlbWVudDogLT5cblx0XHRyZXR1cm4gaWYgQF9lbGVtZW50P1xuXHRcdEBfZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJpbnB1dFwiXG5cdFx0QF9lbGVtZW50LnR5cGUgPSBcImZpbGVcIlxuXHRcdEBfZWxlbWVudC5jYXB0dXJlID0gdHJ1ZVxuXHRcdEBfZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZnJhbWVyTGF5ZXJcIilcblx0XHRAX2VsZW1lbnQuc3R5bGVbXCItd2Via2l0LWFwcGVhcmFuY2VcIl0gPSBcIm5vbmVcIlxuXHRcdEBfZWxlbWVudC5zdHlsZVtcIi13ZWJraXQtdGV4dC1zaXplLWFkanVzdFwiXSA9IFwibm9uZVwiXG5cdFx0QF9lbGVtZW50LnN0eWxlW1wib3V0bGluZVwiXSA9IFwibm9uZVwiXG5cdFx0c3dpdGNoIEBvcHRpb25zLmFjY2VwdFxuXHRcdFx0d2hlbiBcImltYWdlXCIgdGhlbiBAX2VsZW1lbnQuYWNjZXB0ID0gXCJpbWFnZS8qXCJcblx0XHRcdHdoZW4gXCJ2aWRlb1wiIHRoZW4gQF9lbGVtZW50LmFjY2VwdCA9IFwidmlkZW8vKlwiXG5cdFx0XHRlbHNlIEBfZWxlbWVudC5hY2NlcHQgPSBcImltYWdlLyosdmlkZW8vKlwiXG5cblx0QGRlZmluZSBcImFjY2VwdFwiLFxuXHRcdGdldDogLT5cblx0XHRcdEBfZWxlbWVudC5hY2NlcHRcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdHN3aXRjaCB2YWx1ZVxuXHRcdFx0XHR3aGVuIFwiaW1hZ2VcIiB0aGVuIEBfZWxlbWVudC5hY2NlcHQgPSBcImltYWdlLypcIlxuXHRcdFx0XHR3aGVuIFwidmlkZW9cIiB0aGVuIEBfZWxlbWVudC5hY2NlcHQgPSBcInZpZGVvLypcIlxuXHRcdFx0XHRlbHNlIEBfZWxlbWVudC5hY2NlcHQgPSBcImltYWdlLyosdmlkZW8vKlwiIiwiIyBLZXlzXG5leHBvcnRzLmJhY2tzcGFjZSA9IDhcbmV4cG9ydHMudGFiID0gOVxuZXhwb3J0cy5lbnRlciA9IDEzXG5leHBvcnRzLnNoaWZ0ID0gMTZcbmV4cG9ydHMuY3RybCA9IDE3XG5leHBvcnRzLmFsdCA9IDE4XG5cbmV4cG9ydHMuY2FwcyA9IDIwXG5leHBvcnRzLmVzY2FwZSA9IDI3XG5leHBvcnRzLnBhZ2VVcCA9IDMzXG5leHBvcnRzLnBhZ2VEb3duID0gMzRcblxuZXhwb3J0cy5sZWZ0ID0gMzdcbmV4cG9ydHMudXAgPSAzOFxuZXhwb3J0cy5yaWdodCA9IDM5XG5leHBvcnRzLmRvd24gPSA0MFxuZXhwb3J0cy5kZWxldGUgPSA0NlxuXG5leHBvcnRzLnplcm8gPSA0OFxuZXhwb3J0cy5vbmUgPSA0OVxuZXhwb3J0cy50d28gPSA1MFxuZXhwb3J0cy50aHJlZSA9IDUxXG5leHBvcnRzLmZvdXIgPSA1MlxuZXhwb3J0cy5maXZlID0gNTNcbmV4cG9ydHMuc2l4ID0gNTRcbmV4cG9ydHMuc2V2ZW4gPSA1NVxuZXhwb3J0cy5laWdodCA9IDU2XG5leHBvcnRzLm5pbmUgPSA1N1xuXG5leHBvcnRzLmEgPSA2NVxuZXhwb3J0cy5iID0gNjZcbmV4cG9ydHMuYyA9IDY3XG5leHBvcnRzLmQgPSA2OFxuZXhwb3J0cy5lID0gNjlcbmV4cG9ydHMuZiA9IDcwXG5leHBvcnRzLmcgPSA3MVxuZXhwb3J0cy5oID0gNzJcbmV4cG9ydHMuaSA9IDczXG5leHBvcnRzLmogPSA3NFxuZXhwb3J0cy5rID0gNzVcbmV4cG9ydHMubCA9IDc2XG5leHBvcnRzLm0gPSA3N1xuZXhwb3J0cy5uID0gNzhcbmV4cG9ydHMubyA9IDc5XG5leHBvcnRzLnAgPSA4MFxuZXhwb3J0cy5xID0gODFcbmV4cG9ydHMuciA9IDgyXG5leHBvcnRzLnMgPSA4M1xuZXhwb3J0cy50ID0gODRcbmV4cG9ydHMudSA9IDg1XG5leHBvcnRzLnYgPSA4NlxuZXhwb3J0cy53ID0gODdcbmV4cG9ydHMueCA9IDg4XG5leHBvcnRzLnkgPSA4OVxuZXhwb3J0cy56ID0gOTBcblxuZXhwb3J0cy5udW1aZXJvID0gOTZcbmV4cG9ydHMubnVtT25lID0gOTdcbmV4cG9ydHMubnVtVHdvID0gOThcbmV4cG9ydHMubnVtVGhyZWUgPSA5OVxuZXhwb3J0cy5udW1Gb3VyID0gMTAwXG5leHBvcnRzLm51bUZpdmUgPSAxMDFcbmV4cG9ydHMubnVtU2l4ID0gMTAyXG5leHBvcnRzLm51bVNldmVuID0gMTAzXG5leHBvcnRzLm51bUVpZ2h0ID0gMTA0XG5leHBvcnRzLm51bU5pbmUgPSAxMDVcblxuZXhwb3J0cy5mT25lID0gMTEyXG5leHBvcnRzLmZUd28gPSAxMTNcbmV4cG9ydHMuZlRocmVlID0gMTE0XG5leHBvcnRzLmZGb3VyID0gMTE1XG5leHBvcnRzLmZGaXZlID0gMTE2XG5leHBvcnRzLmZTaXggPSAxMTdcbmV4cG9ydHMuZlNldmVuID0gMTE4XG5leHBvcnRzLmZFaWdodCA9IDExOVxuZXhwb3J0cy5mTmluZSA9IDEyMFxuZXhwb3J0cy5mVGVuID0gMTIxXG5cbmV4cG9ydHMuc2VtaUNvbG9uID0gMTg2XG5leHBvcnRzLmVxdWFsU2lnbiA9IDE4N1xuZXhwb3J0cy5jb21tYSA9IDE4OFxuZXhwb3J0cy5kYXNoID0gMTg5XG5leHBvcnRzLnBlcmlvZCA9IDE5MFxuZXhwb3J0cy5mb3J3YXJkU2xhc2ggPSAxOTFcbmV4cG9ydHMub3BlbkJyYWNrZXQgPSAyMTlcbmV4cG9ydHMuYmFja1NsYXNoID0gMjIwXG5leHBvcnRzLmNsb3NlQnJhY2tldCA9IDIyMVxuZXhwb3J0cy5zaW5nbGVRdW90ZSA9IDIyMlxuXG5rZXlNYXAgPSB7fVxuXG5leHBvcnRzLm9uS2V5ID0gKGtleSwgaGFuZGxlciwgdGhyb3R0bGVUaW1lKSAtPlxuICAgIGtleU1hcFtrZXldID0gVXRpbHMudGhyb3R0bGUgdGhyb3R0bGVUaW1lLCBoYW5kbGVyXG5cbmV4cG9ydHMub2ZmS2V5ID0gKGtleSkgLT5cbiAgICBkZWxldGUga2V5TWFwW2tleV1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZXZlbnQpIC0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGhhbmRsZXIgPSBrZXlNYXBbZXZlbnQua2V5Q29kZV1cbiAgICBpZiAoaGFuZGxlcilcbiAgICAgICAgaGFuZGxlcigpIiwiY2xhc3MgQ2FtZXJhTGF5ZXIgZXh0ZW5kcyBWaWRlb0xheWVyXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIGN1c3RvbVByb3BzID1cbiAgICAgIGZhY2luZzogdHJ1ZVxuICAgICAgZmxpcHBlZDogdHJ1ZVxuICAgICAgYXV0b0ZsaXA6IHRydWVcbiAgICAgIHJlc29sdXRpb246IHRydWVcbiAgICAgIGZpdDogdHJ1ZVxuXG4gICAgYmFzZU9wdGlvbnMgPSBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgICAgLmZpbHRlciAoa2V5KSAtPiAhY3VzdG9tUHJvcHNba2V5XVxuICAgICAgLnJlZHVjZSAoY2xvbmUsIGtleSkgLT5cbiAgICAgICAgY2xvbmVba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgICBjbG9uZVxuICAgICAgLCB7fVxuXG4gICAgc3VwZXIoYmFzZU9wdGlvbnMpXG5cbiAgICBAX2ZhY2luZyA9IG9wdGlvbnMuZmFjaW5nID8gJ2JhY2snXG4gICAgQF9mbGlwcGVkID0gb3B0aW9ucy5mbGlwcGVkID8gZmFsc2VcbiAgICBAX2F1dG9GbGlwID0gb3B0aW9ucy5hdXRvRmxpcCA/IHRydWVcbiAgICBAX3Jlc29sdXRpb24gPSBvcHRpb25zLnJlc29sdXRpb24gPyA0ODBcblxuICAgIEBfc3RhcnRlZCA9IGZhbHNlXG4gICAgQF9kZXZpY2UgPSBudWxsXG4gICAgQF9tYXRjaGVkRmFjaW5nID0gJ3Vua25vd24nXG4gICAgQF9zdHJlYW0gPSBudWxsXG4gICAgQF9zY2hlZHVsZWRSZXN0YXJ0ID0gbnVsbFxuICAgIEBfcmVjb3JkaW5nID0gbnVsbFxuXG4gICAgQGJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcbiAgICBAY2xpcCA9IHRydWVcblxuICAgIEBwbGF5ZXIuc3JjID0gJydcbiAgICBAcGxheWVyLmF1dG9wbGF5ID0gdHJ1ZVxuICAgIEBwbGF5ZXIubXV0ZWQgPSB0cnVlXG4gICAgQHBsYXllci5wbGF5c2lubGluZSA9IHRydWVcbiAgICBAcGxheWVyLnN0eWxlLm9iamVjdEZpdCA9IG9wdGlvbnMuZml0ID8gJ2NvdmVyJ1xuXG4gIEBkZWZpbmUgJ2ZhY2luZycsXG4gICAgZ2V0OiAtPiBAX2ZhY2luZ1xuICAgIHNldDogKGZhY2luZykgLT5cbiAgICAgIEBfZmFjaW5nID0gaWYgZmFjaW5nID09ICdmcm9udCcgdGhlbiBmYWNpbmcgZWxzZSAnYmFjaydcbiAgICAgIEBfc2V0UmVzdGFydCgpXG5cbiAgQGRlZmluZSAnZmxpcHBlZCcsXG4gICAgZ2V0OiAtPiBAX2ZsaXBwZWRcbiAgICBzZXQ6IChmbGlwcGVkKSAtPlxuICAgICAgQF9mbGlwcGVkID0gZmxpcHBlZFxuICAgICAgQF9zZXRSZXN0YXJ0KClcblxuICBAZGVmaW5lICdhdXRvRmxpcCcsXG4gICAgZ2V0OiAtPiBAX2F1dG9GbGlwXG4gICAgc2V0OiAoYXV0b0ZsaXApIC0+XG4gICAgICBAX2F1dG9GbGlwID0gYXV0b0ZsaXBcbiAgICAgIEBfc2V0UmVzdGFydCgpXG5cbiAgQGRlZmluZSAncmVzb2x1dGlvbicsXG4gICAgZ2V0OiAtPiBAX3Jlc29sdXRpb25cbiAgICBzZXQ6IChyZXNvbHV0aW9uKSAtPlxuICAgICAgQF9yZXNvbHV0aW9uID0gcmVzb2x1dGlvblxuICAgICAgQF9zZXRSZXN0YXJ0KClcblxuICBAZGVmaW5lICdmaXQnLFxuICAgIGdldDogLT4gQHBsYXllci5zdHlsZS5vYmplY3RGaXRcbiAgICBzZXQ6IChmaXQpIC0+IEBwbGF5ZXIuc3R5bGUub2JqZWN0Rml0ID0gZml0XG5cbiAgQGRlZmluZSAnaXNSZWNvcmRpbmcnLFxuICAgIGdldDogLT4gQF9yZWNvcmRpbmc/LnJlY29yZGVyLnN0YXRlID09ICdyZWNvcmRpbmcnXG5cbiAgdG9nZ2xlRmFjaW5nOiAtPlxuICAgIEBfZmFjaW5nID0gaWYgQF9mYWNpbmcgPT0gJ2Zyb250JyB0aGVuICdiYWNrJyBlbHNlICdmcm9udCdcbiAgICBAX3NldFJlc3RhcnQoKVxuXG4gIGNhcHR1cmU6ICh3aWR0aCA9IEB3aWR0aCwgaGVpZ2h0ID0gQGhlaWdodCwgcmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbykgLT5cbiAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gICAgY2FudmFzLndpZHRoID0gcmF0aW8gKiB3aWR0aFxuICAgIGNhbnZhcy5oZWlnaHQgPSByYXRpbyAqIGhlaWdodFxuXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIilcbiAgICBAZHJhdyhjb250ZXh0KVxuXG4gICAgdXJsID0gY2FudmFzLnRvRGF0YVVSTCgpXG4gICAgQGVtaXQoJ2NhcHR1cmUnLCB1cmwpXG5cbiAgICB1cmxcblxuICBkcmF3OiAoY29udGV4dCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGNvbnRleHRcblxuICAgIGNvdmVyID0gKHNyY1csIHNyY0gsIGRzdFcsIGRzdEgpIC0+XG4gICAgICBzY2FsZVggPSBkc3RXIC8gc3JjV1xuICAgICAgc2NhbGVZID0gZHN0SCAvIHNyY0hcbiAgICAgIHNjYWxlID0gaWYgc2NhbGVYID4gc2NhbGVZIHRoZW4gc2NhbGVYIGVsc2Ugc2NhbGVZXG4gICAgICB3aWR0aDogc3JjVyAqIHNjYWxlLCBoZWlnaHQ6IHNyY0ggKiBzY2FsZVxuXG4gICAge3ZpZGVvV2lkdGgsIHZpZGVvSGVpZ2h0fSA9IEBwbGF5ZXJcblxuICAgIGNsaXBCb3ggPSB3aWR0aDogY29udGV4dC5jYW52YXMud2lkdGgsIGhlaWdodDogY29udGV4dC5jYW52YXMuaGVpZ2h0XG4gICAgbGF5ZXJCb3ggPSBjb3ZlcihAd2lkdGgsIEBoZWlnaHQsIGNsaXBCb3gud2lkdGgsIGNsaXBCb3guaGVpZ2h0KVxuICAgIHZpZGVvQm94ID0gY292ZXIodmlkZW9XaWR0aCwgdmlkZW9IZWlnaHQsIGxheWVyQm94LndpZHRoLCBsYXllckJveC5oZWlnaHQpXG5cbiAgICB4ID0gKGNsaXBCb3gud2lkdGggLSB2aWRlb0JveC53aWR0aCkgLyAyXG4gICAgeSA9IChjbGlwQm94LmhlaWdodCAtIHZpZGVvQm94LmhlaWdodCkgLyAyXG5cbiAgICBjb250ZXh0LmRyYXdJbWFnZShAcGxheWVyLCB4LCB5LCB2aWRlb0JveC53aWR0aCwgdmlkZW9Cb3guaGVpZ2h0KVxuXG4gIHN0YXJ0OiAtPlxuICAgIEBfZW51bWVyYXRlRGV2aWNlcygpXG4gICAgLnRoZW4gKGRldmljZXMpID0+XG4gICAgICBkZXZpY2VzID0gZGV2aWNlcy5maWx0ZXIgKGRldmljZSkgLT4gZGV2aWNlLmtpbmQgPT0gJ3ZpZGVvaW5wdXQnXG5cbiAgICAgIGZvciBkZXZpY2UgaW4gZGV2aWNlc1xuICAgICAgICBpZiBkZXZpY2UubGFiZWwuaW5kZXhPZihAX2ZhY2luZykgIT0gLTFcbiAgICAgICAgICBAX21hdGNoZWRGYWNpbmcgPSBAX2ZhY2luZ1xuICAgICAgICAgIHJldHVybiBkZXZpY2VcblxuICAgICAgQF9tYXRjaGVkRmFjaW5nID0gJ3Vua25vd24nXG5cbiAgICAgIGlmIGRldmljZXMubGVuZ3RoID4gMCB0aGVuIGRldmljZXNbMF0gZWxzZSBQcm9taXNlLnJlamVjdCgpXG5cbiAgICAudGhlbiAoZGV2aWNlKSA9PlxuICAgICAgcmV0dXJuIGlmICFkZXZpY2UgfHwgZGV2aWNlLmRldmljZUlkID09IEBfZGV2aWNlPy5kZXZpY2VJZFxuXG4gICAgICBAc3RvcCgpXG4gICAgICBAX2RldmljZSA9IGRldmljZVxuXG4gICAgICBjb25zdHJhaW50cyA9XG4gICAgICAgIHZpZGVvOlxuICAgICAgICAgIG1hbmRhdG9yeToge21pbldpZHRoOiBAX3Jlc29sdXRpb24sIG1pbkhlaWdodDogQF9yZXNvbHV0aW9ufVxuICAgICAgICAgIG9wdGlvbmFsOiBbe3NvdXJjZUlkOiBAX2RldmljZS5kZXZpY2VJZH1dXG4gICAgICAgIGF1ZGlvOlxuICAgICAgICAgIHRydWVcblxuICAgICAgQF9nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXG5cbiAgICAudGhlbiAoc3RyZWFtKSA9PlxuICAgICAgQHBsYXllci5zcmNPYmplY3QgPSBzdHJlYW1cbiAgICAgIEBfc3RhcnRlZCA9IHRydWVcbiAgICAgIEBfc3RyZWFtID0gc3RyZWFtXG4gICAgICBAX2ZsaXAoKVxuXG4gICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG5cbiAgc3RvcDogLT5cbiAgICBAX3N0YXJ0ZWQgPSBmYWxzZVxuXG4gICAgQHBsYXllci5wYXVzZSgpXG4gICAgQHBsYXllci5zcmNPYmplY3QgPSBudWxsXG5cbiAgICBAX3N0cmVhbT8uZ2V0VHJhY2tzKCkuZm9yRWFjaCAodHJhY2spIC0+IHRyYWNrLnN0b3AoKVxuICAgIEBfc3RyZWFtID0gbnVsbFxuICAgIEBfZGV2aWNlID0gbnVsbFxuXG4gICAgaWYgQF9zY2hlZHVsZWRSZXN0YXJ0XG4gICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShAX3NjaGVkdWxlZFJlc3RhcnQpXG4gICAgICBAX3NjaGVkdWxlZFJlc3RhcnQgPSBudWxsXG5cbiAgc3RhcnRSZWNvcmRpbmc6IC0+XG4gICAgaWYgQF9yZWNvcmRpbmdcbiAgICAgIEBfcmVjb3JkaW5nLnJlY29yZGVyLnN0b3AoKVxuICAgICAgQF9yZWNvcmRpbmcgPSBudWxsXG5cbiAgICBjaHVua3MgPSBbXVxuXG4gICAgcmVjb3JkZXIgPSBuZXcgTWVkaWFSZWNvcmRlcihAX3N0cmVhbSwge21pbWVUeXBlOiAndmlkZW8vd2VibSd9KVxuICAgIHJlY29yZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ3N0YXJ0JywgKGV2ZW50KSA9PiBAZW1pdCgnc3RhcnRyZWNvcmRpbmcnKVxuICAgIHJlY29yZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2RhdGFhdmFpbGFibGUnLCAoZXZlbnQpIC0+IGNodW5rcy5wdXNoKGV2ZW50LmRhdGEpXG4gICAgcmVjb3JkZXIuYWRkRXZlbnRMaXN0ZW5lciAnc3RvcCcsIChldmVudCkgPT5cbiAgICAgIGJsb2IgPSBuZXcgQmxvYihjaHVua3MpXG4gICAgICB1cmwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAgQGVtaXQoJ3N0b3ByZWNvcmRpbmcnKVxuICAgICAgQGVtaXQoJ3JlY29yZCcsIHVybClcblxuICAgIHJlY29yZGVyLnN0YXJ0KClcblxuICAgIEBfcmVjb3JkaW5nID0ge3JlY29yZGVyLCBjaHVua3N9XG5cbiAgc3RvcFJlY29yZGluZzogLT5cbiAgICByZXR1cm4gaWYgIUBfcmVjb3JkaW5nXG4gICAgQF9yZWNvcmRpbmcucmVjb3JkZXIuc3RvcCgpXG4gICAgQF9yZWNvcmRpbmcgPSBudWxsXG5cbiAgb25DYXB0dXJlOiAoY2FsbGJhY2spIC0+IEBvbignY2FwdHVyZScsIGNhbGxiYWNrKVxuICBvblN0YXJ0UmVjb3JkaW5nOiAoY2FsbGJhY2spIC0+IEBvbignc3RhcnRyZWNvcmRpbmcnLCBjYWxsYmFjaylcbiAgb25TdG9wUmVjb3JkaW5nOiAoY2FsbGJhY2spIC0+IEBvbignc3RvcHJlY29yZGluZycsIGNhbGxiYWNrKVxuICBvblJlY29yZDogKGNhbGxiYWNrKSAtPiBAb24oJ3JlY29yZCcsIGNhbGxiYWNrKVxuXG4gIF9zZXRSZXN0YXJ0OiAtPlxuICAgIHJldHVybiBpZiAhQF9zdGFydGVkIHx8IEBfc2NoZWR1bGVkUmVzdGFydFxuXG4gICAgQF9zY2hlZHVsZWRSZXN0YXJ0ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICBAX3NjaGVkdWxlZFJlc3RhcnQgPSBudWxsXG4gICAgICBAc3RhcnQoKVxuXG4gIF9mbGlwOiAtPlxuICAgIEBfZmxpcHBlZCA9IEBfbWF0Y2hlZEZhY2luZyA9PSAnZnJvbnQnIGlmIEBfYXV0b0ZsaXBcbiAgICB4ID0gaWYgQF9mbGlwcGVkIHRoZW4gLTEgZWxzZSAxXG4gICAgQHBsYXllci5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBcInNjYWxlKCN7eH0sIDEpXCJcblxuICBfZW51bWVyYXRlRGV2aWNlczogLT5cbiAgICB0cnlcbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXG4gICAgY2F0Y2hcbiAgICAgIFByb21pc2UucmVqZWN0KClcblxuICBfZ2V0VXNlck1lZGlhOiAoY29uc3RyYWludHMpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHRyeVxuICAgICAgICBndW0gPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWFcbiAgICAgICAgZ3VtLmNhbGwobmF2aWdhdG9yLCBjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgY2F0Y2hcbiAgICAgICAgcmVqZWN0KClcblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmFMYXllciBpZiBtb2R1bGU/XG5GcmFtZXIuQ2FtZXJhTGF5ZXIgPSBDYW1lcmFMYXllclxuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFLQUE7QURBQSxJQUFBLFdBQUE7RUFBQTs7O0FBQU07OztFQUNTLHFCQUFDLE9BQUQ7QUFDWCxRQUFBOztNQURZLFVBQVU7O0lBQ3RCLFdBQUEsR0FDRTtNQUFBLE1BQUEsRUFBUSxJQUFSO01BQ0EsT0FBQSxFQUFTLElBRFQ7TUFFQSxRQUFBLEVBQVUsSUFGVjtNQUdBLFVBQUEsRUFBWSxJQUhaO01BSUEsR0FBQSxFQUFLLElBSkw7O0lBTUYsV0FBQSxHQUFjLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixDQUNaLENBQUMsTUFEVyxDQUNKLFNBQUMsR0FBRDthQUFTLENBQUMsV0FBWSxDQUFBLEdBQUE7SUFBdEIsQ0FESSxDQUVaLENBQUMsTUFGVyxDQUVKLFNBQUMsS0FBRCxFQUFRLEdBQVI7TUFDTixLQUFNLENBQUEsR0FBQSxDQUFOLEdBQWEsT0FBUSxDQUFBLEdBQUE7YUFDckI7SUFGTSxDQUZJLEVBS1YsRUFMVTtJQU9kLDZDQUFNLFdBQU47SUFFQSxJQUFDLENBQUEsT0FBRCwwQ0FBNEI7SUFDNUIsSUFBQyxDQUFBLFFBQUQsNkNBQThCO0lBQzlCLElBQUMsQ0FBQSxTQUFELDhDQUFnQztJQUNoQyxJQUFDLENBQUEsV0FBRCxnREFBb0M7SUFFcEMsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsY0FBRCxHQUFrQjtJQUNsQixJQUFDLENBQUEsT0FBRCxHQUFXO0lBQ1gsSUFBQyxD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
