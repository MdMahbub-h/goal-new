function CGoal(iX, iY, oSprite, oParentContainer) {
  var _aCrossBarHighlights;
  var _aPolesLeft;
  var _aPolesRight;
  var _aXPositions = [];
  var _oGoal;
  var _oContainer;
  var _oParentContainer = oParentContainer;

  this._init = function (iX, iY, oSprite) {
    _oContainer = new createjs.Container();
    _oParentContainer.addChild(_oContainer);

    _oGoal = createBitmap(oSprite);
    this.setPosition(iX, iY);
    _oContainer.addChild(_oGoal);

    _aCrossBarHighlights = new Array();

    var iPosX = 2;
    for (let i = 0; i < CROSSBAR_SCORE.length; i++) {
      var spriteName = "";
      if (i % 2 == 0) {
        spriteName = "horizontal_yellow";
      } else {
        spriteName = "horizontal_orange";
      }
      var oHighlight = new CPoleHighlight(true, false, iPosX, 1, CROSSBAR_SCORE[i], s_oSpriteLibrary.getSprite(spriteName), _oContainer);
      _aCrossBarHighlights.push(oHighlight);
      _aXPositions.push(iPosX);
      iPosX = iPosX + s_oSpriteLibrary.getSprite("horizontal_orange").width - 2;
    }
  };

  this.unload = function () {
    _oParentContainer.removeChild(_oGoal);
  };

  this.setPosition = function (iX, iY) {
    _oContainer.x = iX;
    _oContainer.y = iY;
  };

  this.highlightCrossbar = function (iIndex) {
    _aCrossBarHighlights[iIndex].highlightAnim();

    new CScoreText(_aCrossBarHighlights[iIndex].getText(), _aCrossBarHighlights[iIndex].getTextX(), _aCrossBarHighlights[iIndex].getTextY(), _oContainer);
  };

  this.highlightPoleLeft = function (iIndex) {
    _aPolesLeft[iIndex].highlightAnim();
  };

  this.highlightPoleRight = function (iIndex) {
    _aPolesRight[iIndex].highlightAnim();
  };

  this.getDepthPos = function () {
    return GOAL_SPRITE_SWAP_Y;
  };

  this.getObject = function () {
    return _oContainer;
  };

  this.getPoleIndexByPos = function (iXHit) {
    var iXHitPole = iXHit - _oContainer.x;

    var iIndex = null;
    for (var i = 0; i < _aXPositions.length - 1; i++) {
      if (_aXPositions[i] <= iXHitPole && iXHitPole < _aXPositions[i + 1]) {
        iIndex = i;
        break;
      }
    }

    if (iXHitPole < 0) {
      iIndex = 0;
    }
    if (iXHitPole > _aXPositions[_aXPositions.length - 1]) {
      iIndex = _aCrossBarHighlights.length - 1;
    }

    return iIndex;
  };

  this._init(iX, iY, oSprite);

  //

  setInterval(() => {
    for (let p = 0; p < _aCrossBarHighlights.length; p++) {
      let randomNumber = Math.floor(Math.random() * 1000) / 10;
      let occurrence = Math.floor(Math.random() * 1000);

      if (occurrence >= 999) {
        randomNumber = Math.floor(Math.random() * 1999) / 100 + 80;
      } else if (occurrence >= 996) {
        randomNumber = Math.floor(Math.random() * 1999) / 100 + 60;
      } else if (occurrence >= 990) {
        randomNumber = Math.floor(Math.random() * 1999) / 100 + 40;
      } else if (occurrence >= 980) {
        randomNumber = Math.floor(Math.random() * 1999) / 100 + 20;
      } else if (occurrence >= 960) {
        randomNumber = Math.floor(Math.random() * 999) / 100 + 10;
      } else if (occurrence >= 910) {
        randomNumber = Math.floor(Math.random() * 199) / 100 + 8;
      } else if (occurrence >= 800) {
        randomNumber = Math.floor(Math.random() * 299) / 100 + 5;
      } else {
        randomNumber = Math.floor(Math.random() * 499) / 100;
      }
      randomNumber = Number(randomNumber.toFixed(2));
      CROSSBAR_SCORE[p] = randomNumber;
      _aCrossBarHighlights[p].updateText(randomNumber);
    }
  }, 1000);

  return this;
}
