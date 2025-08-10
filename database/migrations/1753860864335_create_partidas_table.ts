import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'partidas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('nombre').notNullable()
      table.bigInteger('anfitrion_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.bigInteger('ganador_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable()
      table.enum('estado', ['esperando','finalizado', 'en_curso'])
      table.integer('max_jugadores').notNullable()
      table.integer('carta_actual').nullable()
      table.json('cartas_gritadas').notNullable()
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}