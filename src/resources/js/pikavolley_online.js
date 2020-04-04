'ues strics';
import { PikachuVolleyball } from './offline_version_js/pikavolley.js';
import { MyKeyboard, OnlineKeyboard } from './pika_keyboard_online.js';
import { channel } from './data_channel';
import { mod } from './mod.js';

/** @typedef GameState @type {function():void} */

// TODO: remove unnecessary "@ts-ignore"'s
export const myKeyboard = new MyKeyboard(
  'd',
  'g',
  'r',
  'f',
  'z',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Enter'
);

// @ts-ignore
export class PikachuVolleyballOnline extends PikachuVolleyball {
  constructor(stage, resources) {
    super(stage, resources);
    this.physics.player1.isComputer = false;
    this.physics.player2.isComputer = false;

    // @ts-ignore
    this.keyboardArray[0].unsubscribe();
    // @ts-ignore
    this.keyboardArray[1].unsubscribe();

    this.myKeyboard = myKeyboard;
    this.myOnlineKeyboard = new OnlineKeyboard(this.myKeyboard.inputQueue);
    this.peerOnlineKeyboard = new OnlineKeyboard(channel.peerInputQueue);

    this._amIPlayer2 = false;
    this.keyboardArray = [this.myOnlineKeyboard, this.peerOnlineKeyboard];
    this._syncCounter = 0;
    this.noInputFrameTotal.menu = 0;
    this.noInputFrameTotal = {
      menu: Infinity
    };
  }

  /**
   * @return {boolean}
   */
  get amIPlayer2() {
    return this._amIPlayer2;
  }

  /**
   * @param {boolean} bool Am I Player 2? Am I play on the right side?
   */
  set amIPlayer2(bool) {
    this._amIPlayer2 = bool;
    channel.amIPlayer2 = bool;
    if (this._amIPlayer2 === true) {
      // @ts-ignore
      this.keyboardArray = [this.peerOnlineKeyboard, this.myOnlineKeyboard];
    } else {
      // @ts-ignore
      this.keyboardArray = [this.myOnlineKeyboard, this.peerOnlineKeyboard];
    }
  }

  get syncCounter() {
    return this._syncCounter;
  }

  set syncCounter(counter) {
    this._syncCounter = mod(counter, 256); // since it is to be sent as Uint8
  }

  beforeStartOfNewGame() {
    if (this.frameCounter === 0) {
      if (channel.amICreatedRoom) {
        if (this.selectedWithWho === 0) {
          this.amIPlayer2 = false;
        } else {
          this.amIPlayer2 = true;
        }
      } else {
        if (this.selectedWithWho === 0) {
          this.amIPlayer2 = true;
        } else {
          this.amIPlayer2 = false;
        }
      }
    }
    super.beforeStartOfNewGame();
  }

  /**
   * Game loop
   * This function should be called at regular intervals ( interval = (1 / FPS) second )
   */
  gameLoop() {
    if (channel.isOpen !== true) {
      return;
    }

    // Sync game frame and user input with peer
    //
    // This must be before the slow-mo effect.
    // Otherwise, frame sync could be broken,
    // for example, if peer use other tap on the browser
    // so peer's game pause while my game goes on slow-mo.
    // This broken frame sync results into different game state between two peers.
    this.myKeyboard.getInputIfNeededAndSendToPeer();
    this.gameLoopFromGettingPeerInput();
  }

  gameLoopFromGettingPeerInput() {
    const succeed = this.peerOnlineKeyboard.getInput(this.syncCounter);
    if (!succeed) {
      channel.callbackWhenReceivePeerInput = this.gameLoopFromGettingPeerInput.bind(
        this
      );
      // TODO: resend....
      return;
    }
    const succeedTest = this.myOnlineKeyboard.getInput(this.syncCounter);
    if (!succeedTest) {
      console.log('Something is wrong.....');
      return;
    }
    this.syncCounter++;

    // slow-mo effect
    if (this.slowMotionFramesLeft > 0) {
      this.slowMotionNumOfSkippedFrames++;
      if (
        this.slowMotionNumOfSkippedFrames %
          Math.round(this.normalFPS / this.slowMotionFPS) !==
        0
      ) {
        return;
      }
      this.slowMotionFramesLeft--;
      this.slowMotionNumOfSkippedFrames = 0;
    }

    this.physics.player1.isComputer = false;
    this.physics.player2.isComputer = false;
    this.state();

    if (this.peerOnlineKeyboard.inputQueue.length > 1) {
      if (this.myOnlineKeyboard.inputQueue.length > 1) {
        this.gameLoopFromGettingPeerInput();
        console.log('hehe');
      } else {
        this.gameLoop();
        console.log('hehe2');
      }
    }
  }
}