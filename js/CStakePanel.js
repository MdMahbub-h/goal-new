function CStakePanel(oParentContainer) {
  var _oParentContainer = oParentContainer;
  var _oBackground;
  var _oStakeBox;
  var _oPlaceStake;
  var _oContainer;
  var _iStake = 10;
  var _oThis = this;
  var _stakes = [];
  var _stakeTexts = [];
  var _oStakeText;
  var _oStakeText2;

  this._init = function () {
    _oContainer = new createjs.Container();
    _oContainer.x = CANVAS_WIDTH / 2;
    _oContainer.y = CANVAS_HEIGHT / 2 + 60;
    _oParentContainer.addChild(_oContainer);

    var oText = new CCTLText(_oContainer, -220, -220, 440, 200, 70, "center", TEXT_COLOR, SECONDARY_FONT, 1, 0, 0, "Place A\nStake", true, true, true, false);

    _oBackground = new createjs.Shape();
    _oBackground.graphics.beginFill("#ffffff").drawRoundRect(-340, 160, 680, 240, 30);
    _oBackground.alpha = 0.9;
    _oContainer.addChild(_oBackground);

    _oStakeBox = new createjs.Shape();
    _oStakeBox.graphics.beginFill(GAME_COLOR_1).drawRoundRect(-100, 170, 200, 50, 25);
    _oStakeBox.alpha = 0.9;
    _oContainer.addChild(_oStakeBox);

    this.writeText("STAKE", -50, 165, 100, 60, 30, "#ffffff");

    let _oIncreaseBox = new createjs.Shape();
    _oIncreaseBox.graphics.beginFill(GAME_COLOR_1).drawRoundRect(-300, 240, 240, 50, 25);
    _oIncreaseBox.alpha = 0.9;
    _oContainer.addChild(_oIncreaseBox);

    let _oIncrease = new createjs.Shape();
    _oIncrease.graphics.beginFill("#ffffff").drawRoundRect(-105, 245, 40, 40, 20);
    _oIncrease.alpha = 0.9;
    _oIncrease.cursor = "pointer";
    _oIncrease.on("click", function () {
      if (_iStake < 10000) {
        _iStake += 1;
        _oThis._refreshText(_iStake);
      }
    });
    _oContainer.addChild(_oIncrease);
    let _oIncreaseText = new CCTLText(_oContainer, -125, 225, 80, 80, 60, "center", GAME_COLOR_2, GAME_FONT, 1, 0, 0, "+", true, true, true, false);

    let _oDecrease = new createjs.Shape();
    _oDecrease.graphics.beginFill("#ffffff").drawRoundRect(-295, 245, 40, 40, 20);
    _oDecrease.alpha = 0.9;
    _oDecrease.cursor = "pointer";
    _oDecrease.on("click", function () {
      if (_iStake > 0) {
        _iStake -= 1;
        _oThis._refreshText(_iStake);
      }
    });
    _oContainer.addChild(_oDecrease);
    let _oDecreaseText = new CCTLText(_oContainer, -315, 220, 80, 80, 80, "center", GAME_COLOR_2, GAME_FONT, 1, 0, 0, "-", true, true, true, false);

    _oPlaceStake = new createjs.Shape();
    _oPlaceStake.graphics.beginFill(GAME_COLOR_2).drawRoundRect(100, 240, 200, 140, 25);
    _oPlaceStake.alpha = 0.9;
    _oPlaceStake.cursor = "pointer";
    _oPlaceStake.on("click", function () {
      _oThis._onContinue(_iStake);
    });
    _oContainer.addChild(_oPlaceStake);
    this.writeText("STAKE", 150, 245, 100, 80, 80, "#000000");

    _oStakeText = new CCTLText(_oContainer, 140, 310, 120, 50, 50, "center", "#000000", GAME_FONT, 1, 0, 0, _iStake, true, true, true, false);

    _oStakeText2 = new CCTLText(_oContainer, -225, 240, 90, 50, 40, "center", "#ffffff", GAME_FONT, 1, 0, 0, _iStake, true, true, true, false);

    _stakes = [10.0, 100.0, 500.0, 10000.0];

    for (let i = 0; i < _stakes.length; i++) {
      _stakeTexts[i] = this.createTextButton(_stakes[i], -300 + i * 100, 320, 85, 50, 25, "#ffffff", _stakes[i]);
    }
  };

  this.writeText = function (text, x, y, width, height, fontSize, color) {
    var oText = new CCTLText(_oContainer, x, y, width, height, fontSize, "center", color, GAME_FONT, 1, 0, 0, text, true, true, true, false);
  };

  this.createTextButton = function (text, x, y, width, height, fontSize, color, stake) {
    var oBtnContainer = new createjs.Container();
    oBtnContainer.x = x;
    oBtnContainer.y = y;
    oBtnContainer.cursor = "pointer";

    let oBtnBg = new createjs.Shape();
    oBtnBg.graphics.beginFill(GAME_COLOR_1).drawRoundRect(0, 0, width, height, 30);
    oBtnContainer.addChild(oBtnBg);

    // Main white text
    var oText = new CCTLText(
      oBtnContainer,
      0,
      0,
      width,
      height,
      fontSize,
      "center",
      color, // text color
      GAME_FONT,
      1,
      0,
      0,
      text,
      true,
      true,
      true,
      false
    );
    _oContainer.addChild(oBtnContainer);

    oBtnContainer.addEventListener("click", function () {
      _iStake = stake;
      _oThis._refreshText(_iStake);
    });
  };

  this.show = function () {
    _oContainer.alpha = 0;
    _oContainer.visible = true;
    createjs.Tween.get(_oContainer).to({ alpha: 1 }, 400, createjs.Ease.quartOut);
  };

  this.hide = function (stake) {
    createjs.Tween.get(_oContainer)
      .to({ alpha: 0 }, 400, createjs.Ease.quartOut)
      .call(function () {
        _oContainer.visible = false;
        s_oGame.onExitStake(stake);
      });
  };

  this.unload = function () {
    createjs.Tween.get(_oContainer)
      .to({ alpha: 0 }, 150, createjs.Ease.quartOut)
      .call(function () {
        _oParentContainer.removeChild(_oContainer, _oFade);
      });
  };

  this._refreshText = function (stake) {
    _iStake = stake;
    _oStakeText.refreshText(stake);
    _oStakeText2.refreshText(stake);
  };

  this._onContinue = function (stake) {
    _oThis.hide(stake);
  };

  this._init();
}
