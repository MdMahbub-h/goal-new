function CWinPanel(oParentContainer) {
  var _oFade;
  var _oTitleText;
  var _oContainer;
  var _oParentContainer = oParentContainer;

  this._init = function () {
    _oContainer = new createjs.Container();
    _oContainer.x = CANVAS_WIDTH / 2;
    _oContainer.y = CANVAS_HEIGHT / 2;
    _oContainer.alpha = 0;
    _oContainer.visible = false;
    _oParentContainer.addChild(_oContainer);

    _oFade = new createjs.Shape();
    _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRoundRect(-250, -160, 500, 200, 10);
    _oFade.alpha = 0.7;
    _oContainer.addChild(_oFade);

    _oTitleText = new CCTLText(_oContainer, -220, -110, 440, 80, 80, "center", TEXT_COLOR, SECONDARY_FONT, 1, 0, 0, " ", true, true, true, false);
  };

  this.unload = function () {
    s_oStage.removeChild(_oContainer);
  };

  this.show = function (iScore, iStake) {
    if (iScore >= iStake) {
      _oTitleText.setColor(GAME_COLOR_2);
      _oTitleText.refreshText("Game Won");
    } else {
      _oTitleText.setColor(GAME_COLOR_1);
      _oTitleText.refreshText("Game Lost");
    }
    _oContainer.visible = true;

    createjs.Tween.get(_oContainer)
      .wait(MS_WAIT_SHOW_GAME_OVER_PANEL)
      .to({ alpha: 1 }, 1250, createjs.Ease.cubicOut)
      .call(function () {
        $(s_oMain).trigger("show_interlevel_ad");
      });

    setTimeout(() => {
      this._onRestart();
    }, 2000);
  };

  this._onContinue = function () {
    var oParent = this;
    createjs.Tween.get(_oContainer, { override: true })
      .to({ alpha: 0 }, 750, createjs.Ease.cubicOut)
      .call(function () {
        oParent.unload();
      });
    s_oGame.onContinue();
  };

  this._onRestart = function () {
    this.unload();
    s_oGame.resetGame();
  };

  this._init();

  return this;
}
