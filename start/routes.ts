import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'


const AuthController = () => import('../app/controllers/auth_controller.js')
const PartidaController = () => import('../app/controllers/partidas_controller.js')


router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  router.get('/me', [AuthController, 'me']).use(middleware.auth())
}).prefix('/auth')

router.group(() => {
  router.get('/partidas', [PartidaController, 'index'])
  router.post('/partidas', [PartidaController, 'create'])
  router.get('/partida/anfitrion/:id', [PartidaController, 'showPartidaAnfitrion'])
  router.get('/partida/jugador/:id', [PartidaController, 'showPartidaJugador'])
  router.get('/partida/verificar-estado/:id', [PartidaController, 'verificarEstadoPartida'])
  router.post('/partidas/:id/unirse', [PartidaController, 'unirse'])
  router.get('/juego/anfitrion/:id', [PartidaController, 'showJuegoAnfitrion'])
  router.post('/gritar-carta/:id', [PartidaController, 'gritarCarta'])
  router.get('/juego/:id/carta', [PartidaController, 'showCartaPartida'])
  router.get('/juego/:id/sync', [PartidaController, 'sincronizarJugador'])
  router.post('/juego/:id/ficha', [PartidaController, 'colocarFicha'])
  router.post('/juego/:id/cantar-loteria', [PartidaController, 'cantarLoteria'])
  router.get('/juego/:id/ganador', [PartidaController, 'obtenerUltimosDatos'])
  router.get('/juego/:id/validar-carta', [PartidaController, 'validarCarta'])
  router.get('/partidas/user', [PartidaController, 'misPartidas'])
  router.delete('/partida/:id/salir', [PartidaController, 'salirPartida'])
}).use(middleware.auth())
