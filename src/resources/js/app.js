import * as PIXI from 'pixi.js-legacy';

const APP_VIEW_WIDTH = 480;
const APP_VIEW_HEIGHT = 800;

const STAGE_WIDTH = 432;
const STAGE_HEIGHT = 304;

export class App {
  constructor(renderer, stage, gamePad) {
    this.renderer = renderer;

    this.view = new PIXI.Container();
    this.initApp();

    this.stage = stage;
    this.initStage();
    this.view.addChild(this.stage);

    this.gamepad = gamePad;
    this.initGamepad();
    this.view.addChild(this.gamepad);

    window.appView = this.view;
  }

  initStage() {
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    this.stage.addChild(background);

    const scale = APP_VIEW_WIDTH / STAGE_WIDTH;

    this.stage.scale.x = scale;
    this.stage.scale.y = scale;
  }

  initGamepad() {
    this.gamepad.x = 0;
    this.gamepad.y = this.stage.height;
  }

  initApp() {
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, APP_VIEW_WIDTH, APP_VIEW_HEIGHT);
    this.view.addChild(background);

    if (this.renderer.width > this.renderer.height) {
      const scale = this.renderer.height / APP_VIEW_HEIGHT;

      this.view.scale.x = scale;
      this.view.scale.y = scale;

      this.view.x = this.renderer.width / 2 - this.view.width / 2;
      this.view.y = 0;

      this.mask = new PIXI.Graphics();
      this.mask.beginFill(0xffffff);
      this.mask.drawRect(
        this.view.x,
        this.view.y,
        this.view.width,
        this.view.height
      );
      this.view.mask = this.mask;
    } else {
      this.view.height =
        (APP_VIEW_HEIGHT * this.renderer.width) / APP_VIEW_WIDTH;
      this.view.width = this.renderer.width;
    }
  }
}
