function CHelpPanel(oParentContainer) {
  var _oButPlay;
  var _oFade;
  var _oContainer;
  var _oParentContainer = oParentContainer;

  var _oThis = this;

  this._init = function () {
    _oContainer = new createjs.Container();
    _oParentContainer.addChild(_oContainer);

    _oFade = new createjs.Shape();
    _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRoundRect(380, 420, 600, 200, 10);
    _oFade.alpha = 0.7;
    _oContainer.addChild(_oFade);

    var oTextStroke = new CCTLText(
      _oContainer,
      CANVAS_WIDTH / 2 - 270,
      CANVAS_HEIGHT_HALF - 260,
      540,
      200,
      70,
      "center",
      TEXT_COLOR_STROKE,
      GAME_FONT,
      1,
      0,
      0,
      TEXT_HELP_0,
      true,
      true,
      true,
      false
    );

    oTextStroke.setOutline(4);

    var oText = new CCTLText(
      _oContainer,
      CANVAS_WIDTH / 2 - 270,
      CANVAS_HEIGHT_HALF - 260,
      540,
      200,
      70,
      "center",
      TEXT_COLOR,
      GAME_FONT,
      1,
      0,
      0,
      TEXT_HELP_0,
      true,
      true,
      true,
      false
    );

    _oButPlay = new CGfxButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, s_oSpriteLibrary.getSprite("but_continue"), _oContainer);
    _oButPlay.addEventListener(ON_MOUSE_UP, this._onContinue, this);
  };

  this.show = function () {
    _oContainer.alpha = 0;
    _oContainer.visible = true;
    createjs.Tween.get(_oContainer).to({ alpha: 1 }, 400, createjs.Ease.quartOut);
  };

  this.hide = function () {
    createjs.Tween.get(_oContainer)
      .to({ alpha: 0 }, 400, createjs.Ease.quartOut)
      .call(function () {
        _oContainer.visible = false;
        s_oGame.onExitHelp();
      });
  };

  this.unload = function () {
    createjs.Tween.get(_oContainer)
      .to({ alpha: 0 }, 150, createjs.Ease.quartOut)
      .call(function () {
        _oParentContainer.removeChild(_oContainer, _oFade);
      });
  };

  this._onContinue = function () {
    _oButPlay.unload();
    _oThis.hide();
  };

  this._init();
}
