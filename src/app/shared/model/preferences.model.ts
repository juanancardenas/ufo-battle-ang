export class Preferences {

  private _numberUfo: number = 1;
  private _time: number = 60;
  private _sendResult: boolean = true;

  constructor(init?: Partial<Preferences>) {
    if (init) {
      if (init.numberUfo !== undefined) this.numberUfo = init.numberUfo;
      if (init.time !== undefined) this.time = init.time;
      if (init.sendResult !== undefined) this.sendResult = init.sendResult;
    }
  }

  get numberUfo(): number {
    return this._numberUfo;
  }

  get time(): number {
    return this._time;
  }

  get sendResult(): boolean {
    return this._sendResult;
  }

  set numberUfo(value: number) {
    this._numberUfo = value > 0 ? value : 1;
  }

  set time(value: number) {
    this._time = value > 0 ? value : 60;
  }

  set sendResult(value: boolean) {
    this._sendResult = value != null ? value : false;
  }
}