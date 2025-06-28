function CMenu() {
  var _pStartPosFullscreen;

  var _oBg;
  var _oButPlay;
  var _oFade;
  var _oButFullscreen;
  var _fRequestFullScreen = null;
  var _fCancelFullScreen = null;

  this._init = function () {
    _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(_oBg);

    // const _backdrop = new createjs.Shape();
    // _backdrop.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(0, CANVAS_HEIGHT - 230, CANVAS_WIDTH, 230);
    // s_oStage.addChild(_backdrop);

    var oSprite = s_oSpriteLibrary.getSprite("but_play");
    _oButPlay = new CGfxButton(0, 0, oSprite);
    _oButPlay.setScaleX(1.8);
    _oButPlay.setScaleY(1.8);
    _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
    _oButPlay.pulseAnimation();

    s_iBestScore = getItem(LOCALSTORAGE_STRING[LOCAL_BEST_SCORE]);
    if (s_iBestScore === null) {
      s_iBestScore = 0;
    }

    // const _tagline = new createjs.Text("LOADING...", "20px " + SECONDARY_FONT, "#f00");
    // _tagline.x = CANVAS_WIDTH / 2 - 120;
    // _tagline.y = CANVAS_HEIGHT / 2 + 50;
    // _tagline.textBaseline = "alphabetic";
    // s_oStage.addChild(_tagline);

    var doc = window.document;
    var docEl = doc.documentElement;
    _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (ENABLE_FULLSCREEN === false) {
      _fRequestFullScreen = false;
    }

    if (_fRequestFullScreen && screenfull.isEnabled) {
      oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
      _pStartPosFullscreen = { x: oSprite.width / 4 + 10, y: oSprite.height / 2 + 10 };

      _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
      _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
    }

    _oFade = new createjs.Shape();
    _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    s_oStage.addChild(_oFade);

    createjs.Tween.get(_oFade)
      .to({ alpha: 0 }, 1000)
      .call(function () {
        _oFade.visible = false;
      });

    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };

  this.refreshButtonPos = function (iNewX, iNewY) {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
    }

    // if (s_bLandscape) {
    //   _oButPlay.setX(CANVAS_WIDTH / 2 + 500);
    //   _oButPlay.setY(CANVAS_HEIGHT / 2 + 200);
    // } else {
    _oButPlay.setX(CANVAS_WIDTH / 2);
    _oButPlay.setY(CANVAS_HEIGHT / 2 + 55);
    // }
  };

  this.unload = function () {
    _oButPlay.unload();
    _oButPlay = null;

    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.unload();
    }
    s_oStage.removeAllChildren();

    s_oMenu = null;
  };

  this._onButPlayRelease = function () {
    this.unload();

    s_oMain.gotoGame();
  };

  this.resetFullscreenBut = function () {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setActive(s_bFullscreen);
    }
  };

  this._onFullscreenRelease = function () {
    if (s_bFullscreen) {
      _fCancelFullScreen.call(window.document);
    } else {
      _fRequestFullScreen.call(window.document.documentElement);
    }

    sizeHandler();
  };

  s_oMenu = this;

  this._init();
}

var s_oMenu = null;
