# 🔧 Solución Específica: Carta que Desaparece

## 🎯 **Problema Identificado en el Frontend**

He revisado el código del componente `anfitrion.component.ts` y encontré **exactamente** el problema:

### **Línea 67 - El Culpable:**
```typescript
this.cartaActual = response.partida.cartaActual ?? 0;
```

**Problema**: Si `cartaActual` viene como `null` desde el backend, se convierte en `0`, lo que significa "no hay carta" y la carta desaparece de la pantalla.

### **Líneas 41-43 - Polling Problemático:**
```typescript
this.pollingSubscription = interval(5000).subscribe(() => {
  this.cargarPartida(false);
});
```

**Problema**: Cada 5 segundos recarga la partida, y si `cartaActual` viene como `null`, la carta desaparece.

---

## ✅ **Solución: Mantener la Carta Hasta la Siguiente**

### **Opción 1: Usar el Nuevo Campo del Backend**

Cambia la línea 67 por:

```typescript
// Usar el nuevo campo cartaActualVisible, o mantener la anterior si no hay nueva
const nuevaCarta = response.partida.cartaActualVisible ?? response.partida.cartaActual;
if (nuevaCarta && nuevaCarta > 0) {
  this.cartaActual = nuevaCarta;
}
// Si nuevaCarta es null o 0, mantener this.cartaActual como estaba
```

### **Opción 2: Solución Simple (Recomendada)**

Cambia la línea 67 por:

```typescript
// Solo actualizar cartaActual si hay una carta nueva válida
if (response.partida.cartaActual && response.partida.cartaActual > 0) {
  this.cartaActual = response.partida.cartaActual;
}
// Si viene null o 0, mantener la carta anterior visible
```

---

## 🛠️ **Implementación Completa**

### **Archivo**: `Loteria/src/app/dashboard/anfitrion/anfitrion.component.ts`

**Cambiar esto (líneas 66-67):**
```typescript
this.cartasGritadas = response.partida.cartasGritadas || [];
this.cartaActual = response.partida.cartaActual ?? 0;
```

**Por esto:**
```typescript
this.cartasGritadas = response.partida.cartasGritadas || [];

// Solo actualizar la carta si hay una nueva carta válida
// Esto mantiene la carta anterior visible hasta sacar la siguiente
if (response.partida.cartaActual && response.partida.cartaActual > 0) {
  this.cartaActual = response.partida.cartaActual;
}
// Si cartaActual es null/undefined/0, mantener la carta anterior
```

### **Explicación:**
- **Antes**: `cartaActual ?? 0` → Si es `null`, se convierte en `0` (sin carta)
- **Ahora**: Solo actualizar si hay carta válida → La carta anterior se mantiene visible

---

## 🎯 **Resultado Esperado**

### **Comportamiento Anterior:**
1. Anfitrión saca carta → Se muestra
2. Polling se ejecuta → `cartaActual` viene como `null` 
3. Se convierte en `0` → Carta desaparece ❌

### **Comportamiento Nuevo:**
1. Anfitrión saca carta → Se muestra
2. Polling se ejecuta → `cartaActual` viene como `null`
3. **Se mantiene la carta anterior** → Carta visible ✅
4. Al sacar nueva carta → Se actualiza y muestra la nueva

---

## 🔧 **Cambio Adicional Opcional**

Si quieres usar el nuevo campo `cartaActualVisible` del backend mejorado:

```typescript
// Usar el campo específico para anfitrión que siempre tiene la carta
const cartaParaMostrar = response.partida.cartaActualVisible ?? response.partida.cartaActual;
if (cartaParaMostrar && cartaParaMostrar > 0) {
  this.cartaActual = cartaParaMostrar;
}
```

---

## ✅ **Solución Final**

**Cambio Mínimo Necesario:**

En `anfitrion.component.ts`, línea 67, cambiar:
```typescript
// ❌ Esto causa que desaparezca la carta
this.cartaActual = response.partida.cartaActual ?? 0;

// ✅ Esto mantiene la carta visible hasta la siguiente
if (response.partida.cartaActual && response.partida.cartaActual > 0) {
  this.cartaActual = response.partida.cartaActual;
}
```

**¡Con este simple cambio, la carta se mantendrá visible hasta que el anfitrión saque la siguiente!** 🎉
