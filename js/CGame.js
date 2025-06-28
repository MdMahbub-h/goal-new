function CGame(oData) {
  var _oInterface;
  var _oBg;

  var _oScene;
  var _oBall;
  var _oStartBall;

  var _oContainerGame;
  var _oClickPoint;
  var _oReleasePoint;
  var _oHitArea;
  var _oPlayer;
  var _oFieldCollision = null;
  var _oHandSwipeAnim;
  var _oGoal;
  var _bGoal = false;
  var _bLaunched = false;
  var _bBallOut = false;
  var _bFieldCollide = false;
  var _bAnimPlayer = false;
  var _oListenerDown;
  var _oListenerMove;
  var _oListenerUp;
  var _bSaved = false;

  var _bPoleCollide = false;
  var _iLevel = 1;
  var _iScore;
  var _iStake;
  var _iLaunch = 0;
  var _iTimePressDown = 0;
  var _fTimeReset;
  var _fTimePoleReset;
  var _fTimeSwipe;

  var _timeSwipe = MS_TIME_TO_SWIPE / 1000;
  var _timerPause = true;
  var _timerText;
  var _intervalTimer;

  var _isFirstTime = true;

  var _aObjects;
  var _vHitDir;

  var _iGameState = STATE_INIT;
  var _oCamera = null;

  var _bPointScored;
  var _oStakePanel;

  var _oAdPanel;

  this._init = function () {
    $(s_oMain).trigger("start_session");

    _iScore = 0;

    _bPointScored = false;

    _aObjects = new Array();

    _oContainerGame = new createjs.Container();
    s_oStage.addChild(_oContainerGame);

    var _oBgSprite = s_oSpriteLibrary.getSprite("bg_game");
    _oBg = createBitmap(_oBgSprite);
    _oBg.scale = 1.28;
    _oBg.x = -154;
    _oBg.y = -450;
    _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    _oContainerGame.addChild(_oBg);

    _oScene = new CScenario(_iLevel);

    if (SHOW_3D_RENDER) {
      _oCamera = camera;
    } else {
      _oCamera = createOrthoGraphicCamera();
    }

    var oSprite = s_oSpriteLibrary.getSprite("goal");
    _oGoal = new CGoal(CANVAS_WIDTH / 2 - oSprite.width / 2, 190 + OFFSET_Y, oSprite, _oContainerGame);

    var oSpriteBall = s_oSpriteLibrary.getSprite("ball");
    _oBall = new CBall(0, 0, oSpriteBall, _oScene.ballBody(), _oContainerGame);
    _aObjects.push(_oBall);

    if (settings && settings.ad_src) {
      var _oAdSprite = s_oSpriteLibrary.getSprite("banner_ad");
      _oAdPanel = new CAdPanel(CANVAS_WIDTH / 2, 120, 700, 180, _oAdSprite, settings.ad_url, _oContainerGame);
    }

    this.ballPosition();

    _oBall.setVisible(false);

    _fTimeSwipe = MS_TIME_SWIPE_START;

    _oStartBall = new CStartBall(CANVAS_WIDTH_HALF + 55, CANVAS_HEIGHT_HALF + 168, _oContainerGame);

    _oPlayer = new CPlayer(CANVAS_WIDTH_HALF - 150, -360, _oContainerGame);
    _oPlayer.setVisible(false);

    var szImage = "cursor";
    if (s_bMobile) {
      szImage = "hand_touch";
      TIME_SWIPE = 650;
    } else {
      TIME_SWIPE = 500;
    }

    _oHandSwipeAnim = new CHandSwipeAnim(START_HAND_SWIPE_POS, END_HAND_SWIPE_POS, s_oSpriteLibrary.getSprite(szImage), s_oStage);

    resizeCanvas3D();

    setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);

    _oInterface = new CInterface();
    _oInterface.refreshTextScoreBoard(0, 0, 0, false);

    _oInterface.refreshLaunchBoard(_iLaunch, NUM_OF_PENALTY);

    _vHitDir = new CANNON.Vec3(0, 0, 0);
  };

  this.createControl = function () {
    if (!SHOW_3D_RENDER) {
      _oHitArea = new createjs.Shape();
      _oHitArea.graphics.beginFill("rgba(255,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      _oContainerGame.addChild(_oHitArea);

      _oListenerDown = _oHitArea.on("mousedown", this.onMouseDown);
      _oListenerMove = _oHitArea.on("pressmove", this.onPressMove);
      _oListenerUp = _oHitArea.on("pressup", this.onPressUp);
    } else {
      window.addEventListener("mousedown", this.onMouseDown);
      window.addEventListener("mousemove", this.onPressMove);
      window.addEventListener("mouseup", this.onPressUp);
    }
  };

  this.showControlsHelp = function () {
    _oHandSwipeAnim.animAllSwipe();
    _oInterface.showHelpText();
  };

  this.startTimerToShoot = function () {
    _timerText = new CCTLText(
      _oContainerGame,
      CANVAS_WIDTH / 2 - 350,
      CANVAS_HEIGHT_HALF - 160,
      700,
      70,
      70,
      "center",
      TEXT_COLOR,
      SECONDARY_FONT,
      1,
      0,
      0,
      "",
      true,
      true,
      false,
      false
    );
    _intervalTimer = setInterval(() => {
      if (!_timerPause) {
        if (_timeSwipe > 0) {
          _timerText.refreshText(_timeSwipe);
          _timeSwipe -= 1;
        } else {
          _timerText.refreshText("Hit Time Out");
          _timerPause = true;
          this.endTurn();
        }
      } else {
        _timerText.refreshText("");
      }
    }, 1000);
  };

  this.sortDepth = function (oObj1, oObj2) {
    if (oObj1.getDepthPos() > oObj2.getDepthPos()) {
      if (_oContainerGame.getChildIndex(oObj1.getObject()) > _oContainerGame.getChildIndex(oObj2.getObject())) {
        _oContainerGame.swapChildren(oObj1.getObject(), oObj2.getObject());
      }
    } else if (oObj1.getDepthPos() < oObj2.getDepthPos()) {
      if (_oContainerGame.getChildIndex(oObj2.getObject()) > _oContainerGame.getChildIndex(oObj1.getObject())) {
        _oContainerGame.swapChildren(oObj2.getObject(), oObj1.getObject());
      }
    }
  };

  this.onExitHelp = function () {
    _oStakePanel = new CStakePanel(s_oStage);
    _oStakePanel.show();
  };

  this.onExitStake = function (stake) {
    _iStake = stake;
    if (_isFirstTime) {
      _isFirstTime = false;
      this.createControl();
      this.showControlsHelp();
    }
    _oInterface.refreshTextStakeBoard(_iStake, 1, 0, false);
    _timeSwipe = MS_TIME_TO_SWIPE / 1000;
    _timerPause = false;
    _iGameState = STATE_PLAY;
    this.startTimerToShoot();
  };

  this.poleCollide = function (oBallPos) {
    if (_bPoleCollide || _bGoal) {
      return;
    }

    _bPoleCollide = true;

    this.calculateScore(oBallPos);

    _fTimePoleReset = TIME_POLE_COLLISION_RESET;

    playSound("pole", 0.4, false);
  };

  this.calculateScore = function (oBallPos) {
    //BALL HIT THE CROSSBAR
    _bPointScored = true;

    var iHighlightIndex = _oGoal.getPoleIndexByPos(_oBall.getX());
    var iIndex = Math.floor(Math.random() * 3);

    var iAmount = CROSSBAR_SCORE[iHighlightIndex];

    _oGoal.highlightCrossbar(iHighlightIndex);

    _iScore += iAmount * _iStake;
    _oInterface.refreshTextScoreBoard(_iScore, 1, 0, false);

    _oInterface.createAnimText(TEXT_CONGRATULATION[iIndex], 120, false, TEXT_COLOR, "#116ee0");
  };

  this.fieldCollision = function () {
    if (_oFieldCollision === null && _bLaunched) {
      _oFieldCollision = playSound("drop_bounce_grass", 0.3, false);
      if (_oFieldCollision !== null) {
        _oFieldCollision.on("end", function () {
          _oFieldCollision = null;
        });
      }
    }
  };

  this.ballPosition = function () {
    var oBallBody = _oScene.ballBody();

    var oPos2DBall = this.convert3dPosTo2dScreen(oBallBody.position, _oCamera);

    var fScaleDistance = oPos2DBall.z * (BALL_SCALE_FACTOR - _oBall.getStartScale()) + _oBall.getStartScale();

    _oBall.setPosition(oPos2DBall.x, oPos2DBall.y);
    _oBall.scale(fScaleDistance);

    this.refreshShadowCast(_oBall, oBallBody, fScaleDistance);
  };

  this.onMouseDown = function (e) {
    if (_bLaunched || _iGameState === STATE_PAUSE) {
      return;
    }
    _fTimeSwipe = MS_TIME_SWIPE_START;
    _oHandSwipeAnim.removeTweens();
    _oHandSwipeAnim.setVisible(false);
    _oClickPoint = { x: s_oStage.mouseX, y: s_oStage.mouseY };
    _oReleasePoint = null;
  };

  this.onPressMove = function () {
    if (_iGameState === STATE_PAUSE) return;

    _oReleasePoint = { x: s_oStage.mouseX, y: s_oStage.mouseY };
    _iTimePressDown += s_iTimeElaps;
  };

  this.onPressUp = function () {
    if (_iGameState === STATE_PAUSE) return;

    if (_bLaunched || _oReleasePoint === null) {
      return;
    } else if (_oClickPoint.y < _oReleasePoint.y || (_oReleasePoint.x === 0 && _oReleasePoint.y === 0)) {
      return;
    }
    var fDistance = Math.ceil(distanceV2(_oClickPoint, _oReleasePoint)) * FORCE_RATE;

    if (fDistance > FORCE_MAX) {
      fDistance = FORCE_MAX;
    }

    if (_iTimePressDown > TIME_SWIPE) {
      _iTimePressDown = 0;
      return;
    }

    var vHitDir2D = new CVector2(_oClickPoint.x - _oReleasePoint.x, _oClickPoint.y - _oReleasePoint.y);

    vHitDir2D.scalarProduct(fDistance);

    var fForceLength = vHitDir2D.length();

    if (fForceLength > HIT_BALL_MIN_FORCE) {
      if (fForceLength > HIT_BALL_MAX_FORCE) {
        vHitDir2D.normalize();
        vHitDir2D.scalarProduct(HIT_BALL_MAX_FORCE);
      }

      _bAnimPlayer = true;
      _oPlayer.setVisible(true);
      var fForceY = _iTimePressDown / 10;
      if (fForceY > MAX_FORCE_Y) {
        fForceY = MAX_FORCE_Y;
      } else if (fForceY < MIN_FORCE_Y) {
        fForceY = MIN_FORCE_Y;
      }

      var iDirX = -vHitDir2D.getX() * FORCE_MULTIPLIER_AXIS.x;

      if (iDirX < 12 && iDirX > 9) {
        iDirX = 9.8;
      } else if (iDirX > -12 && iDirX < -9) {
        if (s_bMobile) {
          iDirX = -9.8;
        } else {
          iDirX = -9.85;
        }
      }

      var iDirY = fForceY;
      var iDirZ = vHitDir2D.getY() * FORCE_MULTIPLIER_AXIS.z + 0.2 * Math.abs(iDirX);

      if (iDirZ < 11.6 && iDirZ > 8.7) {
        if (s_bMobile) {
          iDirZ = 9.3;
        } else {
          iDirZ = 9.35;
        }
      } else if (iDirZ < 3.5) {
        iDirZ = 3.5;
      }

      _vHitDir.set(iDirX, iDirY, iDirZ);
    }

    _oReleasePoint.x = 0;
    _oReleasePoint.y = 0;
  };

  this.refreshShadowCast = function (oObject, oBody, fScaleDistance) {
    var oFieldBody = _oScene.getFieldBody();

    if (oBody.position.z < oFieldBody.position.z) {
      oObject.scaleShadow(0);
      return;
    }

    var oPosShadow = {
      x: oBody.position.x,
      y: oBody.position.y,
      z: oFieldBody.position.z,
    };

    var oPos2dShadow = this.convert3dPosTo2dScreen(oPosShadow, _oCamera);

    var fDistance = (oBody.position.z - BALL_RADIUS) * (oFieldBody.position.z - SHADOWN_FACTOR - oFieldBody.position.z) + oFieldBody.position.z;

    var fScaleHeight = fDistance * fScaleDistance;

    oObject.scaleShadow(fScaleHeight);

    if (fScaleHeight < 0) {
      return;
    }

    oObject.setAlphaByHeight(fDistance);

    oObject.setPositionShadow(oPos2dShadow.x, oPos2dShadow.y);
  };

  this.getLevel = function () {
    return _iLevel;
  };

  this.unload = function () {
    s_oStage.removeAllChildren();
    _oInterface.unload();

    if (_oHitArea !== undefined) {
      _oHitArea.off("mousedown", _oListenerDown);
      _oHitArea.off("pressmove", _oListenerMove);
      _oHitArea.off("pressup", _oListenerUp);
    }

    _oScene.destroyWorld();
    _oScene = null;
  };

  this.resetValues = function () {
    _iScore = 0;
    _oInterface.refreshTextScoreBoard(0, 0, 0, false);

    _oInterface.refreshTextStakeBoard(_iStake, 0, 0, false);

    _timerPause = false;
    _timeSwipe = MS_TIME_TO_SWIPE / 1000;

    _iLaunch = 0;
    _oInterface.refreshLaunchBoard(_iLaunch, NUM_OF_PENALTY);
  };

  this.wallSoundCollision = function () {
    playSound("ball_collision", 1, false);
  };

  this.areaGoal = function () {
    if (!_bGoal && !_bSaved && !_bPointScored) {
      _bGoal = true;
      _fTimeReset = TIME_RESET_AFTER_GOAL;

      _oInterface.createAnimText(TEXT_BALL_OUT, 90, false, GAME_COLOR_1, "#ffffff");
    }
  };

  this.addImpulseToBall = function (oDir) {
    if (_bLaunched || _iGameState !== STATE_PLAY) {
      return;
    }
    var oBall = _oScene.ballBody();
    _oScene.addImpulse(oBall, oDir);
    _oScene.setElementAngularVelocity(oBall, { x: 0, y: 0, z: 0 });
    _bLaunched = true;
    _oBall.setVisible(true);
    _oStartBall.setVisible(false);

    playSound("kick", 1, false);
  };

  this.onExit = function () {
    this.unload();

    $(s_oMain).trigger("show_interlevel_ad");
    $(s_oMain).trigger("end_session");
    setVolume("soundtrack", 1);
    s_oMain.gotoMenu();
  };

  this.getRandomIntBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  this.resetBallPosition = function () {
    var oBallBody = _oScene.ballBody();

    POSITION_BALL.x = this.getRandomIntBetween(-3, 3);
    oBallBody.position.set(POSITION_BALL.x, POSITION_BALL.y, POSITION_BALL.z);
    _oScene.setElementVelocity(oBallBody, { x: 0, y: 0, z: 0 });
    _oScene.setElementAngularVelocity(oBallBody, { x: 0, y: 0, z: 0 });

    _oBall.fadeAnimation(1, 500, 0);
    _oBall.setVisible(false);

    _oStartBall.setPosition(CANVAS_WIDTH_HALF + POSITION_BALL.x * 90, CANVAS_HEIGHT_HALF + 168);
    _oStartBall.setVisible(true);
    _oStartBall.setAlpha(0);
    _oStartBall.fadeAnim(1, 500, 0);
  };

  this.ballFadeForReset = function () {
    if (!_bSaved || !_bGoal || !_bBallOut) {
      return;
    }
    if (!_bFieldCollide) {
      _oBall.fadeAnimation(0, 300, 10);
      _bFieldCollide = true;
    }
  };

  this._updateInit = function () {
    _oScene.update();
    this._updateBall2DPosition();
    _iGameState = STATE_PLAY;
  };

  this.convert2dScreenPosTo3d = function (oPos2d) {
    var iWidth = s_iCanvasResizeWidth;
    var iHeight = s_iCanvasResizeHeight;

    var mouse3D = new THREE.Vector3(
      (oPos2d.x / iWidth) * 2 - 1, //x
      -(oPos2d.y / iHeight) * 2 + 1, //y
      -1
    ); //z
    mouse3D.unproject(_oCamera);
    mouse3D.sub(_oCamera.position);
    mouse3D.normalize();

    var fFactor = 0; //object.y

    mouse3D.multiply(new THREE.Vector3(fFactor, 1, fFactor));

    return mouse3D;
  };

  this.convert3dPosTo2dScreen = function (pos, oCamera) {
    var v3 = new THREE.Vector3(pos.x, pos.y, pos.z);
    var vector = v3.project(oCamera);

    var widthHalf = Math.floor(s_iCanvasResizeWidth) * 0.5;
    var heightHalf = Math.floor(s_iCanvasResizeHeight) * 0.5;

    vector.x = (vector.x * widthHalf + widthHalf) * s_fInverseScaling;
    vector.y = (-(vector.y * heightHalf) + heightHalf) * s_fInverseScaling;

    return vector;
  };

  this.timeReset = function () {
    if (_fTimeReset > 0) {
      _fTimeReset -= s_iTimeElaps;
    } else {
      this.endTurn();
    }
  };

  this.resetGame = function () {
    this.resetValues();
    this.resetScene();
    _iGameState = STATE_PAUSE;
    _bLaunched = false;
    _timerPause = true;
    clearInterval(_intervalTimer);
    _oStakePanel.show();
  };

  this.restartGame = function () {
    this.resetValues();
    this.resetScene();
    _iGameState = STATE_PLAY;
    _bLaunched = false;
  };

  this.endTurn = function () {
    _iLaunch++;
    _oInterface.refreshLaunchBoard(_iLaunch, NUM_OF_PENALTY);
    _timerPause = false;
    _timeSwipe = MS_TIME_TO_SWIPE / 1000;

    if (_iLaunch < NUM_OF_PENALTY) {
      this.resetScene();
      _bLaunched = false;
      _fTimeSwipe = MS_TIME_SWIPE_START;
    } else {
      _iGameState = STATE_FINISH;
      _timerPause = true;
      // if (_iScore > s_iBestScore) {
      //   // s_iBestScore = Math.floor(_iScore);
      //   s_iBestScore = _iScore;
      //   s_iBestScore = Number(s_iBestScore.toFixed(2));
      //   saveItem(LOCALSTORAGE_STRING[LOCAL_BEST_SCORE], _iScore);
      //   _oInterface.refreshBestScore();
      // }
      _oInterface.createWinPanel(_iScore, _iStake);
    }
  };

  this.endTimer = function () {
    _iLaunch--;
    _oInterface.refreshLaunchBoard(_iLaunch, NUM_OF_PENALTY);
    if (_iLaunch < NUM_OF_PENALTY) {
      this.resetScene();
      _bLaunched = false;
      _fTimeSwipe = MS_TIME_SWIPE_START;
    } else {
      _iGameState = STATE_FINISH;
      // if (_iScore > s_iBestScore) {
      //   s_iBestScore = _iScore;
      //   s_iBestScore = Number(s_iBestScore.toFixed(2));
      //   saveItem(LOCALSTORAGE_STRING[LOCAL_BEST_SCORE], _iScore);
      //   _oInterface.refreshBestScore();
      // }
      _oInterface.createWinPanel(_iScore, _iStake);
    }
  };

  this.goalAnimation = function (fForce) {
    if (fForce > FORCE_BALL_DISPLAY_SHOCK[0].min && fForce < FORCE_BALL_DISPLAY_SHOCK[0].max) {
      this.displayShock(INTENSITY_DISPLAY_SHOCK[0].time, INTENSITY_DISPLAY_SHOCK[0].x, INTENSITY_DISPLAY_SHOCK[0].y);
    } else if (fForce > FORCE_BALL_DISPLAY_SHOCK[1].min && fForce < FORCE_BALL_DISPLAY_SHOCK[1].max) {
      this.displayShock(INTENSITY_DISPLAY_SHOCK[1].time, INTENSITY_DISPLAY_SHOCK[1].x, INTENSITY_DISPLAY_SHOCK[1].y);
    } else if (fForce > FORCE_BALL_DISPLAY_SHOCK[2].min && fForce < FORCE_BALL_DISPLAY_SHOCK[2].max) {
      this.displayShock(INTENSITY_DISPLAY_SHOCK[2].time, INTENSITY_DISPLAY_SHOCK[2].x, INTENSITY_DISPLAY_SHOCK[2].y);
    } else if (fForce > FORCE_BALL_DISPLAY_SHOCK[3].min) {
      this.displayShock(INTENSITY_DISPLAY_SHOCK[3].time, INTENSITY_DISPLAY_SHOCK[3].x, INTENSITY_DISPLAY_SHOCK[3].y);
    }
  };

  this.displayShock = function (iTime, iXIntensity, iYIntensity) {
    var xShifting = iXIntensity;
    var yShifting = iYIntensity;

    createjs.Tween.get(_oContainerGame)
      .to(
        {
          x: Math.round(Math.random() * xShifting),
          y: Math.round(Math.random() * yShifting),
        },
        iTime
      )
      .call(function () {
        createjs.Tween.get(_oContainerGame)
          .to(
            {
              x: Math.round(Math.random() * xShifting * 0.8),
              y: -Math.round(Math.random() * yShifting * 0.8),
            },
            iTime
          )
          .call(function () {
            createjs.Tween.get(_oContainerGame)
              .to(
                {
                  x: Math.round(Math.random() * xShifting * 0.6),
                  y: Math.round(Math.random() * yShifting * 0.6),
                },
                iTime
              )
              .call(function () {
                createjs.Tween.get(_oContainerGame)
                  .to(
                    {
                      x: Math.round(Math.random() * xShifting * 0.4),
                      y: -Math.round(Math.random() * yShifting * 0.4),
                    },
                    iTime
                  )
                  .call(function () {
                    createjs.Tween.get(_oContainerGame)
                      .to(
                        {
                          x: Math.round(Math.random() * xShifting * 0.2),
                          y: Math.round(Math.random() * yShifting * 0.2),
                        },
                        iTime
                      )
                      .call(function () {
                        createjs.Tween.get(_oContainerGame)
                          .to({ y: 0, x: 0 }, iTime)
                          .call(function () {});
                      });
                  });
              });
          });
      });
  };

  this.resetScene = function () {
    _bGoal = false;
    _bBallOut = false;
    _bSaved = false;

    _bPoleCollide = false;
    _bFieldCollide = false;

    _bPointScored = false;

    this.resetBallPosition();
    this.sortDepth(_oBall, _oGoal);
  };

  this._onEnd = function () {
    this.onExit();
  };

  this.swapChildrenIndex = function () {
    for (var i = 0; i < _aObjects.length - 1; i++) {
      for (var j = i + 1; j < _aObjects.length; j++) {
        if (_aObjects[i].getObject().visible && _aObjects[j].getObject().visible) this.sortDepth(_aObjects[i], _aObjects[j]);
      }
    }
  };

  this.ballOut = function () {
    if (!_bBallOut && !_bGoal && !_bSaved && !_bPointScored) {
      var oPos = _oBall.getPhysics().position;
      if (oPos.y > BALL_OUT_Y || oPos.x > BALL_OUT_X || oPos.x < -BALL_OUT_X) {
        _bBallOut = true;
        _fTimeReset = TIME_RESET_AFTER_BALL_OUT;
        if (_bPoleCollide === false) {
          _oInterface.createAnimText(TEXT_BALL_OUT, 90, false, GAME_COLOR_1, "#ffffff");
          playSound("ball_saved", 1, false);
        }
      }
    }
  };

  this.animPlayer = function () {
    if (!_bAnimPlayer) {
      _oPlayer.setVisible(false);
      return;
    }
    _oPlayer.setPosition(CANVAS_WIDTH_HALF - 150 + POSITION_BALL.x * 80, -100);
    _bAnimPlayer = _oPlayer.animPlayer();
    _timerPause = true;
    if (_oPlayer.getFrame() === SHOOT_FRAME) {
      this.addImpulseToBall({ x: _vHitDir.x, y: _vHitDir.y, z: _vHitDir.z });
      _timeSwipe = MS_TIME_TO_SWIPE / 1000;
      _iTimePressDown = 0;
      this.goalAnimation(_vHitDir.y);
      _oInterface.unloadHelpText();
    }
  };

  this.resetPoleCollision = function () {
    if (_fTimePoleReset > 0) {
      _fTimePoleReset -= s_iTimeElaps;
    } else {
      if (!_bGoal || !_bSaved) {
        this.endTurn();
        _fTimePoleReset = TIME_POLE_COLLISION_RESET;
      }
    }
  };

  this.handSwipeAnim = function () {
    if (_oHandSwipeAnim.isAnimate() || _bLaunched) {
      return;
    }
    if (_fTimeSwipe > 0) {
      _fTimeSwipe -= s_iTimeElaps;
    } else {
      _oHandSwipeAnim.animAllSwipe();
      _oHandSwipeAnim.setVisible(true);
      _fTimeSwipe = MS_TIME_SWIPE_START;
    }
  };

  this.swapGoal = function () {
    if (_oBall.getPhysics().position.z > GOAL_SPRITE_SWAP_Z) {
      this.sortDepth(_oBall, _oGoal);
    }
  };

  this._checkBallState = function () {
    if (_bLaunched && !_bBallOut && !_bGoal && !_bSaved && !_bPointScored) {
      var oBallBody = _oScene.ballBody();

      if (oBallBody.velocity.lengthSquared() < 0.01) {
        _bBallOut = true;
        _oInterface.createAnimText(TEXT_BALL_OUT, 90, false, GAME_COLOR_1, "#ffffff");
        playSound("ball_saved", 1, false);
      }
    }
  };

  this._updatePlay = function () {
    for (var i = 0; i < PHYSICS_ACCURACY; i++) {
      _oScene.update();
    }

    this.ballOut();

    if (_bGoal || _bBallOut || _bSaved) {
      this.timeReset();
    } else if (_bPoleCollide) {
      this.resetPoleCollision();
    }

    this._checkBallState();

    this.animPlayer();

    this._updateBall2DPosition();

    this.swapChildrenIndex();

    this.swapGoal();
  };

  this.update = function () {
    switch (_iGameState) {
      case STATE_INIT:
        this._updateInit();
        break;
      case STATE_PLAY:
        this._updatePlay();
        break;
      case STATE_FINISH:
        break;
      case STATE_PAUSE:
        break;
    }
  };

  this._updateBall2DPosition = function () {
    this.ballPosition();
    _oBall.rolls();

    _oCamera.updateProjectionMatrix();
    _oCamera.updateMatrixWorld();
  };

  s_oGame = this;

  NUM_OF_PENALTY = oData.num_of_penalty;

  this._init();
}

var s_oGame;
