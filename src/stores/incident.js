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
        `SELECT DISTINCT H.PHCLIE, H.PHNOMC, H.PHUSAP, H.PHPVTA, H.PHNUME,
                D.PDGUIA, D.PDFECG, D.PDTDOC, D.PDFABO, D.PDFECF, H.PHREF1,
                TH.PHMONE, TH.PHNVVA, TH.PHEVVA, TH.PHFEIN
         FROM SPEED400CS.TPEDH H
         INNER JOIN SPEED400CS.TPEDD D ON H.PHPVTA = D.PDPVTA AND H.PHNUME = D.PDNUME
         LEFT JOIN SPEED400CS.TCOTD T ON D.PDSCOT = T.PDPVTA AND D.PDNCOT = T.PDNUME AND D.PDSECC = T.PDSECU
         LEFT JOIN SPEED400CS.TCOTH TH ON TH.PHPVTA = T.PDPVTA AND TH.PHNUME = T.PDNUME
         WHERE H.PHPVTA = ? AND H.PHNUME = ?`,
        [serie, correlativo]
      )
      if (rows.length === 0) return { ok: false, error: 'Pedido no encontrado' }
      return { ok: true, data: rows[0] }
    },
    async searchPedidoDetalle(serie, correlativo) {
      const data = await this._query(
        `SELECT D.PDARTI, A.ARTDES, D.PDCANT, D.PDUNIT, A.ARTMAR, A.ARTABC, A.ARTMED,
                C.REQNRO AS VALE, C.REGCAN AS CANTREQ
         FROM SPEED400CS.TPEDD D
         INNER JOIN SPEED400CS.TARTI A ON A.ARTCOD = D.PDARTI
         LEFT JOIN SPEED400CS.TCOTD T ON D.PDSCOT = T.PDPVTA AND D.PDNCOT = T.PDNUME AND D.PDSECC = T.PDSECU
         LEFT JOIN SPEED400CS.CREQD C ON T.PDPVTA = C.REGSCT AND T.PDNUME = C.REGNCT AND T.PDSECU = C.REGSCU
         WHERE D.PDPVTA = ? AND D.PDNUME = ?`,
        [serie, correlativo]
      )
      return { ok: true, data }
    },
    async searchVale(almacen, vale, ejercicio, periodo) {
      const rows = await this._query(
        `SELECT MHALMA, MHCOMP, MHEJER, MHPERI, MHREF3, MHFECH, MHUSER, MHHRE1
         FROM SPEED400CS.TMOVH
         WHERE MHALMA = ? AND MHCOMP = ? AND MHEJER = ? AND MHPERI = ?`,
        [almacen, vale, ejercicio, periodo]
      )
      if (rows.length === 0) return { ok: false, error: 'Vale no encontrado' }
      return { ok: true, data: rows[0] }
    },
    async searchValeDetalle(almacen, vale, ejercicio, periodo) {
      const data = await this._query(
        `SELECT MDCOAR, ARTDES, MDCANR, MDUMER, ARTMAR, MDCUNA, ARTABC
         FROM SPEED400CS.TMOVD
         INNER JOIN SPEED400CS.TARTI ON MDCOAR = ARTCOD
         WHERE MDALMA = ? AND MDCOMP = ? AND MDEJER = ? AND MDPERI = ?`,
        [almacen, vale, ejercicio, periodo]
      )
      return { ok: true, data }
    },

    // ── PAGINADO ──────────────────────────────────────────────────────────
    async contarIncidencias(filtros) {
      let sql = "SELECT COUNT(*) AS TOTAL FROM (SELECT DISTINCT H.ID FROM CLS.TINCIDENCIAH H LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO LEFT JOIN SPEED400CS.TPEDH P ON H.PHPVTA = P.PHPVTA AND H.PHNUME = P.PHNUME LEFT JOIN SPEED400CS.TPEDD D ON H.PHPVTA = D.PDPVTA AND H.PHNUME = D.PDNUME WHERE H.ESTADOINCD NOT IN ('3', '99')"
      const params = []
      sql = this._aplicarFiltros(sql, params, filtros)
      sql += ') T'
      const rows = await this._query(sql, params)
      return rows[0]?.TOTAL || 0
    },

    async listarIncidencias(filtros, pagina = 1, porPagina = 50) {
      let sql = "SELECT DISTINCT H.*, TP.DESCTIPO FROM CLS.TINCIDENCIAH H LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO LEFT JOIN SPEED400CS.TPEDH P ON H.PHPVTA = P.PHPVTA AND H.PHNUME = P.PHNUME LEFT JOIN SPEED400CS.TPEDD D ON H.PHPVTA = D.PDPVTA AND H.PHNUME = D.PDNUME WHERE H.ESTADOINCD NOT IN ('3', '99')"
      const params = []
      sql = this._aplicarFiltros(sql, params, filtros)
      sql += ' ORDER BY H.ID DESC'

      const offset = (pagina - 1) * porPagina
      sql += ` OFFSET ${offset} ROWS FETCH NEXT ${porPagina} ROWS ONLY`

      return await this._query(sql, params)
    },

    _aplicarFiltros(sql, params, filtros) {
      if (filtros.nroIncd)    { sql += ' AND H.ID = ?';                params.push(filtros.nroIncd) }
      if (filtros.codVend)    { sql += ' AND H.CODVEND = ?';           params.push(filtros.codVend) }
      if (filtros.codCli)     { sql += ' AND H.CODCLI = ?';            params.push(filtros.codCli) }
      if (filtros.tipoInc)    { sql += ' AND H.TIPINCD = ?';           params.push(filtros.tipoInc) }
      if (filtros.estado)     { sql += ' AND H.ESTADOINCD = ?';        params.push(filtros.estado) }
      if (filtros.usuario)    { sql += ' AND H.USUARIOCREA = ?';       params.push(filtros.usuario) }
      if (filtros.responsable) { sql += ' AND H.USRENC = ?';            params.push(filtros.responsable) }
      if (filtros.pedidoSerie) { sql += ' AND H.PHPVTA = ?';           params.push(filtros.pedidoSerie) }
      if (filtros.pedidoNro)  { sql += ' AND H.PHNUME = ?';            params.push(filtros.pedidoNro) }
      if (filtros.guia)       { sql += ' AND D.PDGUIA = ?';            params.push(filtros.guia) }
      if (filtros.oc)         { sql += ' AND P.PHREF1 = ?';            params.push(filtros.oc) }
      if (filtros.factura)    { sql += " AND (CAST(D.PDTDOC AS VARCHAR(10)) LIKE ? OR CAST(D.PDFABO AS VARCHAR(20)) LIKE ?)"; params.push(`%${filtros.factura}%`, `%${filtros.factura}%`) }
      if (filtros.desde && filtros.hasta) { sql += ' AND H.FECHAINCID >= ? AND H.FECHAINCID <= ?'; params.push(filtros.desde, filtros.hasta) }
      const sinFiltros = !filtros.nroIncd && !filtros.codVend && !filtros.codCli && !filtros.tipoInc && !filtros.estado && !filtros.usuario && !filtros.responsable && !filtros.desde && !filtros.pedidoSerie && !filtros.pedidoNro && !filtros.guia && !filtros.oc && !filtros.factura
      if (sinFiltros) {
        sql += " AND SUBSTR(CHAR(H.FECHAINCID), 5, 2) = SUBSTR(CHAR(CURRENT DATE, ISO), 6, 2) AND SUBSTR(CHAR(H.FECHAINCID), 1, 4) = SUBSTR(CHAR(CURRENT DATE, ISO), 1, 4)"
      }
      return sql
    },
    // ─────────────────────────────────────────────────────────────────────

    async visualizar(id) {
      const query = `SELECT DISTINCT
       H.ID, H.CANAL, H.CODVEND, H.CODCLI, H.PHPVTA, H.PHNUME,
       H.FECHAINCID, H.MONTDEV, H.MONEDA, H.NOMCONTACTO, H.NUMTLFO,
       H.DIRECCONT, H.EMAILCONT, H.COMENTARIO, H.TIPINCD, H.ESTADOINCD,
       H.USUARIOCREA, H.FECHACREA, H.EJERCICIO, H.PERIODO, H.ALMACEN, H.VALE,
       H.USUARIOREG, H.FECHCIERRE, H.MOTCIERRE, H.USUARIOMOD, H.FECHAMOD,
       H.TIPINCDREAL, H.USRENC,
       C.CLINOM AS CLINOM, V.AGENOM AS AGENOM, TP.DESCTIPO AS DESCTIPO,
       P.PHREF1,
       D.PDGUIA, D.PDFECG, D.PDTDOC, D.PDFABO, D.PDFECF,
       TH.PHFEIN, TH.PHNVVA, TH.PHEVVA,
       M.MHREF3, M.MHFECH, M.MHUSER
       FROM CLS.TINCIDENCIAH H
       LEFT JOIN SPEED400CS.TCLIE C ON C.CLICVE = H.CODCLI
       LEFT JOIN SPEED400CS.TAGEN V ON H.CODVEND = V.AGECVE
       LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO
       LEFT JOIN SPEED400CS.TPEDH P ON P.PHPVTA = H.PHPVTA AND P.PHNUME = H.PHNUME
       LEFT JOIN SPEED400CS.TPEDD D ON P.PHPVTA = D.PDPVTA AND P.PHNUME = D.PDNUME
       LEFT JOIN SPEED400CS.TCOTD T ON D.PDSCOT = T.PDPVTA AND D.PDNCOT = T.PDNUME AND D.PDSECC = T.PDSECU
       LEFT JOIN SPEED400CS.TCOTH TH ON TH.PHPVTA = T.PDPVTA AND TH.PHNUME = T.PDNUME
       LEFT JOIN SPEED400CS.TMOVH M ON M.MHCOMP = H.VALE AND M.MHALMA = H.ALMACEN AND M.MHEJER = H.EJERCICIO AND M.MHPERI = H.PERIODO
       WHERE H.ID = ?`
      const rows = await this._query(query, [id])
      const details = await this._query(
        `SELECT D.*, A.ARTDES FROM CLS.TINCIDENCIAD D
         LEFT JOIN SPEED400CS.TARTI A ON A.ARTCOD = D.CODPROD
         WHERE D.ID_INDH = ?`, [id]
      )
      return { header: rows[0], details }
    },
    async visualizarRpta(id) {
      const rows = await this._query(
        `SELECT H.TIPINCDREAL, H.FECHCIERRE, H.USUARIOMOD, H.MOTCIERRE, TP.DESCTIPO
         FROM CLS.TINCIDENCIAH H
         LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCDREAL = TP.IDTIPO
         WHERE H.ID = ?`, [id]
      )
      return rows[0] || {}
    },
    async registrarCabecera(body) {
      await this._query(
        `INSERT INTO CLS.TINCIDENCIAH (CANAL, CODVEND, CODCLI, PHPVTA, PHNUME, FECHAINCID, MONTDEV, MONEDA, NOMCONTACTO, NUMTLFO, DIRECCONT, EMAILCONT, COMENTARIO, TIPINCD, ESTADOINCD, USUARIOCREA, FECHACREA, USRENC, EJERCICIO, PERIODO, ALMACEN, VALE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '22', ?, TO_CHAR(CURRENT DATE, 'YYYYMMDD'), ?, ?, ?, ?, ?)`,
        [body.canal, body.codvend, body.codcli, body.phpvta, body.phnume, body.fechaincid, body.montdev, body.moneda, body.nomcontacto, body.numtlfo, body.direccontact, body.emailcontact, body.comentario, body.tipincd, body.usuariocrea, body.usrenc, body.ejercicio, body.periodo, body.almacen, body.vale]
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
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '21', TIPINCDREAL = ?, MOTCIERRE = ?, FECHCIERRE = ?, USUARIOMOD = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE ID = ?",
        [body.tipo, body.motivo, body.fecha, body.usuario, body.id]
      )
      return { ok: true }
    },
    async eliminarIncidencia(id, usuario) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '99', USUARIOMOD = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE ID = ?",
        [usuario, id]
      )
      return { ok: true }
    },
    async asignarResponsable(id, usrenc, usuario) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET USRENC = ?, USUARIOMOD = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE ID = ?",
        [usrenc, usuario, id]
      )
      return { ok: true }
    }
  }
})