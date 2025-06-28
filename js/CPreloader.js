function CPreloader() {
  var _oLoadingText;
  var _oProgress;
  var _oProgressBar;
  var _oProgressBarX;
  var _oProgressBarY;
  var _oProgressBarWidth;
  var _oProgressBarHeight;
  var _oMaskPreloader;
  var _oFade;
  var _oIcon;
  var _oButStart;
  var _oContainer;

  this._init = function () {
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    s_oSpriteLibrary.addSprite("logo", "./sprites/logo500x500.png");
    s_oSpriteLibrary.addSprite("but_start", "./sprites/but_start.png");
    s_oSpriteLibrary.loadSprites();

    _oContainer = new createjs.Container();
    s_oStage.addChild(_oContainer);
  };

  this.unload = function () {
    _oContainer.removeAllChildren();
    _oButStart.unload();
  };

  this._onImagesLoaded = function () {};

  this._onAllImagesLoaded = function () {
    this.attachSprites();

    s_oMain.preloaderReady();
  };

  this.attachSprites = function () {
    var oBg = new createjs.Shape();
    oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    _oContainer.addChild(oBg);

    var oSprite = s_oSpriteLibrary.getSprite("logo");
    _oIcon = createBitmap(oSprite);
    _oIcon.regX = oSprite.width * 0.5;
    _oIcon.regY = oSprite.height * 0.5;
    _oIcon.x = CANVAS_WIDTH / 2;
    _oIcon.y = CANVAS_HEIGHT / 2 - 180;
    _oContainer.addChild(_oIcon);

    _oLoadingText = new createjs.Text("LOADING...", "20px " + GAME_FONT, "#f00");
    _oLoadingText.x = CANVAS_WIDTH / 2 - 120;
    _oLoadingText.y = CANVAS_HEIGHT / 2 + 50;
    _oLoadingText.textBaseline = "alphabetic";
    _oContainer.addChild(_oLoadingText);

    _oProgressBarX = CANVAS_WIDTH / 2 - 120;
    _oProgressBarY = CANVAS_HEIGHT / 2 + 60;
    _oProgressBarWidth = 240;
    _oProgressBarHeight = 30;
    _oProgressBar = new createjs.Shape();
    _oProgressBar.graphics.setStrokeStyle(5, "round").beginStroke("#ff0000").drawRoundRect(_oProgressBarX, _oProgressBarY, _oProgressBarWidth, _oProgressBarHeight, 5);
    _oContainer.addChild(_oProgressBar);

    _oProgress = new createjs.Shape();
    for (let i = 0; i < 23; i++) {
      _oProgress.graphics
        .setStrokeStyle(5, "round")
        .beginStroke("#ff0000")
        .drawRoundRect(_oProgressBarX + 10 + i * 10, _oProgressBarY + 7, 1, _oProgressBarHeight - 14, 1);
    }
    _oContainer.addChild(_oProgress);

    _oMaskPreloader = new createjs.Shape();
    _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBarX, _oProgressBarY, 1, _oProgressBarWidth);
    _oContainer.addChild(_oMaskPreloader);

    _oProgress.mask = _oMaskPreloader;

    var oSprite = s_oSpriteLibrary.getSprite("but_start");
    _oButStart = new CTextButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, oSprite, "START", "Arial", "#000", "bold " + 50, _oContainer);
    _oButStart.addEventListener(ON_MOUSE_UP, this._onButStartRelease, this);
    _oButStart.setVisible(false);

    _oFade = new createjs.Shape();
    _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    _oContainer.addChild(_oFade);

    createjs.Tween.get(_oFade)
      .to({ alpha: 0 }, 500)
      .call(function () {
        createjs.Tween.removeTweens(_oFade);
        _oContainer.removeChild(_oFade);
      });
  };

  this._onButStartRelease = function () {
    s_oMain._onRemovePreloader();
  };

  this.refreshLoader = function (iPerc) {
    if (iPerc === 100) {
      s_oMain._onRemovePreloader();
      _oProgress.visible = false;
      _oProgressBar.visible = false;
    }

    _oMaskPreloader.graphics.clear();
    var iNewMaskWidth = Math.floor((iPerc * (_oProgressBarWidth - 10)) / 100);
    _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBarX + 5, _oProgressBarY + 5, iNewMaskWidth, _oProgressBarHeight - 10);
  };

  this._init();
}
