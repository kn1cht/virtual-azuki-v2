export class AzukiWave {
  private a: number;
  private b: number;
  private all: number;
  private moveRate = 100;

  constructor(amount: number) {
    this.a = this.b = amount;
    this.all = 2 * amount;
  }

  public moveFromAngle(angle: number): [number, number] {
    const force = Math.sin((angle * Math.PI) / 180.0);
    const moveAmount = Math.abs(force) < 0.05 ? 0 : this.moveRate * force;
    const aPre = this.a;
    const bPre = this.b;
    this.b += moveAmount;
    this.a -= moveAmount;
    if (this.a < 0) {
      this.b += this.a;
      this.a = 0;
    } else if (this.b < 0) {
      this.a += this.b;
      this.b = 0;
    }

    const aVolume = (this.a / this.all) * Math.abs(aPre - this.a);
    const bVolume = (this.b / this.all) * Math.abs(bPre - this.b);
    return [ aVolume, bVolume ];
  }
}
