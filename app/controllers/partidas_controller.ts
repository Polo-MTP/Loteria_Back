import type { HttpContext } from '@adonisjs/core/http'
import Partida from '#models/partida'
import { createPartidaValidator } from '#validators/partida'
import JugadoresPartida from '#models/jugadores_partida'

export default class PartidasController {
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const payload = await request.validateUsing(createPartidaValidator)

      const partida = await Partida.create({
        nombre: payload.nombre,
        anfitrion_id: user.id,
        max_jugadores: payload.max_jugadores,
        estado: 'esperando',
        carta_actual: payload.carta_actual ?? null,
        cartas_gritadas: payload.cartas_gritadas ?? [],
      })

      return response.json({
        message: 'Partida creada exitosamente',
        partida: partida,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al crear partida',
        errors: error.messages || error.message,
      })
    }
  }

  async index({ response }: HttpContext) {
    try {
      const partidas = await Partida.query().where('estado', 'esperando').preload('anfitrion')

      return response.json({
        message: 'Listado de partidas exitosamente',
        partidas: partidas,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al listar partidas',
        errors: error.messages || error.message,
      })
    }
  }

  async unirse({ response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      const partida = await Partida.query()
        .where('id', partidaId)
        .where('estado', 'esperando')
        .preload('anfitrion')
        .preload('usuarios')
        .firstOrFail()

      const yaUnido = partida.usuarios.find((usuario) => usuario.id === user.id)

      if (yaUnido) {
        return response.status(400).json({
          message: 'Ya esta en la partida',
        })
      }

      if (partida.usuarios.length >= partida.max_jugadores) {
        return response.status(400).json({
          message: 'La partida ya esta llena',
        })
      }

      const cartasJugador = generarCarta(16)

      await partida.related('usuarios').attach({
        [user.id]: {
          cartas: JSON.stringify(cartasJugador),
          fichas: JSON.stringify([]),
        },
      })

      await partida.load('usuarios')

      if (partida.usuarios.length >= partida.max_jugadores) {
        partida.estado = 'en_curso'
        await partida.save()
      }

      return response.json({
        message: 'Unido exitosamente',
        partida: partida,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al unirse a la partida',
        errors: error.messages || error.message,
      })
    }
  }

  async showPartidaAnfitrion({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partida = await Partida.query()
        .where('id', params.id)
        .where('estado', 'esperando')
        .preload('anfitrion')
        .preload('usuarios')
        .firstOrFail()

      if (partida.anfitrion.id !== user.id) {
        return response.unauthorized({
          message: 'No tienes permisos para ver esta partida',
        })
      }

      return response.json({
        message: 'Partida cargadaexitosamente',
        partida: partida,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener la partida',
        errors: error.messages || error.message,
      })
    }
  }

  async showPartidaJugador({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partida = await Partida.query().where('id', params.id).preload('usuarios').firstOrFail()

      const estaEnPartida = partida.usuarios.some((u) => u.id === user.id)

      if (!estaEnPartida) {
        return response.unauthorized({
          message: 'No estás unido a esta partida',
        })
      }

      return response.json({
        message: 'Partida cargada exitosamente',
        partida: partida,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener la partida',
        errors: error.messages || error.message,
      })
    }
  }

  async verificarEstadoPartida({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partida = await Partida.query()
        .where('id', params.id)
        .preload('usuarios')
        .preload('anfitrion')
        .firstOrFail()

      const esParticipante = partida.usuarios.some((u) => u.id === user.id)
      const esAnfitrion = partida.anfitrion_id === user.id

      if (!esParticipante && !esAnfitrion) {
        return response.status(403).json({
          message: 'No tienes permiso para ver esta partida',
        })
      }

      return response.json({
        message: 'Estado de la partida exitosamente',
        estado: partida.estado,
        jugadores_actuales: partida.usuarios.length,
        max_jugadores: partida.max_jugadores,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al verificar estado de la partida',
        error: error.message,
      })
    }
  }

  async gritarCarta({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partida = await Partida.query()
        .where('id', params.id)
        .preload('anfitrion')
        .firstOrFail()

      if (partida.anfitrion.id !== user.id) {
        return response.status(403).json({
          message: 'No tienes permiso para gritar carta',
        })
      }

      if (partida.estado !== 'en_curso') {
        return response.status(400).json({
          message: 'La partida no esta en curso',
        })
      }

      const cartasGritadas = partida.cartas_gritadas
      const mazoCompleto = Array.from({ length: 52 }, (_, i) => i + 1)
      const disponibles = mazoCompleto.filter((carta) => !cartasGritadas.includes(carta))

      if (disponibles.length === 0) {
        return response.status(400).json({
          message: 'No hay cartas disponibles',
        })
      }

      const cartaAleatoria = disponibles[Math.floor(Math.random() * disponibles.length)]

      partida.cartas_gritadas = [...cartasGritadas, cartaAleatoria]
      partida.carta_actual = cartaAleatoria
      await partida.save()

      return response.json({
        message: 'Carta gritada exitosamente',
        carta: cartaAleatoria,
        partida: partida,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al gritar carta',
        error: error.message,
      })
    }
  }

  async showJuegoAnfitrion({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partida = await Partida.query()
        .where('id', params.id)
        .preload('anfitrion')
        .preload('usuarios')
        .firstOrFail()

      if (partida.anfitrion.id !== user.id) {
        return response.unauthorized({
          message: 'No tienes permisos para ver esta partida',
        })
      }

      // Obtener las fichas de cada jugador
      const jugadores = await JugadoresPartida.query()
        .where('partida_id', params.id)
        .preload('usuario')

      const usuariosConFichas = jugadores.map(jugador => ({
        ...jugador.usuario.$attributes,
        cartas: jugador.cartas,
        fichas: jugador.fichas
      }))

      const partidaCompleta = {
        ...partida.$attributes,
        anfitrion: partida.anfitrion,
        usuarios: usuariosConFichas
      }

      return response.json({
        message: 'Partida en curso cargada correctamente',
        partida: partidaCompleta,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al cargar la partida en curso',
        errors: error.messages || error.message,
      })
    }
  }

  async showCartaPartida({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      const jugadorPartida = await JugadoresPartida.query()
        .from('jugadores_partidas')
        .where('partida_id', partidaId)
        .andWhere('jugador_id', user.id)
        .first()

      if (!jugadorPartida) {
        return response.status(404).json({
          message: 'No estás registrado en esta partida',
        })
      }

      return response.json({
        cartas: jugadorPartida.cartas ?? [],
        posiciones: jugadorPartida.fichas ?? [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener la carta',
        errors: error.messages || error.message,
      })
    }
  }

  async sincronizarJugador({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      // Verificar que el jugador esté en la partida
      const jugadorPartida = await JugadoresPartida.query()
        .where('partida_id', partidaId)
        .andWhere('jugador_id', user.id)
        .first()

      if (!jugadorPartida) {
        return response.status(404).json({
          message: 'No estás registrado en esta partida',
        })
      }

      // Obtener información actualizada de la partida
      const partida = await Partida.find(partidaId)
      if (!partida) {
        return response.status(404).json({
          message: 'Partida no encontrada',
        })
      }

      return response.json({
        success: true,
        partida: {
          estado: partida.estado,
          cartaActual: partida.carta_actual,
          cartasGritadas: partida.cartas_gritadas,
          ganadorId: partida.ganador_id
        },
        jugador: {
          cartas: jugadorPartida.cartas,
          fichas: jugadorPartida.fichas
        }
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al sincronizar datos',
        errors: error.messages || error.message,
      })
    }
  }

  async colocarFicha({ request, response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id
      const { posicion } = request.only(['posicion'])

      const jugadorPartida = await JugadoresPartida.query()
        .where('partida_id', partidaId)
        .andWhere('jugador_id', user.id)
        .first()

      if (!jugadorPartida) {
        return response.status(404).json({
          message: 'No estás registrado en esta partida',
        })
      }

      const partida = await Partida.find(partidaId)
      if (!partida || partida.estado !== 'en_curso') {
        return response.status(400).json({
          message: 'La partida no está en curso',
        })
      }

      // Verificar que la posición tenga una carta que haya sido gritada
      const cartaEnPosicion = jugadorPartida.cartas[posicion]
      if (!partida.cartas_gritadas.includes(cartaEnPosicion)) {
        return response.status(400).json({
          message: 'No puedes colocar ficha en una carta que no ha sido gritada',
        })
      }

      // Agregar la ficha si no está ya colocada
      const fichasActuales = jugadorPartida.fichas || []
      if (!fichasActuales.includes(posicion)) {
        fichasActuales.push(posicion)
        jugadorPartida.fichas = fichasActuales
        await jugadorPartida.save()
      }

      return response.json({
        message: 'Ficha colocada correctamente',
        fichas: jugadorPartida.fichas,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al colocar ficha',
        errors: error.messages || error.message,
      })
    }
  }

  async obtenerUltimosDatos({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      const partida = await Partida.query()
        .where('id', partidaId)
        .preload('ganador')
        .first()

      if (!partida) {
        return response.status(404).json({
          message: 'Partida no encontrada',
        })
      }

      const yaHayGanador = partida.estado === 'finalizado' && partida.ganador_id !== null
      const tuEresElGanador = yaHayGanador && partida.ganador_id === user.id

      return response.json({
        success: true,
        yaHayGanador,
        ganadorId: partida.ganador_id || 0,
        tuEresElGanador,
        ultimaCarta: partida.carta_actual || 0,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener últimos datos',
        errors: error.messages || error.message,
      })
    }
  }

  async validarCarta({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      const jugadorPartida = await JugadoresPartida.query()
        .where('partida_id', partidaId)
        .andWhere('jugador_id', user.id)
        .first()

      if (!jugadorPartida) {
        return response.status(404).json({
          message: 'No estás registrado en esta partida',
        })
      }

      const partida = await Partida.find(partidaId)
      if (!partida) {
        return response.status(404).json({
          message: 'Partida no encontrada',
        })
      }

      // Verificar si el jugador tiene todas las fichas (16 posiciones)
      const fichasColocadas = jugadorPartida.fichas || []
      const esGanador = fichasColocadas.length === 16

      if (esGanador && partida.estado === 'en_curso') {
        partida.estado = 'finalizado'
        partida.ganador_id = user.id
        await partida.save()

        return response.json({
          ganador: true,
          message: '¡Felicidades! Has ganado la partida',
        })
      }

      return response.json({
        ganador: false,
        message: 'Aún no has completado tu cartón',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al validar carta',
        errors: error.messages || error.message,
      })
    }
  }

  async misPartidas({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const partidas = await Partida.query()
        .where('anfitrion_id', user.id)
        .orWhereHas('usuarios', (query) => {
          query.where('jugador_id', user.id)
        })
        .preload('anfitrion')
        .orderBy('created_at', 'desc')

      return response.json({
        message: 'Mis partidas obtenidas exitosamente',
        partidas,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener mis partidas',
        errors: error.messages || error.message,
      })
    }
  }

  async salirPartida({ response, params, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const partidaId = params.id

      const partida = await Partida.query()
        .where('id', partidaId)
        .where('estado', 'esperando')
        .first()

      if (!partida) {
        return response.status(404).json({
          message: 'Partida no encontrada o ya comenzó',
        })
      }

      // Eliminar al jugador de la partida
      await partida.related('usuarios').detach([user.id])

      return response.json({
        message: 'Has salido de la partida exitosamente',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al salir de la partida',
        errors: error.messages || error.message,
      })
    }
  }
}

function generarCarta(cantidad: number): number[] {
  const baraja = Array.from({ length: 52 }, (_, i) => i + 1)
  const cartas: number[] = []

  while (cartas.length < cantidad) {
    const index = Math.floor(Math.random() * baraja.length)
    const carta = baraja.splice(index, 1)[0]
    cartas.push(carta)
  }

  return cartas
}
