import * as PIXI from 'pixi.js-legacy';

const GAMEPAD_VIEW_WIDTH = 480;
const GAMEPAD_VIEW_HEIGHT = 800;

const PRESS_UP_IDX = 0;
const PRESS_DOWN_IDX = 1;
const PRESS_LEFT_IDX = 2;
const PRESS_RIGHT_IDX = 3;

const D_PAD_PRESSED_KEY = ['KeyR', 'KeyF', 'KeyD', 'KeyG'];
const ACTION_KEY = 'KeyZ';

const DEAD_ZONE = 20;
const PRESS_ZONE = 90;

export class Gamepad extends PIXI.Container {
  constructor() {
    super();
  }

  init() {
    const background = new PIXI.Graphics();
    background.beginFill(0x0d2e41);
    background.drawRect(0, 0, GAMEPAD_VIEW_WIDTH, GAMEPAD_VIEW_HEIGHT);
    this.addChild(background);

    const dPadStyle = new PIXI.TextStyle({
      fontFamily: 'game-boy',
      fontSize: 200,
      fontStyle: '',
      fill: ['#44AD9F'],
      wordWrap: true,
      wordWrapWidth: 440,
    });

    const btnStyle = new PIXI.TextStyle({
      fontFamily: 'game-boy',
      fontSize: 90,
      fontStyle: '',
      fill: ['#44AD9F'],
      wordWrap: true,
      wordWrapWidth: 440,
    });

    const dPadView = new PIXI.Container();
    dPadView.x = 120;
    dPadView.y = 150;
    this.addChild(dPadView);

    const dPadPressed = [false, false, false, false];
    const dPadPressedBefore = [false, false, false, false];
    let dPadLabelText = 'S';
    let isDPadPressed = false;

    const dPadTouch = new PIXI.Sprite(PIXI.Texture.EMPTY);
    dPadTouch.anchor.x = 0.5;
    dPadTouch.anchor.y = 0.5;
    dPadTouch.x = 0;
    dPadTouch.y = 0;
    dPadTouch.width = 180;
    dPadTouch.height = 220;
    dPadTouch.buttonMode = true;
    dPadTouch.interactive = true;
    dPadTouch.on('pointermove', (evt) => {
      console.log('pointermove');

      if (!isDPadPressed) {
        return;
      }

      updateDPadPressed(evt);
      renderDPadLabel();
    });
    dPadTouch.on('pointerdown', (evt) => {
      console.log('pointerdown');

      isDPadPressed = true;

      startDPadPressed();
      updateDPadPressed(evt);
      renderDPadLabel();
    });
    dPadTouch.on('pointerup', () => {
      console.log('pointerup');

      isDPadPressed = false;

      endDPadPressed();
      renderDPadLabel();
    });
    dPadTouch.on('pointerupoutside', () => {
      console.log('pointerupoutside');

      isDPadPressed = false;

      endDPadPressed();
      renderDPadLabel();
    });
    dPadView.addChild(dPadTouch);

    const startDPadPressed = () => {
      for (let i = 0; i < dPadPressed.length; i++) {
        dPadPressed[i] = false;
        dPadPressedBefore[i] = false;
      }
    };

    const updateDPadPressed = (evt) => {
      const { x, y } = evt.data.getLocalPosition(dPadView);

      const distance = Math.hypot(x, y);
      if (distance < DEAD_ZONE) {
        return;
      }

      if (distance > PRESS_ZONE) {
        return;
      }

      for (let i = 0; i < dPadPressedBefore.length; i++) {
        dPadPressedBefore[i] = false;
      }

      const x1 = x;
      const y1 = y;
      const x2 = -1;
      const y2 = 0;

      const dot = x1 * x2 + y1 * y2;
      const det = x1 * y2 - y1 * x2;
      const angle = (Math.atan2(det, dot) * 180) / Math.PI + 180;

      if (angle < 15 || angle > 345) {
        // right
        console.log('→');
        dPadPressedBefore[PRESS_RIGHT_IDX] = true;
        dPadLabelText = 'D';
      } else if (angle >= 15 && angle <= 75) {
        // up-right
        console.log('↗︎');
        dPadPressedBefore[PRESS_UP_IDX] = true;
        dPadPressedBefore[PRESS_RIGHT_IDX] = true;
        dPadLabelText = 'E';
      } else if (angle > 75 && angle < 105) {
        // up
        console.log('↑');
        dPadPressedBefore[PRESS_UP_IDX] = true;
        dPadLabelText = 'W';
      } else if (angle >= 105 && angle < 165) {
        // up-left
        console.log('↖︎');
        dPadPressedBefore[PRESS_UP_IDX] = true;
        dPadPressedBefore[PRESS_LEFT_IDX] = true;
        dPadLabelText = 'Q';
      } else if (angle > 165 && angle < 195) {
        // left
        console.log('←');
        dPadPressedBefore[PRESS_LEFT_IDX] = true;
        dPadLabelText = 'A';
      } else if (angle >= 195 && angle <= 255) {
        // down-left
        console.log('↙︎');
        dPadPressedBefore[PRESS_DOWN_IDX] = true;
        dPadPressedBefore[PRESS_LEFT_IDX] = true;
        dPadLabelText = 'Z';
      } else if (angle > 255 && angle < 285) {
        // down
        console.log('↓');
        dPadPressedBefore[PRESS_DOWN_IDX] = true;
        dPadLabelText = 'X';
      } else if (angle >= 285 && angle <= 345) {
        // down-right
        console.log('↘︎');
        dPadPressedBefore[PRESS_DOWN_IDX] = true;
        dPadPressedBefore[PRESS_RIGHT_IDX] = true;
        dPadLabelText = 'C';
      }

      for (let i = 0; i < dPadPressed.length; i++) {
        if (dPadPressedBefore[i] && !dPadPressed[i]) {
          window.dispatchEvent(
            new KeyboardEvent('keydown', { code: D_PAD_PRESSED_KEY[i] })
          );
        } else if (!dPadPressedBefore[i] && dPadPressed[i]) {
          window.dispatchEvent(
            new KeyboardEvent('keyup', { code: D_PAD_PRESSED_KEY[i] })
          );
        }

        dPadPressed[i] = dPadPressedBefore[i];
      }
    };

    const endDPadPressed = () => {
      for (let i = 0; i < dPadPressed.length; i++) {
        if (dPadPressed[i]) {
          window.dispatchEvent(
            new KeyboardEvent('keyup', { code: D_PAD_PRESSED_KEY[i] })
          );
        }
      }

      dPadLabelText = 'S';
    };

    const renderDPadLabel = () => {
      dPadLabel.text = dPadLabelText;
    };

    const dPadLabel = new PIXI.Text('S', dPadStyle);
    dPadLabel.anchor.x = 0.5;
    dPadLabel.anchor.y = 0.5;
    dPadLabel.x = 0;
    dPadLabel.y = -7;
    dPadView.addChild(dPadLabel);

    // const dPadCircle = new PIXI.Graphics();
    // dPadCircle.beginFill(0xffffff);
    // dPadCircle.drawCircle(0, 0, PRESS_ZONE);
    // dPadCircle.endFill();
    // dPadView.addChild(dPadCircle)

    const aTouch = new PIXI.Text('a', btnStyle);
    aTouch.anchor.x = 0.5;
    aTouch.anchor.y = 0.5;
    aTouch.x = 290;
    aTouch.y = 200;
    aTouch.buttonMode = true;
    aTouch.interactive = true;
    aTouch.on('pointerdown', (evt) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: ACTION_KEY }));
      evt.target.scale.x = 1.2;
      evt.target.scale.y = 1.2;
      evt.target.text = '\u003c';
    });
    aTouch.on('pointerup', (evt) => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: ACTION_KEY }));
      evt.target.scale.x = 1;
      evt.target.scale.y = 1;
      evt.target.text = 'a';
    });
    aTouch.on('pointerupoutside', () => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: ACTION_KEY }));
      aTouch.scale.x = 1;
      aTouch.scale.y = 1;
      aTouch.text = 'b';
    });
    this.addChild(aTouch);

    const bTouch = new PIXI.Text('b', btnStyle);
    bTouch.anchor.x = 0.5;
    bTouch.anchor.y = 0.5;
    bTouch.x = 400;
    bTouch.y = 150;
    bTouch.buttonMode = true;
    bTouch.interactive = true;
    bTouch.on('pointerdown', (evt) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: ACTION_KEY }));
      evt.target.scale.x = 1.2;
      evt.target.scale.y = 1.2;
      evt.target.text = '\u003e';
    });
    bTouch.on('pointerup', (evt) => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: ACTION_KEY }));
      evt.target.scale.x = 1;
      evt.target.scale.y = 1;
      evt.target.text = 'b';
    });
    bTouch.on('pointerupoutside', () => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: ACTION_KEY }));
      bTouch.scale.x = 1;
      bTouch.scale.y = 1;
      bTouch.text = 'b';
    });
    this.addChild(bTouch);
  }
}
