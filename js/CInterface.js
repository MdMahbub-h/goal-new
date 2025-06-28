function CInterface() {
  var _pStartPosFullscreen;
  var _oButFullscreen;
  var _oWinPanel = null;
  var _oHelpText;
  var _oStatsBoard;

  var _iStep;
  var _iScore;
  var _iStake;
  var _fCancelFullScreen = null;
  var _fRequestFullScreen = null;

  this._init = function () {
    var doc = window.document;
    var docEl = doc.documentElement;
    _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (ENABLE_FULLSCREEN === false) {
      _fRequestFullScreen = false;
    }

    if (_fRequestFullScreen && screenfull.isEnabled) {
      oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
      _pStartPosFullscreen = {
        x: oSprite.width / 4 + 10,
        y: oSprite.height / 2 + 10,
      };
      _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
      _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreen, this);
    }

    _oStatsBoard = new CStatsBoard(s_oStage);

    s_oGame.onExitHelp();

    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };

  this.refreshButtonPos = function (iNewX, iNewY) {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
    }
  };

  this.unloadHelpText = function () {
    if (_oHelpText !== null) {
      _oHelpText.fadeAnim(0, _oHelpText.unload);
      _oHelpText = null;
    }
  };

  this.unload = function () {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.unload();
      _oButFullscreen = null;
    }
    s_oInterface = null;
  };

  this.showHelpText = function () {
    _oHelpText = new CHelpText(s_oStage);
    _oHelpText.fadeAnim(1, null);
  };

  this.createWinPanel = function (iScore, iStake) {
    _oWinPanel = new CWinPanel(s_oStage);
    _oWinPanel.show(iScore, iStake);
  };

  this.refreshTextScoreBoard = function (iScore, fMultiplier, iScoreNoMult, bEffect) {
    _iScore = iScore;
    _oStatsBoard.refreshTextScore(iScore);
    if (bEffect) _oStatsBoard.effectAddScore(iScoreNoMult, fMultiplier);
  };

  this.refreshTextStakeBoard = function (iStake, fMultiplier, iScoreNoMult, bEffect) {
    _iStake = iStake;
    _oStatsBoard.refreshTextStake(iStake);
  };

  this.resetFullscreenBut = function () {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setActive(s_bFullscreen);
    }
  };

  this._onFullscreen = function () {
    if (s_bFullscreen) {
      _fCancelFullScreen.call(window.document);
    } else {
      _fRequestFullScreen.call(window.document.documentElement);
    }

    sizeHandler();
  };

  this.createAnimText = function (szText, iSize, bStrobo, szColor) {
    var oContainer = new createjs.Container();
    var oText = new CCTLText(oContainer, -300, 0, 600, iSize, iSize, "center", szColor, SECONDARY_FONT, 1, 0, 0, szText, true, true, true, false);

    oContainer.x = CANVAS_WIDTH_HALF;
    oContainer.y = -114;

    if (bStrobo) {
      s_oInterface.strobeText(oText.getText());
    }

    s_oStage.addChild(oContainer);

    createjs.Tween.get(oContainer)
      .to({ y: CANVAS_HEIGHT_HALF - 200 }, 500, createjs.Ease.cubicOut)
      .call(function () {
        createjs.Tween.get(oContainer)
          .wait(250)
          .to({ y: CANVAS_HEIGHT + 114 }, 500, createjs.Ease.cubicIn)
          .call(function () {
            if (bStrobo) {
              createjs.Tween.removeTweens(oText.getText());
            }
            s_oStage.removeChild(oContainer);
          });
      });
  };

  this.strobeText = function (oText) {
    createjs.Tween.get(oText)
      .wait(30)
      .call(function () {
        if (_iStep < TEXT_EXCELLENT_COLOR.length - 1) {
          _iStep++;
        } else {
          _iStep = 0;
        }
        oText.color = TEXT_EXCELLENT_COLOR[_iStep];
        s_oInterface.strobeText(oText);
      });
  };

  this.refreshLaunchBoard = function (iLaunch, iMaxLaunch) {
    _oStatsBoard.refreshTextLaunch(iLaunch, iMaxLaunch);
  };

  s_oInterface = this;

  this._init();

  return this;
}

var s_oInterface = null;
