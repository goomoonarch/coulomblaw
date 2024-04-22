

# Experimento de la Ley de Coulomb

## Descripción General
Este documento explica la implementación en JavaScript del experimento de la Ley de Coulomb utilizando un canvas HTML y JavaScript. En este experimento, varias cargas interactúan entre sí siguiendo la Ley de Coulomb, y una de estas cargas puede moverse interactivamente usando el mouse.

## Configuración del Experimento

### Inicialización del Canvas
```javascript
const canvas = document.getElementById("coulombCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
```
- `const canvas = document.getElementById("coulombCanvas");`: Obtiene una referencia al elemento HTML `<canvas>` identificado por el ID "coulombCanvas".
- `const ctx = canvas.getContext("2d");`: Obtiene el contexto de dibujo en 2D para este lienzo, que se usará para todas las operaciones de dibujo.
- `canvas.width = 800;` y `canvas.height = 800;`: Establece el ancho y alto del lienzo a 800 píxeles respectivamente.

### Inicialización de las Cargas
```javascript
let charges = [
  { x: 100, y: 100, charge: -1, movable: false, inDipole: false },
  { x: 700, y: 100, charge: 1, movable: false, inDipole: false },
  { x: 100, y: 700, charge: -1, movable: false, inDipole: false },
  { x: 700, y: 700, charge: 1, movable: true, inDipole: false },
];
```
Define un arreglo `charges` que contiene objetos, cada uno representando una carga con propiedades como posición (`x`, `y`), magnitud y signo de la carga (`charge`), si es móvil (`movable`), y si está en un dipolo (`inDipole`).

### Constantes de la Ley de Coulomb
```javascript
const k = 1.1e7;
const minDistance = 35;
```
- `k`: Constante de Coulomb (en unidades adaptadas para el contexto del programa).
- `minDistance`: Distancia mínima para considerar una interacción especial, en este caso para formar un dipolo y evitar la singularidad en cero ( es un método de agragar naturaleza corpuscular a las cargas ).

### Función para Dibujar las Cargas
```javascript
function drawCharges() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  charges.forEach(charge => {
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = charge.charge > 0 ? 'red' : 'blue';
    ctx.fill();
  });
}
```
 - `ctx.clearRect(0, 0, canvas.width, canvas.height);`: Limpia el lienzo.
- `charges.forEach(...)`: Itera sobre cada carga y las dibuja como círculos de radio 20, coloreados en rojo o azul dependiendo de si la carga es positiva o negativa.
## Manejo de eventos de ratón
#### Evento `mousedown`
```javascript
canvas.addEventListener("mousedown", (event) => {
  charges.forEach((charge) => {
    if (charge.movable) {
      const distance = Math.sqrt(
        (event.offsetX - charge.x) ** 2 + (event.offsetY - charge.y) ** 2
      );
      if (distance < 20) {
        isDragging = true;
        draggedCharge = charge;
        charge.inDipole = false;
      }
    }
  });
});
```
Cuando se presiona el ratón, verifica si el cursor está sobre alguna carga móvil. Si lo está, se inicia el arrastre (`isDragging`).
#### Evento `mousemove`
```javascript
canvas.addEventListener("mousemove", (event) => {
  if (isDragging && draggedCharge) {
    draggedCharge.x = event.offsetX;
    draggedCharge.y = event.offsetY;
    drawCharges();
  }
});
```
Mueve la carga arrastrada a la nueva posición del cursor y redibuja todas las cargas.
#### Evento `mouseup`
```javascript
canvas.addEventListener("mouseup", () => {
  isDragging = false;
  draggedCharge = null;
  charges.forEach((charge) => {
    if (charge.movable) {
      updateForces();
    }
  });
});
```
Detiene el arrastre al soltar el botón del ratón y actualiza las fuerzas sobre las cargas.

## Simulación de fuerzas y movimiento
### Ley de Coulomb
La fuerza entre dos cargas puntuales se da por la fórmula:

$F=k\frac{q_{1}\cdot q_{2}}{r^{2}}$

donde:
- $F$ es la magnitud de la fuerza electrostática entre dos cargas.
- $k$ es la constante de Coulomb.
- $q_1$ y $q_2$ son las cantidades de las cargas.
- $r$ es la distancia entre las cargas.

### Lógica de Interacción de Fuerzas
### 1. `updateForces()`
Esta función es responsable de actualizar las fuerzas que actúan sobre cada carga y de mover las cargas en consecuencia. También se encarga de re-dibujar las cargas y de reinvocarse continuamente usando `requestAnimationFrame` para crear una animación fluida.
```javascript
function updateForces() {
  charges.forEach((charge) => {
    if (charge.movable && !isDragging) {
      if (!charge.inDipole) {
        let forces = calculateForces(charge);
        updatePosition(charge, forces);
      }
    }
  });
  drawCharges();
  requestAnimationFrame(updateForces);
}
```
-   `charges.forEach((charge) => {...})`: Itera sobre cada carga en el arreglo `charges`.
-   `if (charge.movable && !isDragging)`: Verifica si la carga es móvil y si no está siendo arrastrada actualmente. Esto evita actualizar fuerzas y posiciones durante el arrastre, lo cual podría interferir con la interacción del usuario.
-   `if (!charge.inDipole)`: Comprueba si la carga no forma parte de un dipolo. Esta condición evita que las cargas en un dipolo sean movidas individualmente por fuerzas externas.
-   `let forces = calculateForces(charge);`: Calcula las fuerzas que actúan sobre la carga llamando a `calculateForces`.
-   `updatePosition(charge, forces);`: Actualiza la posición de la carga basándose en las fuerzas calculadas.
-   `drawCharges();`: Vuelve a dibujar todas las cargas en el lienzo para reflejar cualquier cambio en su posición.
-   `requestAnimationFrame(updateForces);`: Programa la próxima ejecución de `updateForces` para el próximo ciclo de animación, permitiendo que la simulación continúe ejecutándose de forma fluida.

### 2. `calculateForces(charge)`
Esta función calcula las fuerzas netas que actúan sobre una carga específica en base a las interacciones con otras cargas. Utiliza la ley de Coulomb para determinar la magnitud y dirección de las fuerzas.
```javascript
function calculateForces(charge) {
  let fx = 0, fy = 0;
  charges.forEach((other) => {
    if (other !== charge && !charge.inDipole) {
      let dx = other.x - charge.x;
      let dy = other.y - charge.y;
      let r = Math.sqrt(dx * dx + dy * dy);
      if (r < minDistance && charge.charge * other.charge < 0) {
        charge.inDipole = true;
        charge.x = other.x - (minDistance + 5) * (dx / r);
        charge.y = other.y - (minDistance + 5) * (dy / r);
        return;
      }
      let forceMagnitude = (k * charge.charge * other.charge) / (r * r);
      fx += forceMagnitude * (dx / r);
      fy += forceMagnitude * (dy / r);
    }
  });
  return { fx, fy };
}
```
-   `let fx = 0, fy = 0;`: Inicializa las componentes x e y de la fuerza neta.
-   `charges.forEach((other) => {...})`: Itera sobre cada carga en el arreglo para calcular las fuerzas debido a otras cargas.
-   `if (other !== charge && !charge.inDipole)`: Asegura que no se calcule la fuerza sobre sí misma y que la carga no esté en un dipolo.
-   `let dx = other.x - charge.x;` y `let dy = other.y - charge.y;`: Calcula las diferencias en las coordenadas x e y entre la carga `other` y la carga actual.
-   `let r = Math.sqrt(dx * dx + dy * dy);`: Calcula la distancia entre las dos cargas.
-   El bloque `if (r < minDistance && charge.charge * other.charge < 0)` maneja la condición de que las cargas opuestas se acerquen demasiado, formando un "dipolo".
-   `let forceMagnitude = (k * charge.charge * other.charge) / (r * r);`: Calcula la magnitud de la fuerza usando la ley de Coulomb.
-   `fx += forceMagnitude * (dx / r);` y `fy += forceMagnitude * (dy / r);`: Acumula las componentes de la fuerza en las direcciones x e y respectivamente.
-   `return { fx, fy };`: Devuelve un objeto con las componentes x e y de la fuerza neta.

### 3. `updatePosition(charge, forces)`

Esta función actualiza la posición de una carga dada basándose en las fuerzas que actúan sobre ella. Ajusta las coordenadas x e y de la carga.
```javascript
function updatePosition(charge, forces) {
  if (!charge.inDipole) {
    charge.x += forces.fx * -0.01;
    charge.y += forces.fy * -0.01;
  }
}
```
-   `if (!charge.inDipole)`: Verifica que la carga no esté en un dipolo antes de moverla.
-   `charge.x += forces.fx * -0.01;` y `charge.y += forces.fy * -0.01;`: Actualiza las coordenadas x e y de la carga. El factor `-0.01` esta relacionado con un paso de tiempo o una escala para suavizar el movimiento.

Estas tres funciones trabajan en conjunto para simular la dinámica de interacciones entre cargas eléctricas, permitiendo la visualización en tiempo real de fuerzas y movimientos en un entorno de simulación interactivo.

## Lincencia y modo de uso
Este programa es de código abierto desarrollado por MoonArch Industries, puede usarse con fines educativos, pesonales o comerciales.
![MoonArch Industries SAS BIC](./public/MA_Logo_concept_3.png)