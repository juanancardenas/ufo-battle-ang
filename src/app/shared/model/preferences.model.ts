export class Preferences {

  private _numberUfo: number = 1;
  private _time: number = 60;

  constructor(init?: Partial<Preferences>) {
    if (init) {
      if (init.numberUfo !== undefined) this.numberUfo = init.numberUfo;
      if (init.time !== undefined) this.time = init.time;
    }
  }

  get numberUfo(): number {
    return this._numberUfo;
  }

  get time(): number {
    return this._time;
  }

  set numberUfo(value: number) {
    this._numberUfo = value > 0 ? value : 1; // protección opcional
  }

  set time(value: number) {
    this._time = value > 0 ? value : 60; // protección opcional
  }
}
