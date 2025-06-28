function CStatsBoard(oParentContainer) {
  var _pContainerPos;
  var _oPlayersText;
  var _oPlayersSText;
  var _oHitText;
  var _oHitSText;
  var _oParentContainer = oParentContainer;
  var _oContainer;

  var _oStakeText;
  var _oStakePointText;

  var _oScoreText;
  var _oScorePointText;
  var _iScoreStartSubY;
  var _oContainerAdd;
  var _oAddScoreText;
  var _oRollingScore;

  var _oLaunchText;
  var _oLaunch;

  var _oPlayers = 0;
  var _oHits = 0;

  this._init = function () {
    _pContainerPos = { x: 0, y: CANVAS_HEIGHT - 280 };
    _oContainer = new createjs.Container();
    _oContainer.x = _pContainerPos.x;
    _oContainer.y = _pContainerPos.y;
    _oParentContainer.addChild(_oContainer);

    const _backdrop = new createjs.Shape();
    _backdrop.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(0, 0, CANVAS_WIDTH, 310);
    _oContainer.addChild(_backdrop);

    _oStakeText = new createjs.Text("STAKE", "40px " + GAME_FONT, GAME_COLOR_2);
    _oStakeText.textAlign = "left";
    _oStakeText.x = 50;
    _oStakeText.y = 30;
    _oContainer.addChild(_oStakeText);

    _oStakePointText = new createjs.Text(0, "40px " + GAME_FONT, GAME_COLOR_2);
    _oStakePointText.textAlign = "left";
    _oStakePointText.x = 450;
    _oStakePointText.y = 30;
    _oContainer.addChild(_oStakePointText);

    _oScoreText = new createjs.Text("SCORE ", "40px " + GAME_FONT, GAME_COLOR_1);
    _oScoreText.textAlign = "left";
    _oScoreText.x = 50;
    _oScoreText.y = 90;
    _oContainer.addChild(_oScoreText);

    _oScorePointText = new createjs.Text(0, "40px " + GAME_FONT, GAME_COLOR_1);
    _oScorePointText.textAlign = "left";
    _oScorePointText.x = 450;
    _oScorePointText.y = 90;
    _oContainer.addChild(_oScorePointText);

    // <Score anim
    _oContainerAdd = new createjs.Container();
    _oContainerAdd.x = 50;

    _oAddScoreText = new createjs.Text("+5555 " + TEXT_MULTIPLIER + 1, "36px " + GAME_FONT, TEXT_COLOR);
    _oAddScoreText.textAlign = "left";

    _oContainerAdd.addChild(_oAddScoreText);

    _oContainerAdd.y = _iScoreStartSubY = -_oAddScoreText.getBounds().height;
    _oContainerAdd.visible = false;

    _oContainer.addChild(_oContainerAdd);
    _oRollingScore = new CRollingScore();
    // Score anim>

    _oPlayers = this.getRandomIntBetween(100, 2_000);
    _oHits = this.getRandomIntBetween(2_001, 5_000_000);

    _oPlayersText = new createjs.Text("PLAYERS", "40px " + GAME_FONT, GAME_COLOR_2);
    _oPlayersText.textAlign = "left";
    _oPlayersText.x = 50;
    _oPlayersText.y = 150;
    _oContainer.addChild(_oPlayersText);

    _oPlayersSText = new createjs.Text(_oPlayers, "40px " + GAME_FONT, GAME_COLOR_2);
    _oPlayersSText.textAlign = "left";
    _oPlayersSText.x = 450;
    _oPlayersSText.y = 150;
    _oContainer.addChild(_oPlayersSText);

    _oHitText = new createjs.Text("HITS", "40px " + GAME_FONT, GAME_COLOR_1);
    _oHitText.x = 50;
    _oHitText.y = 210;
    _oHitText.textAlign = "left";
    _oContainer.addChild(_oHitText);

    _oHitSText = new createjs.Text(_oHits, "40px " + GAME_FONT, GAME_COLOR_1);
    _oHitSText.textAlign = "left";
    _oHitSText.x = 450;
    _oHitSText.y = 210;
    _oContainer.addChild(_oHitSText);

    _oLaunchText = new createjs.Text("0" + "/" + NUM_OF_PENALTY, "50px " + SECONDARY_FONT, TEXT_COLOR);
    _oLaunchText.textAlign = "right";
    _oLaunchText.x = CANVAS_WIDTH - 30;
    _oLaunchText.y = 200;
    _oContainer.addChild(_oLaunchText);

    var oSprite = s_oSpriteLibrary.getSprite("boot_ball");
    _oLaunch = createBitmap(oSprite);
    _oLaunch.scale = 1.5;
    _oLaunch.x = CANVAS_WIDTH - 30 - (oSprite.width + 20);
    _oLaunch.y = 200 - (oSprite.height + 50);
    _oContainer.addChild(_oLaunch);

    setInterval(() => {
      _oPlayers = this.getRandomIntBetween(100, 500_000);
      do {
        _oHits = this.getRandomIntBetween(2_000, 5_000_000);
      } while (_oHits < _oPlayers);
      this.refreshTextPlayers(_oPlayers);
      this.refresTextHits(_oHits);
    }, 1000);
  };

  this.getRandomIntBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  this.refreshTextPlayers = function (_oPlayers) {
    _oPlayersSText.text = _oPlayers;
  };

  this.refresTextHits = function (_oHits) {
    _oHitSText.text = _oHits;
  };

  this.refreshTextStake = function (iStake) {
    _oStakePointText.text = iStake;
  };

  this.refreshTextScore = function (iScore) {
    _oRollingScore.rolling(_oScorePointText, null, iScore);
  };

  this.effectAddScore = function (iScore, fMultiplier) {
    _oContainerAdd.visible = true;
    _oAddScoreText.text = "+" + iScore + " " + TEXT_MULTIPLIER + fMultiplier;
    createjs.Tween.get(_oContainerAdd)
      .to({ y: _iScoreStartSubY - 50, alpha: 0 }, MS_EFFECT_ADD, createjs.Ease.cubicOut)
      .call(function () {
        _oContainerAdd.visible = false;
        _oContainerAdd.alpha = 1;
        _oContainerAdd.y = _iScoreStartSubY;
      });
  };

  this.refreshTextLaunch = function (iLaunch, iNumLaunch) {
    _oLaunchText.text = iLaunch + "/" + iNumLaunch;
  };

  this._init();

  return this;
}
