'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _debounce2 = require('lodash/debounce');

var _debounce3 = _interopRequireDefault(_debounce2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * author cuishijie
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * face-web component
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * apis props
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @onChange (function) output base64 real time
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @debounceTime (String)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @className (String) for cover container style
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var canvas = void 0,
    canvas2 = void 0,
    context = void 0,
    context2 = void 0,
    video = void 0;
var timer = true;

var FaceWeb = function (_React$Component) {
  _inherits(FaceWeb, _React$Component);

  function FaceWeb() {
    _classCallCheck(this, FaceWeb);

    return _possibleConstructorReturn(this, (FaceWeb.__proto__ || Object.getPrototypeOf(FaceWeb)).apply(this, arguments));
  }

  _createClass(FaceWeb, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initFace();
    }
  }, {
    key: 'initFace',
    value: function initFace() {
      var _this2 = this;

      var _props$debounceTime = this.props.debounceTime,
          debounceTime = _props$debounceTime === undefined ? 0 : _props$debounceTime;


      video = document.getElementById('_videoFace');
      canvas = document.getElementById('_canvasFace');
      canvas2 = document.getElementById('_canvas2Face');
      context = canvas.getContext('2d');
      context2 = canvas2.getContext('2d');

      var tracker = new tracking.ObjectTracker('face');
      tracker.setInitialScale(4);
      tracker.setStepSize(1);
      tracker.setEdgesDensity(0.1);

      tracking.track('#_videoFace', tracker, { camera: true });

      tracker.on('track', function (event) {
        // no-face
        if (event.data.length === 0) return;
        // debounce
        if (timer) {
          _this2.draw(event);
          timer = false;
          setTimeout(function () {
            timer = true;
          }, debounceTime);
        }
      });
    }

    // draw

  }, {
    key: 'draw',
    value: function draw(event) {
      var onChange = this.props.onChange;


      context.clearRect(0, 0, canvas.width, canvas.height);

      event.data.forEach(function (rect) {
        context.strokeStyle = '#10ff87';
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.font = '11px Helvetica';
        context.fillStyle = "#fff";
        context.fillText("x:" + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
      });

      context2.drawImage(video, 0, 0, 200, 150);
      var snapData = canvas2.toDataURL('image/jpeg');
      var imgSrc = "data:image/jpeg;" + snapData;
      // sync
      onChange(imgSrc);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props$className = this.props.className,
          className = _props$className === undefined ? '' : _props$className;

      return _react2.default.createElement(
        'div',
        { className: className },
        _react2.default.createElement('video', {
          id: '_videoFace',
          width: '375',
          height: '200',
          preload: true,
          autoPlay: true,
          loop: true,
          muted: true
        }),
        _react2.default.createElement('canvas', { id: '_canvasFace', width: '375', height: '200' }),
        _react2.default.createElement(
          'div',
          { style: { display: 'none' } },
          _react2.default.createElement('canvas', { id: '_canvas2Face', width: '375', height: '200' })
        )
      );
    }
  }]);

  return FaceWeb;
}(_react2.default.Component);

exports.default = FaceWeb;