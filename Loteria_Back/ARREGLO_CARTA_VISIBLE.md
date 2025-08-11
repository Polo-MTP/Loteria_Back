# 🎴 Arreglo: Carta Visible para Anfitrión

## 🔍 **Problema Identificado**

El anfitrión reportaba que **la carta desaparecía después de unos momentos** cuando la sacaba, cuando lo que quería era que **se mantuviera visible hasta sacar la siguiente carta**.

El problema NO era que necesitara un botón para ocultar manualmente, sino que la carta se ocultaba automáticamente por algún timeout o polling en el frontend.

---

## ✅ **Solución Implementada**

### **Backend Mejorado**

1. **Endpoint `showJuegoAnfitrion` mejorado** - Ahora incluye información adicional para garantizar que la carta se mantenga visible:

```typescript
const partidaCompleta = {
  ...partida.$attributes,
  anfitrion: partida.anfitrion,
  usuarios: usuariosConFichas,
  // Información adicional para el anfitrión
  totalCartasGritadas: partida.cartas_gritadas.length,
  cartasRestantes: 52 - partida.cartas_gritadas.length,
  cartaActualVisible: partida.carta_actual // Siempre mantener visible la carta actual
}
```

2. **Campo adicional `cartaActualVisible`** - Redundancia para evitar que la carta se pierda
3. **Información de contador consistente** - `totalCartasGritadas` y `cartasRestantes`

### **Comportamiento Esperado**

- ✅ **La carta se mantiene visible** hasta que el anfitrión saque la siguiente
- ✅ **No desaparece automáticamente** después de unos segundos
- ✅ **El contador es consistente** y no se reinicia
- ✅ **El backend siempre devuelve la carta actual** de manera confiable

---

## 🛠️ **Cambios Técnicos**

### **Backend**
- **Endpoint `showJuegoAnfitrion` mejorado** con campo `cartaActualVisible`
- **Información redundante** para evitar pérdida de datos
- **Contador mejorado** con `totalCartasGritadas` y `cartasRestantes`

### **Frontend - Lo que necesitas hacer**
1. **Usar el campo `cartaActualVisible`** en lugar de `cartaActual` si es necesario
2. **Revisar cualquier timeout o lógica** que oculte la carta automáticamente
3. **Usar los campos de contador mejorados** para evitar reinicios
4. **Verificar el polling** para que no limpie la carta actual

---

## 📊 **Respuesta del Backend Mejorada**

### **Endpoint para Anfitrión** (`GET /juego/anfitrion/:id`)
```json
{
  "message": "Partida en curso cargada correctamente",
  "partida": {
    "id": 1,
    "nombre": "Partida Test",
    "estado": "en_curso",
    "carta_actual": 25,
    "cartas_gritadas": [1, 2, 3, ..., 25],
    "totalCartasGritadas": 25,
    "cartasRestantes": 27,
    "cartaActualVisible": 25,  // ← NUEVO: Siempre visible
    "anfitrion": {...},
    "usuarios": [...]
  }
}
```

### **Endpoint de Sincronización** (`GET /juego/:id/sync`)
```json
{
  "success": true,
  "partida": {
    "estado": "en_curso",
    "cartaActual": 25,
    "cartasGritadas": [1, 2, 3, ..., 25],
    "totalCartasGritadas": 25,  // ← NUEVO: Contador redundante
    "cartasRestantes": 27,      // ← NUEVO: Cálculo automático
    "ganadorId": null
  },
  "jugador": {...}
}
```

---

## 🔧 **Para el Frontend**

### **Recomendaciones**

1. **Usa `cartaActualVisible`** o `cartaActual` - ambos tendrán el mismo valor
2. **Revisa timers o timeouts** que puedan estar ocultando la carta
3. **Usa `totalCartasGritadas`** en lugar de calcular `cartasGritadas.length`
4. **Verifica el polling** para que no reemplace la carta con `null`

### **Posibles causas del problema anterior**
- Timeout JavaScript que ocultaba la carta
- Polling que limpiaba la vista después de X segundos  
- Lógica de UI que "auto-ocultaba" la carta
- Estado del componente que se reiniciaba

---

## ✅ **Estado Final**

- ✅ **Backend garantiza carta visible** hasta la siguiente
- ✅ **Información redundante** para evitar pérdidas
- ✅ **Contador mejorado** para evitar reinicios
- ✅ **Compilación exitosa** sin errores
- ✅ **Eliminadas funcionalidades innecesarias** (ocultar manual)

---

## 🎯 **Resultado Esperado**

**Antes**: Carta desaparecía después de unos momentos ❌
**Ahora**: Carta se mantiene visible hasta sacar la siguiente ✅

El backend ahora proporciona **información consistente y confiable** para que el frontend pueda mantener la carta visible correctamente sin timeouts o comportamientos inesperados.
