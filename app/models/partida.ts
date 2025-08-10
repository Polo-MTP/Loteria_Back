import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import JugadoresPartida from './jugadores_partida.js'

export default class Partida extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column({ columnName : 'anfitrion_id' })
  declare anfitrion_id: number

  @column()
  declare estado: string

  @column()
  declare max_jugadores: number

  
  @column()
  declare ganador_id: number | null  

  @column()
  declare carta_actual: number | null

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
  declare cartas_gritadas: number[]
  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User , {foreignKey: 'anfitrion_id'})
  anfitrion!: BelongsTo< typeof User>

  @belongsTo(() => User , {foreignKey: 'ganador_id'})
  declare ganador: BelongsTo< typeof User>
  
  @hasMany(() => JugadoresPartida, {
    foreignKey: 'partida_id'
  })
  declare jugadores: HasMany< typeof JugadoresPartida>

  @manyToMany(() => User, {
    pivotTable: 'jugadores_partidas',
    localKey: 'id', 
    pivotForeignKey: 'partida_id',
    relatedKey: 'id',
    pivotRelatedForeignKey : 'jugador_id'
  })
  declare usuarios: ManyToMany< typeof User>
}