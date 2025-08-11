# Tests para Mecánica Automática de Lotería

## Endpoints Implementados

### 🎮 Gestión de Fichas
- `POST /juego/:id/ficha` - Colocar ficha (con validación automática en ficha #16)
- `DELETE /juego/:id/ficha` - Quitar ficha

### 📊 Estadísticas y Estado
- `GET /juego/:id/estadisticas` - Estadísticas completas de la partida
- `GET /juego/:id/sync` - Sincronizar estado del jugador

### 🎯 Funcionalidad Principal
- `POST /gritar-carta/:id` - Gritar carta (con finalización automática en carta #52)
- `POST /juego/:id/cantar-loteria` - Método manual de cantar lotería (backup)

## Casos de Prueba

### Caso 1: Jugador Gana Automáticamente
```bash
# Colocar 15 fichas normales
curl -X POST http://localhost:3333/juego/1/ficha \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"posicion": 1}'

# Colocar ficha #16 -> Debe activar validación automática
curl -X POST http://localhost:3333/juego/1/ficha \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"posicion": 16}'
```

**Respuesta Esperada (Ganador):**
```json
{
  "message": "¡Felicidades! ¡LOTERÍA! Has ganado la partida",
  "fichas": [1, 2, 3, ..., 16],
  "eliminado": false,
  "ganador": true
}
```

### Caso 2: Jugador Eliminado Automáticamente
```bash
# Similar al caso 1, pero con cartas no gritadas en el cartón
```

**Respuesta Esperada (Eliminado):**
```json
{
  "message": "Ficha colocada, pero perdiste la partida",
  "fichas": [1, 2, 3, ..., 16],
  "eliminado": true,
  "ganador": false,
  "detalleEliminacion": "Las siguientes cartas no han sido gritadas: 5, 12, 23",
  "cartasNoGritadas": [5, 12, 23]
}
```

### Caso 3: Partida Finalizada sin Ganador
```bash
# Gritar las 52 cartas sin que ningún jugador complete su cartón
curl -X POST http://localhost:3333/gritar-carta/1 \
  -H "Authorization: Bearer TOKEN"
```

**Respuesta Esperada (Carta #52):**
```json
{
  "message": "Última carta gritada - Partida finalizada sin ganador",
  "carta": 52,
  "partida": {...},
  "partidaFinalizada": true,
  "sinGanador": true
}
```

### Caso 4: Estadísticas de Partida
```bash
curl -X GET http://localhost:3333/juego/1/estadisticas \
  -H "Authorization: Bearer TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "estadisticas": {
    "partida": {
      "id": 1,
      "nombre": "Partida Test",
      "estado": "en_curso",
      "cartasGritadas": 25,
      "totalCartas": 52,
      "cartasRestantes": 27,
      "cartaActual": 42,
      "ganadorId": null
    },
    "jugadores": [
      {
        "id": 1,
        "nombre": "Juan",
        "email": "juan@test.com",
        "fichasColocadas": 8,
        "estado": "jugando",
        "esGanador": false,
        "estaEliminado": false
      }
    ],
    "resumen": {
      "jugadoresJugando": 3,
      "jugadoresEliminados": 1,
      "jugadoresGanadores": 0
    }
  }
}
```

### Caso 5: Quitar Ficha
```bash
curl -X DELETE http://localhost:3333/juego/1/ficha \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"posicion": 5}'
```

**Respuesta Esperada:**
```json
{
  "message": "Ficha removida correctamente",
  "fichas": [1, 2, 3, 4, 6, 7, 8]
}
```

### Caso 6: Jugador Eliminado Intenta Jugar
```bash
# Intentar colocar ficha cuando el jugador ya está eliminado
curl -X POST http://localhost:3333/juego/1/ficha \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"posicion": 10}'
```

**Respuesta Esperada (Error 400):**
```json
{
  "message": "Ya fuiste eliminado de esta partida y no puedes colocar más fichas"
}
```

## Verificación del Sistema

### ✅ Validaciones Implementadas
1. **Validación automática al completar 16 fichas**
2. **Finalización automática al agotar las 52 cartas**
3. **Bloqueo de jugadores eliminados**
4. **Estados correctos de jugadores** (jugando, eliminado, ganador)
5. **Estadísticas en tiempo real**
6. **Funcionalidad para corregir errores** (quitar fichas)

### 🔄 Flujo de Estados
```
jugando → eliminado (al fallar validación)
jugando → ganador (al ganar validación)
eliminado → [BLOQUEADO] (no puede seguir jugando)
ganador → [PARTIDA FINALIZADA]
```

### 🎯 Condiciones de Victoria
- ✅ 16 fichas colocadas
- ✅ Todas las cartas del jugador han sido gritadas
- ✅ Partida en estado 'en_curso'

### 🚫 Condiciones de Eliminación
- ❌ 16 fichas colocadas
- ❌ Al menos una carta no fue gritada
- ❌ Jugador marcado como 'eliminado'

### 🏁 Condiciones de Final sin Ganador
- 🔚 52 cartas gritadas
- 🔚 Ningún jugador logró completar su cartón correctamente
- 🔚 Todos los jugadores marcados como 'eliminado'
