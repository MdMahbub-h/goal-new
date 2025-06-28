function CAdPanel(x, y, width, height, sprite, url, oParentContainer) {
  var _x = x;
  var _y = y;
  var _url = url;
  var _width = width;
  var _height = height;
  var _oSprite = sprite;
  var _oContainer;
  var _oFade;
  var _oFadeFill;
  var _oAdImage;
  var _oParentContainer = oParentContainer;

  this._init = function () {
    _oContainer = new createjs.Container();
    _oContainer.x = _x;
    _oContainer.y = _y + _height / 2;
    _oParentContainer.addChild(_oContainer);

    _oFade = new createjs.Shape();
    _oFade.graphics
      .setStrokeStyle(5)
      .beginStroke(GAME_COLOR_2)
      .drawRect(-(_width / 2), -(_height / 2), _width, _height);
    _oContainer.addChild(_oFade);

    _oFadeFill = new createjs.Shape();
    _oFadeFill.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(-(_width / 2), -(_height / 2), _width, _height);
    _oContainer.addChild(_oFadeFill);

    const scale = Math.max(_width / _oSprite.width, _height / _oSprite.height);
    _oAdImage = createBitmap(_oSprite);
    _oAdImage.scale = scale;
    _oAdImage.regX = _oSprite.width / 2;
    _oAdImage.regY = _oSprite.height / 2;
    _oContainer.addChild(_oAdImage);

    _oAdImage.mask = _oFadeFill;

    _oFadeFill.cursor = "pointer";
    _oFadeFill.addEventListener("click", function () {
      window.open(_url, "_blank");
    });
  };

  this.unload = function () {
    _oParentContainer.removeChild(_oContainer);
  };

  this._init();

  return this;
}
