# Simulador de préstamos

[![CI/CD](https://github.com/miguelchaves/simulador-prestamos/actions/workflows/node.js.yml/badge.svg)](https://github.com/miguelchaves/simulador-prestamos/actions/workflows/node.js.yml)
[![Test Results](https://raw.githubusercontent.com/gist/miguelchaves/95733b1329a62c3e44056a1d006c2410/raw/badge.svg)](https://github.com/miguelchaves/simulador-prestamos/actions/workflows/node.js.yml)
[![GitHub release badge](https://badgen.net/github/release/miguelchaves/simulador-prestamos/stable)](https://github.com/miguelchaves/simulador-prestamos/releases/latest)
[![GitHub license badge](https://badgen.net/github/license/miguelchaves/simulador-prestamos)](https://github.com/miguelchaves/simulador-prestamos/blob/main/LICENSE)

## Descripcion
Librería Javascript & Typescript para realizar simulaciones de préstamos personales o hipotecarios, calcular la cuota, la TAE y la tabla de amortización

Instalación
-----------

```bash
$ npm install simulador-prestamo
```

Para probar la librería puedes hacer uso de la siguiente aplicación:
* Simulador de préstamos personales: https://herramientas-financieras.firebaseapp.com/simulador-prestamo/personal
* Simulador de hipotecas: https://herramientas-financieras.firebaseapp.com/simulador-prestamo/hipoteca

Documentación
-------------

La librería expone la clase `SimuladorPrestamo`, que, una vez instanciada, tendrá disponible el métdo `calcular()`. Este método no recibe parámetros, sino que usa las propiedades de la librería, que pueden ser inicializadas en el constructor.

Se puede emplear también para hipotecas. Para ello, el plazo se puede indicar con periodicidad anual. El interés para una hipoteca variable se informa indicando el euríbor más el diferencial en el campo `tipoInteres`.

### Propiedades de la librería:

| Campo | Tipo | Descripción | Valor por defecto | Ejemplo |
|-------|-----|--------------|-------------------|---------|
| `cantidad` | `Number` | Cantidad a solicitar para el préstamo. Debe ser mayor que cero | N/A | `10000` |
| `tipoInteres` | `Number` | Tipo de Interés Nominal (TIN). Expresado en tanto por 1 | N/A | `0.05` |
| `periodicidad`| `Periodicidad` | Enumerado con estos dos valores posibles: `"meses"` y `"anios"` | `meses` | ` anios` |
| `plazo` | `Number` | Indica el plazo de pago, con el contexto de la periodicidad | N/A | `60` | 
| `comisionApertura` | `Number` | Interés de la comisión de apertura, expresado en tanto por 1 | `0` | `0.023`|
| `otrosGastos` | `Number` | Importe de otros gastos para la constitución del préstamo | `0` | `400` |

### Datos de salida:

| Campo | Tipo | Descripción | Ejemplo |
|-------|-----|--------------|---------|
| `cuota` | `Number` | Importe de la cuota. Debe redondearse el valor con dos dígitos | `245.65` |
| `tieneComisionDeApertura` | `Boolean` | Será `true` si la comision de apertura es mayot que 0 | `true` |
| `importeApertura` | `Number` | Resultado de multiplicar el interés de la comisión por la cantidad a financiar | `230` |
| `totalFinanciacion` | `Number` | El total del préstamo, sumando las cuotas y los intereses | `12570` |
| `importeIntereses` | `Number` | El coste del préstamo, incluyendo comisiones, gastos e intereses | `2815.25` | 
| `tablaAmortizacion` | `Array<Object>` | Incluye la tabla de amortización de cada una de las cuotas | ... |
| `tae` | `Number` | TAE expresada en tanto por 1 | `0.0513` |

### Ejemplo de uso

```javascript
import { SimuladorPrestamo, Periodicidad } from 'simulador-prestamo';

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

// Valores obtenidos:
const {
  tieneComisionDeApertura, // true
  cuota,             // 856.0748178846745
  importeApertura,   // 230
  totalFinanciacion, // 10502.897814616095
  importeIntereses,  // 502.8978146160953
  tablaAmortizacion, // [
                     //   {
                     //     numeroCuota: 1,
                     //     interes: 41.666666666666664,
                     //     amortizacion: 814.4081512180079,
                     //     pendiente: 9185.591848781993
                     //   }, ...
                     // ]
  tae,               // 0.07149364492435062
  cuotasSeguridadSocial
} = output;
```

Construcción
-------------
```bash
$ npm run build
```
Crea diferentes versiones de la librería en `dist/`:
* `dist/simulador-prestamo.js`. Módulo en formato *CommonsJS*
* `dist/simulador-prestamo.mjs`. Módulo en formato *ES6*
* `dist/simulador-prestamo.d.ts`. Declaración de tipos para *Typescript*

Historial de versiones
-------------
* *`v1.0.0`*: Primera versión de la librería


Tests
-------------

```bash
# Devuelve el resultado por la salida del terminal sin generar archivos:
$ npm run test:no-file

# Devuelve el resultado en un JSON: report.json
$ npm test
```
