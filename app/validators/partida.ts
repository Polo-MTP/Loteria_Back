import vine from '@vinejs/vine'

export const createPartidaValidator = vine.compile(
  vine.object({
    nombre: vine.string().minLength(2).maxLength(100),                    
    max_jugadores: vine.number().min(2).max(16),
    carta_actual: vine.number().optional(),            
    cartas_gritadas: vine.array(vine.number()).optional() 
  })
)