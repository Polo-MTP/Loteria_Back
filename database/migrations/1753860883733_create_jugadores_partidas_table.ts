import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'jugadores_partidas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.bigInteger('partida_id').unsigned().references('id').inTable('partidas').onDelete('CASCADE')
      table.bigInteger('jugador_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.json('cartas').notNullable()
      table.json('fichas').notNullable()
      table.enum('estado', ['jugando', 'eliminado', 'ganador']).defaultTo('jugando')
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}