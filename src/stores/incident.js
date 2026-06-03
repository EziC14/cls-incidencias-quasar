import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useIncidentStore = defineStore('incident', {
  state: () => ({
    tipos: [],
    tiposCierre: [],
    usuarios: [],
    currentIncident: null,
    currentDetails: []
  }),
  actions: {
    async _query(sql, params) {
      const auth = useAuthStore()
      return await window.electronAPI.dbQuery(sql, params || [], auth.usuario, auth.clave)
    },
    async loadTipos() {
      this.tipos = await this._query(
        "SELECT * FROM CLS.TINCIDTIPO WHERE ESTADO = 1 AND TIPO = 'A' ORDER BY IDTIPO"
      )
    },
    async loadTiposCierre() {
      this.tiposCierre = await this._query(
        "SELECT * FROM CLS.TINCIDTIPO WHERE ESTADO = 3 AND TIPO = 'C' ORDER BY IDTIPO"
      )
    },
    async loadUsuarios() {
      const rows = await this._query(
        "SELECT DISTINCT USUARIOCREA FROM CLS.TINCIDENCIAH ORDER BY USUARIOCREA"
      )
      this.usuarios = rows.map(r => r.USUARIOCREA)
    },
    async searchPedido(serie, correlativo) {
      const rows = await this._query(
        "SELECT * FROM SPEED400CS.TPEDH WHERE PHCIRS = ? AND PHNUME = ?",
        [serie, correlativo]
      )
      if (rows.length === 0) return { ok: false, error: 'Pedido no encontrado' }
      return { ok: true, data: rows[0] }
    },
    async searchPedidoDetalle(serie, correlativo) {
      const data = await this._query(
        "SELECT * FROM SPEED400CS.TPEDD WHERE PDCIRS = ? AND PDNUME = ?",
        [serie, correlativo]
      )
      return { ok: true, data }
    },
    async searchVale(almacen, vale, ejercicio, periodo) {
      const rows = await this._query(
        "SELECT * FROM SPEED400CS.TMOVH WHERE MHALMA = ? AND MHNUDO = ? AND MHEJER = ? AND MHPERI = ?",
        [almacen, vale, ejercicio, periodo]
      )
      if (rows.length === 0) return { ok: false, error: 'Vale no encontrado' }
      return { ok: true, data: rows[0] }
    },
    async searchValeDetalle(almacen, vale, ejercicio, periodo) {
      const data = await this._query(
        "SELECT * FROM SPEED400CS.TMOVD WHERE MDALMA = ? AND MDNUDO = ? AND MDEJER = ? AND MDPERI = ?",
        [almacen, vale, ejercicio, periodo]
      )
      return { ok: true, data }
    },
    async listarIncidencias(filtros) {
      let sql = "SELECT * FROM CLS.TINCIDENCIAH WHERE ESTADOINCD NOT IN ('3', '99')"
      const params = []
      if (filtros.nroIncd) { sql += ' AND ID = ?'; params.push(filtros.nroIncd) }
      if (filtros.codVend) { sql += ' AND CODVEND = ?'; params.push(filtros.codVend) }
      if (filtros.codCli) { sql += ' AND CODCLI = ?'; params.push(filtros.codCli) }
      if (filtros.tipoInc) { sql += ' AND TIPINCD = ?'; params.push(filtros.tipoInc) }
      if (filtros.estado) { sql += ' AND ESTADOINCD = ?'; params.push(filtros.estado) }
      if (filtros.usuario) { sql += ' AND USUARIOCREA = ?'; params.push(filtros.usuario) }
      if (filtros.desde && filtros.hasta) { sql += ' AND FECHAINCID >= ? AND FECHAINCID <= ?'; params.push(filtros.desde, filtros.hasta) }
      if (!filtros.nroIncd && !filtros.codVend && !filtros.codCli && !filtros.tipoInc && !filtros.estado && !filtros.usuario && !filtros.desde) {
        sql += " AND MONTH(FECHAINCID) = MONTH(CURRENT DATE) AND YEAR(FECHAINCID) = YEAR(CURRENT DATE)"
      }
      sql += ' ORDER BY ID DESC'
      return await this._query(sql, params)
    },
    async visualizar(id) {
      const rows = await this._query(
        "SELECT * FROM CLS.TINCIDENCIAH H LEFT JOIN CLS.TINCIDENCIAD D ON H.ID = D.ID_INDH WHERE H.ID = ?",
        [id]
      )
      return { header: rows[0], details: rows.filter(r => r.ITEMINCD) }
    },
    async visualizarRpta(id) {
      const rows = await this._query(
        "SELECT TIPINCDREAL, FECHCIERRE, USUARIOMOD, MOTCIERRE FROM CLS.TINCIDENCIAH WHERE ID = ?",
        [id]
      )
      return rows[0] || {}
    },
    async registrarCabecera(body) {
      await this._query(
        `INSERT INTO CLS.TINCIDENCIAH (CANAL, CODVEND, CODCLI, PHPVTA, PHNUME, FECHAINCID, MONTDEV, MONEDA, NOMCONTACTO, NUMTLFO, DIRECCONT, EMAILCONT, COMENTARIO, TIPINCD, ESTADOINCD, USUARIOCREA, FECHACREA, EJERCICIO, PERIODO, ALMACEN, VALE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '22', ?, CURRENT DATE, ?, ?, ?, ?)`,
        [body.canal, body.codvend, body.codcli, body.phpvta, body.phnume, body.fechaincid, body.montdev, body.moneda, body.nomcontacto, body.numtlfo, body.direccontact, body.emailcontact, body.comentario, body.tipincd, body.usuariocrea, body.ejercicio, body.periodo, body.almacen, body.vale]
      )
      return { ok: true }
    },
    async registrarDetalle(body) {
      await this._query(
        `INSERT INTO CLS.TINCIDENCIAD (ID_INDH, ITEMINCD, CODPROD, ARTABC, ARTMAR, PRECPROD, CANTDEV, ARTMED, VALE, CANTVALE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [body.id_indh, body.itemincd, body.codprod, body.artabc, body.artmar, body.precprod, body.cantdev, body.artmed, body.vale, body.cantvale]
      )
      return { ok: true }
    },
    async obtenerId(serie, correlativo, cod) {
      const rows = await this._query(
        "SELECT MAX(ID) AS ID FROM CLS.TINCIDENCIAH WHERE PHPVTA = ? AND PHNUME = ? AND CODCLI = ?",
        [serie, correlativo, cod]
      )
      return rows[0]?.ID || 0
    },
    async obtenerIdVale(ejercicio, periodo, alma, vale) {
      const rows = await this._query(
        "SELECT MAX(ID) AS ID FROM CLS.TINCIDENCIAH WHERE EJERCICIO = ? AND PERIODO = ? AND ALMACEN = ? AND VALE = ?",
        [ejercicio, periodo, alma, vale]
      )
      return rows[0]?.ID || 0
    },
    async cerrarIncidencia(body) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '21', TIPINCDREAL = ?, MOTCIERRE = ?, FECHCIERRE = ?, USUARIOMOD = ?, FECHAMOD = CURRENT DATE, TIPCIERRE = ? WHERE ID = ?",
        [body.tipo, body.motivo, body.fecha, body.usuario, body.tipcierre, body.id]
      )
      return { ok: true }
    },
    async eliminarIncidencia(id, usuario) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '99', USUARIOMOD = ?, FECHAMOD = CURRENT DATE WHERE ID = ?",
        [usuario, id]
      )
      return { ok: true }
    }
  }
})