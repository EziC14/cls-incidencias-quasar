import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function (ctx) {
  return {
    css: ['app.scss'],
    extras: ['roboto-font', 'mdi-v7', 'fontawesome-v6'],
    framework: {
      iconSet: 'mdi-v7',
      lang: 'es',
      config: {
        dark: false,
        brand: {
          primary: '#D2E186',
          secondary: '#FB8159',
          accent: '#415111'
        }
      },
      plugins: ['Dialog', 'Notify', 'Loading', 'LocalStorage']
    },
    build: {
      target: { browser: 'es2022', node: 'es2022' },
      vueRouterMode: 'hash',
      publicPath: './'
    },
    devServer: {
      port: 9000
    },
    electron: {
      bundler: 'builder',
      builder: {
        appId: 'pe.lasirena.modulo-incidencias',
        productName: 'Módulo Incidencias',
        directories: {
          output: 'dist/electron'
        },
        win: {
          target: ['portable'],
          sign: false
        },
        nsis: {
          oneClick: false,
          perMachine: false,
          allowToChangeInstallationDirectory: true
        },
        portable: {
          requestExecutionLevel: 'user'
        }
      }
    }
  }
}


