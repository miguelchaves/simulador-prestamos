export enum Periodicidad {
  meses,
  anios
}

export interface Outputs {
  tieneComisionDeApertura: boolean;
  cuota: number;
  importeApertura: number;
  totalFinanciacion: number;
  importeIntereses: number;
  tablaAmortizacion: Amortizacion[]
  tae: number
}

export interface Amortizacion {
  numeroCuota: number;
  interes: number;
  amortizacion: number;
  pendiente: number;
}

export class SimuladorPrestamo {
  cantidad: number;
  tipoInteres: number;
  periodicidad: Periodicidad;
  plazo: number;
  comisionApertura: number;
  otrosGastos: number;

  constructor(props: any = {}) {
    this.cantidad = props.cantidad;
    this.tipoInteres = props.tipoInteres;
    this.plazo = props.plazo;
    this.periodicidad = props.periodicidad || Periodicidad.meses;
    this.comisionApertura = props.comisionApertura || 0;
    this.otrosGastos = props.otrosGastos || 0;
  }

  calcular(): Outputs {
    this.validarCamposEntrada();
    const { cantidad, tipoInteres, periodicidad, plazo, comisionApertura, otrosGastos } = this;
    const interesMensual = (tipoInteres || 0) / 12;
    const plazos = plazo * (periodicidad === Periodicidad.meses ? 1 : 12);
    const cuota = - this.pmt(interesMensual, plazos, cantidad);
    const importeApertura = cantidad * comisionApertura || 0;
    const totalFinanciacion = cuota * plazos + importeApertura;
    const importeIntereses = totalFinanciacion - cantidad;
    const tae = this.calcularTae(cantidad, tipoInteres, periodicidad, plazo, comisionApertura, otrosGastos);
    const tablaAmortizacion = this.tablaAmortizacion(cantidad, interesMensual, plazos, cuota);

    const resultado: Outputs = {
      tieneComisionDeApertura: comisionApertura !== 0,
      cuota,
      importeApertura,
      totalFinanciacion,
      importeIntereses,
      tablaAmortizacion,
      tae
    };
    return resultado;
  }

  private calcularTae(cantidad: number, tipoInteres: number, periodicidad: Periodicidad, plazo: number, comisionDeApertura: number = 0, otrosGastos: number = 0) {
    const interesMensual = (tipoInteres || 0) / 12;
    const plazos = plazo * (periodicidad === Periodicidad.meses ? 1 : 12);
    const cuota = this.pmt(interesMensual, plazos, cantidad);
    const importeApertura = Math.round(cantidad * comisionDeApertura || 0) / 100;
    const rate = this.rate(
      plazos,
      cuota,
      cantidad - importeApertura - otrosGastos
    ) * 12;
    const pow = (12 + rate) / 12;
    const tae = Math.pow(pow, 12) - 1;
    return tae;
  }

  private tablaAmortizacion(cantidad: number, interesMensual: number, plazos: number, cuota: number): Amortizacion[] {
    let cuotaInteres = 0;
    let cuotaAmortizacion = 0;
    let capitalPendiente = cantidad;
    let tablaAmortizacion = new Array();

    for (let i = 0; i < plazos; i++) {
      cuotaInteres = capitalPendiente * interesMensual;
      cuotaAmortizacion = cuota - cuotaInteres;
      capitalPendiente = capitalPendiente - cuotaAmortizacion;
      tablaAmortizacion.push({
        numeroCuota: i + 1,
        interes: cuotaInteres,
        amortizacion: cuotaAmortizacion,
        pendiente: i === plazos - 1 ? 0 : capitalPendiente
      });
    }
    return tablaAmortizacion;
  }

  /**
   * Calcula el tipo de interes de una anuealidad basándose en pagos periódicos constantes y en un tipo de interés constante
   * @param periods Número de periodos, que se van a realizar
   * @param payment Importe que se va a pagar por periodo
   * @param presentValue Valor actual de la anualidad
   * @param futureValue Valor futuro restante después de que se haya abonado el último pago
   * @param type Indica si la fecha de de vencimiento de los pagos es al final (0) o al principio (1) de cada periodo
   * @param guess Estimación del tipo de interés
   */
  private rate(periods: number, payment: number, presentValue: number, futureValue: number = 0, type: 0 | 1 = 0, guess: number = 0.01): number {
    // Set maximum epsilon for end of iteration
    const epsMax = 1e-10;

    // Set maximum number of iterations
    const iterMax = 10;

    // Implement Newton's method
    let y;
    let y0
    let y1
    let x0
    let x1 = 0
    let f = 0
    let i = 0;
    let rate = guess;
    if (Math.abs(rate) < epsMax) {
      y = presentValue * (1 + periods * rate) + payment * (1 + rate * type) * periods + futureValue;
    } else {
      f = Math.exp(periods * Math.log(1 + rate));
      y = presentValue * f + payment * (1 / rate + type) * (f - 1) + futureValue;
    }
    y0 = presentValue + payment * periods + futureValue;
    y1 = presentValue * f + payment * (1 / rate + type) * (f - 1) + futureValue;
    i = x0 = 0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > epsMax) && (i < iterMax)) {
      rate = (y1 * x0 - y0 * x1) / (y1 - y0);
      x0 = x1;
      x1 = rate;
        if (Math.abs(rate) < epsMax) {
          y = presentValue * (1 + periods * rate) + payment * (1 + rate * type) * periods + futureValue;
        } else {
          f = Math.exp(periods * Math.log(1 + rate));
          y = presentValue * f + payment * (1 / rate + type) * (f - 1) + futureValue;
        }
      y0 = y1;
      y1 = y;
      ++i;
    }
    return rate;
  };

  /**
   * Calcula el pago periódico de una anualidad basándose en pagos periódicos constantes y en un tipo de interés constante
   * @param interes Tipo de interes mensual
   * @param periods Número de periodos que se van a realizar (meses)
   * @param presentValue Valor actual de la anualidad
   * @param futureValue  Valor futuro restante después de que se haya abonado el último pago
   * @param type Indica si la fecha de de vencimiento de los pagos es al final (0) o al principio (1) de cada periodo
   */
  private pmt (interes: number, periods: number, presentValue: number, futureValue: number = 0, type: 0 | 1 = 0): number {
    var pmt, presentValueif;

    futureValue || (futureValue = 0);
    type || (type = 0);

    if (interes === 0) {
      return - (presentValue + futureValue) / periods;
    }

    presentValueif = Math.pow(1 + interes, periods);
    pmt = - interes * presentValue * (presentValueif + futureValue) / (presentValueif - 1);

    if (type === 1) {
      pmt /= (1 + interes);
    }

    return pmt;
  }

  private validarCamposEntrada() {
    const validation = {
      cantidad: [
        {
          msg: 'La cantidad debe ser mayor que cero',
          validator: (num: number) => num > 0
        }
      ],
      plazo: [
        {
          msg: 'El plazo debe ser mayor que cero',
          validator: (num: number) => num > 0
        }
      ],
      comisionApertura: [
        {
          msg: 'La comisión de apertura debe ser mayor o igual que cero',
          validator: (num: number) => num >= 0
        }
      ],
      otrosGastos: [
        {
          msg: 'Los gastos adicionales deben ser mayor o igual que cero',
          validator: (num: number) => num >= 0
        }
      ]
    };

    const messages = Object.entries(validation).map(([field, validations]) => {
      // @ts-ignore
      const messages: Array<string> = validations.map(validation => validation.validator(this[field]) ? '' : validation.msg);
      return messages;
    }).reduce((acc, elem) => acc.concat(elem), []);

    const invalidMessages = messages.filter(msg => msg);

    if (invalidMessages.length) {
      throw new ValidationError(invalidMessages);
    }
    return true;
  }
}

export class ValidationError extends Error {
  messages: Array<string>;
  constructor(messages: Array<string>) {
    super();
    this.messages = messages;
  }
}