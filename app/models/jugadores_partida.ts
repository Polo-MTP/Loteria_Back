import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class JugadoresPartida extends BaseModel {
  @column({ isPrimary: true })
  declare id: number


  @column()
  declare jugador_id: number

  @column()
  declare partida_id: number

  @column({
    prepare: (value: number[] | number)=> {
      if (Array.isArray(value)) {
        return JSON.stringify(value)
      }
      return value
    },
    consume: (value: string) => {
      try {
        return typeof value === 'string' ? JSON.parse(value) : value || []
      } catch (error) {
        return []
      }
    }
  })
  declare cartas: number[]

  @column({
    prepare: (value: number[] | number)=> {
      if (Array.isArray(value)) {
        return JSON.stringify(value)
      }
      return value
    },
    consume: (value: string) => {
      try {
        return typeof value === 'string' ? JSON.parse(value) : value || []
      } catch (error) {
        return []
      }
    }
  })
  declare fichas: number[]

  @column()
  declare estado: 'jugando' | 'eliminado' | 'ganador'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //relaciones

  @belongsTo(() => User, {foreignKey: 'jugador_id'})
  declare usuario: BelongsTo< typeof User>

  @belongsTo(() => User, {foreignKey: 'partida_id'})
  declare partida: BelongsTo< typeof User>

}