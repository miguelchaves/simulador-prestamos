import assert from 'assert';
import { isUndefined, isArray } from 'util';
import {ValidationError, Periodicidad, SimuladorPrestamo} from '../src/simulador-prestamo';

const inputs = {
  cantidad: 10000,
  tipoInteres: 0.05,
  plazo: 12,
  periodicidad: Periodicidad.meses,
  comisionApertura: 0.023,
  otrosGastos: 100
};

const simulador = new SimuladorPrestamo(inputs);
let output = null;
try {
  output = simulador.calcular();
} catch(error) {
  console.error(error);
}
console.log(output);

describe('Elementos auxiliares', () => {
  describe('Se expone el enumerado Periodicidad', () => {
    it('El enumerado Periodicidad está expuesto', () => {
      assert.equal(typeof Periodicidad, 'object');
    });
  });
  describe('Se expone la clase ValidationError', () => {
    it('La clase ValidationError está expuesta', () => {
      assert.equal(typeof ValidationError, 'function');
    });
  });
});
// 
// describe('Clases Hijo y Ascendiente', () => {
//   describe('Están definidos', () => {
//     it('Están definidos como una clase (función)', () => {
//       assert.equal(typeof Hijo, 'function');
//       assert.equal(typeof Ascendiente, 'function');
//     });
//   });
//   describe('Instancias de Hijo y Asenciente', function () {
//     it('Las instancias de Hijo poseen las propiedades esperadas', () => {
//       const edad = 5;
//       const esDiscapacitado = true;
//       const discapacidadMayorDe65 = false;
//       const hijo  = new Hijo(edad, esDiscapacitado, discapacidadMayorDe65);
//       assert.equal(hijo.edad, edad);
//       assert.equal(hijo.esDiscapacitado, esDiscapacitado);
//       assert.equal(hijo.discapacidadMayorDe65, discapacidadMayorDe65);
//     });
// 
//     it('Las instancias de Ascendiente poseen las propiedades esperadas', () => {
//       const edad = 75;
//       const esDiscapacitado = true;
//       const discapacidadMayorDe65 = true;
//       const ascendiente  = new Ascendiente(edad, esDiscapacitado, discapacidadMayorDe65);
//       assert.equal(ascendiente.edad, edad);
//       assert.equal(ascendiente.esDiscapacitado, esDiscapacitado);
//       assert.equal(ascendiente.discapacidadMayorDe65, discapacidadMayorDe65);
//     });
//   });
// });
// 
// const INGENIERO = combos.categoriaProfesional[0].id;
// const SOLTERO = combos.estadoCivil[1].id;
// const INDEFINIDO = combos.tipoContrato[0].id;

describe('Simulador de préstamo', () => {

  describe('Está definida y es una clase', () => {
    it('Debe estar definida como una clase/función', () => {
      assert.equal(typeof SimuladorPrestamo, 'function');
    });
  });

  describe('Tiene definido el método calcular()', () => {
    it('Debe estar definido el método calcular()', () => {
      assert.equal(typeof new SimuladorPrestamo().calcular, 'function');
    });
  });

  const inputs = {
    cantidad: 10000,
    tipoInteres: 0.05,
    plazo: 12,
    periodicidad: Periodicidad.meses,
    comisionApertura: 0,
    otrosGastos: 0
  };
  
  describe('Errores al introducir campos de entrada erroneos', () => {
    it('Da un error al llamar a la librería sin campos de entrada', () => {
      let error: any = null;
      try {
        new SimuladorPrestamo().calcular();
      } catch (err) {
        error = err;
      }
      assert.ok(error instanceof ValidationError);
    });
    it('Da un error con cantidad menor que cero', () => {
      const inputError = {
        ...inputs,
        cantidad: -1
      };
      let error: any = null;
      try {
        new SimuladorPrestamo(inputError).calcular();
      } catch (err) {
        error = err;
      }
      assert.ok(error instanceof ValidationError);
    });
    it('Da un error con plazo menor que cero', () => {
      const inputError = {
        ...inputs,
        plazo: -1
      };
      let error: any = null;
      try {
        new SimuladorPrestamo(inputError).calcular();
      } catch (err) {
        error = err;
      }
      assert.ok(error instanceof ValidationError);
    });
    it('Da un error con comision de apertura menor que cero', () => {
      const inputError = {
        ...inputs,
        comisionApertura: -1
      };
      let error: any = null;
      try {
        new SimuladorPrestamo(inputError).calcular();
      } catch (err) {
        error = err;
      }
      assert.ok(error instanceof ValidationError);
    });
    it('Da un error con otros gastos menor que cero', () => {
      const inputError = {
        ...inputs,
        otrosGastos: -1
      };
      let error: any = null;
      try {
        new SimuladorPrestamo(inputError).calcular();
      } catch (err) {
        error = err;
      }
      assert.ok(error instanceof ValidationError);
    });
  });

  const output: any = new SimuladorPrestamo(inputs).calcular();

  describe('El Output debe tener la estructura esperada', () => {
    it('Devuelve el output esperado', () => {
      const propertiesExpected = {
        tieneComisionDeApertura: 'boolean',
        cuota: 'number',
        importeApertura: 'number',
        totalFinanciacion: 'number',
        importeIntereses: 'number',
        tablaAmortizacion: 'object'
      };
      assert.ok(typeof output === 'object' && Object.entries(propertiesExpected).every(([key, type]) => typeof output[key] === type));
    });

    it('La tabla de amortización tiene el formato esperado', () => {
      const propertiesExpected = {
        numeroCuota: 'number',
        interes: 'number',
        amortizacion: 'number',
        pendiente: 'number',
      };
      output.tablaAmortizacion.forEach((amortizacion: any) => {
        assert.ok(typeof amortizacion === 'object' && Object.entries(propertiesExpected).every(([key, type]) => typeof amortizacion[key] === type));
      });
    });
    it('La tabla de amortización tiene tantos elementos como plazos si la periodicidad es mensual', () => {
      assert.equal(output.tablaAmortizacion.length, inputs.plazo);
    });
    it('La tabla de amortización tiene tantos elementos como plazos multiplicado por 12 mensuaalidades si la periodicidad es anual', () => {
      const inputsPeriodicidadAnual ={
        ...inputs,
        plazo: 5,
        periodicidad: Periodicidad.anios
      };
      assert.equal(new SimuladorPrestamo(inputsPeriodicidadAnual).calcular().tablaAmortizacion.length, inputsPeriodicidadAnual.plazo * 12);
    });
  });

  describe('Cálculo de la TAE', () => {
    it('La TAE aumenta si sube el tipo de interés nominal', () => {
      const inputTIN6 ={
        ...inputs,
        tipoInteres: 0.06
      };
      const outputTIN6: any = new SimuladorPrestamo(inputTIN6).calcular();
      assert.ok(output.tae < outputTIN6.tae);
    });

    it('La TAE aumenta si sube la comisión de apertura', () => {
      const inputComision ={
        ...inputs,
        comisionApertura: 0.023
      };
      const outputComision: any = new SimuladorPrestamo(inputComision).calcular();
      assert.ok(output.tae < outputComision.tae);
    });
    it('La TAE aumenta si suben los gastos adicionales del préstamo', () => {
      const inputotrosGastos ={
        ...inputs,
        otrosGastos: 200
      };
      const outPutOtrosGastos: any = new SimuladorPrestamo(inputotrosGastos).calcular();
      assert.ok(output.tae < outPutOtrosGastos.tae);
    });
  });

  describe('Préstamo con intereses', () => {
    it('La simulación de un préstamo con intereses supone un gasto de financiación', () => {
      const inputInteres = {
        cantidad: 12000,
        tipoInteres: 0.05,
        plazo: 12,
        periodicidad: Periodicidad.meses,
        comisionApertura: 0,
        otrosGastos: 0
      }
      const outputInteres: any = new SimuladorPrestamo(inputInteres).calcular();
      assert.ok(outputInteres.totalFinanciacion > inputInteres.cantidad);
      assert.ok(outputInteres.cuota * inputInteres.plazo > inputInteres.cantidad);
    });
  });

  describe('Préstamo sin interés', () => {
    it('La simulación de un préstamo sin intereses ni gastos efectivamente no supone gastos', () => {
      const inputSinIntereses = {
        cantidad: 12000,
        tipoInteres: 0,
        plazo: 12,
        periodicidad: Periodicidad.meses,
        comisionApertura: 0,
        otrosGastos: 0
      }
      const outputSinIntereses: any = new SimuladorPrestamo(inputSinIntereses).calcular();
      assert.equal(outputSinIntereses.totalFinanciacion, inputSinIntereses.cantidad);
      assert.equal(outputSinIntereses.cuota, inputSinIntereses.cantidad / inputSinIntereses.plazo);
    });
  });
});