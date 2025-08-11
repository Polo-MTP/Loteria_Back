# Mecánica Automática de Lotería

## Resumen
Se ha implementado una mecánica automática donde:
1. Los jugadores pueden colocar fichas libremente sin restricciones
2. Al colocar la ficha #16, se ejecuta automáticamente la validación de lotería
3. Si se agotan las 52 cartas sin ganador, la partida finaliza sin ganador

## Funcionamiento

### Colocar Fichas (Automático)
- **Endpoint**: `POST /juego/:id/ficha`
- El jugador puede colocar cualquier ficha cuando quiera
- No se valida si la carta fue gritada previamente
- Al colocar la ficha #16:
  - **Si todas las cartas del jugador fueron gritadas**: ¡GANA! 🎉
  - **Si alguna carta no fue gritada**: Se elimina automáticamente ❌

### Estados del Jugador
- `jugando`: Estado inicial, puede participar normalmente
- `eliminado`: Fue eliminado, no puede colocar más fichas ni ganar
- `ganador`: Ganó la partida

### Fin de Juego Automático
1. **Ganador por fichas completas**: Cuando un jugador coloca las 16 fichas y todas sus cartas fueron gritadas
2. **Sin ganador**: Cuando se gritaron las 52 cartas y nadie logró completar correctamente su cartón

## Respuestas de la API

### Colocar Ficha Normal
```json
{
  "message": "Ficha colocada correctamente",
  "fichas": [1, 2, 3, ...]
}
```

### Colocar Ficha #16 - Ganador
```json
{
  "message": "¡Felicidades! ¡LOTERÍA! Has ganado la partida",
  "fichas": [1, 2, 3, ..., 16],
  "eliminado": false,
  "ganador": true
}
```

### Colocar Ficha #16 - Eliminado
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

### Gritar Carta - Fin Sin Ganador
```json
{
  "message": "Última carta gritada - Partida finalizada sin ganador",
  "carta": 52,
  "partida": {...},
  "partidaFinalizada": true,
  "sinGanador": true
}
```

## Cambios en Base de Datos
- Nuevo campo `estado` en tabla `jugadores_partidas`
- Valores posibles: `'jugando'`, `'eliminado'`, `'ganador'`
- Valor por defecto: `'jugando'`

## Endpoints Implementados

### 🎮 Gestión de Fichas
- `POST /juego/:id/ficha` - Colocar ficha (con validación automática en ficha #16)
- `DELETE /juego/:id/ficha` - Quitar ficha (para corregir errores)

### 📊 Información y Estado
- `GET /juego/:id/sync` - Sincronizar estado del jugador y partida
- `GET /juego/:id/estadisticas` - Estadísticas completas de la partida
- `GET /juego/:id/carta` - Obtener cartas y fichas del jugador
- `GET /juego/:id/ganador` - Obtener información del ganador

### 🎯 Funcionalidad de Juego
- `POST /gritar-carta/:id` - Gritar carta (con finalización automática en carta #52)
- `POST /juego/:id/cantar-loteria` - Método manual de cantar lotería (backup)
- `POST /partida/:id/finalizar-sin-ganador` - Finalizar partida manualmente (solo anfitrión)

### 👥 Gestión de Partidas
- `GET /partidas` - Listar partidas disponibles
- `POST /partidas` - Crear nueva partida
- `POST /partidas/:id/unirse` - Unirse a partida
- `GET /partidas/user` - Mis partidas
- `DELETE /partida/:id/salir` - Salir de partida (solo en espera)
