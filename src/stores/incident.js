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
      let sql = "SELECT COUNT(*) AS TOTAL FROM (SELECT DISTINCT H.ID FROM CLS.TINCIDENCIAH H LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO LEFT JOIN SPEED400CS.TPEDH P ON H.PHPVTA = P.PHPVTA AND H.PHNUME = P.PHNUME LEFT JOIN SPEED400CS.TPEDD D ON H.PHPVTA = D.PDPVTA AND H.PHNUME = D.PDNUME LEFT JOIN SPEED400CS.TCLIE C ON C.CLICVE = H.CODCLI WHERE H.ESTADOINCD NOT IN ('3', '99')"
      const params = []
      sql = this._aplicarFiltros(sql, params, filtros)
      sql += ') T'
      const rows = await this._query(sql, params)
      return rows[0]?.TOTAL || 0
    },

    async listarIncidencias(filtros, pagina = 1, porPagina = 50) {
      let sql = "SELECT DISTINCT H.*, TP.DESCTIPO, C.CLINOM FROM CLS.TINCIDENCIAH H LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO LEFT JOIN SPEED400CS.TPEDH P ON H.PHPVTA = P.PHPVTA AND H.PHNUME = P.PHNUME LEFT JOIN SPEED400CS.TPEDD D ON H.PHPVTA = D.PDPVTA AND H.PHNUME = D.PDNUME LEFT JOIN SPEED400CS.TCLIE C ON C.CLICVE = H.CODCLI WHERE H.ESTADOINCD NOT IN ('3', '99')"
      const params = []
      sql = this._aplicarFiltros(sql, params, filtros)
      sql += ' ORDER BY H.ID DESC'

      const offset = (pagina - 1) * porPagina
      sql += ` OFFSET ${offset} ROWS FETCH NEXT ${porPagina} ROWS ONLY`

      return await this._query(sql, params)
    },
    async exportarIncidencias(filtros) {
      const headers = await this.listarIncidencias(filtros, 1, 9999999)
      return headers
    },

    _aplicarFiltros(sql, params, filtros) {
      if (filtros.nroIncd)    { sql += ' AND H.ID = ?';                params.push(filtros.nroIncd) }
      if (filtros.codVend)    { sql += ' AND H.CODVEND = ?';           params.push(filtros.codVend) }
      if (filtros.codCli)     { sql += ' AND H.CODCLI = ?';            params.push(filtros.codCli) }
      if (filtros.tipoInc)    { sql += ' AND H.TIPINCD = ?';           params.push(filtros.tipoInc) }
      if (filtros.estado)     { sql += ' AND H.ESTADOINCD = ?';        params.push(filtros.estado) }
      if (filtros.usuario)    { sql += ' AND H.USUARIOCREA = ?';       params.push(filtros.usuario) }
      if (filtros.responsable === '__UNASSIGNED__') { sql += " AND (H.USRENC IS NULL OR H.USRENC = '')" }
      else if (filtros.responsable) { sql += ' AND H.USRENC = ?';            params.push(filtros.responsable) }
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
   TP2.DESCTIPO AS DESCTIPOCIERRE,
       P.PHREF1,
       D.PDGUIA, D.PDFECG, D.PDTDOC, D.PDFABO, D.PDFECF,
       TH.PHFEIN, TH.PHNVVA, TH.PHEVVA,
       M.MHREF3, M.MHFECH, M.MHUSER
       FROM CLS.TINCIDENCIAH H
       LEFT JOIN SPEED400CS.TCLIE C ON C.CLICVE = H.CODCLI
       LEFT JOIN SPEED400CS.TAGEN V ON H.CODVEND = V.AGECVE
       LEFT JOIN CLS.TINCIDTIPO TP ON H.TIPINCD = TP.IDTIPO
   LEFT JOIN CLS.TINCIDTIPO TP2 ON H.TIPINCDREAL = TP2.IDTIPO
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
      const t = (v, len) => (v == null ? '' : String(v)).slice(0, len)
      await this._query(
        `INSERT INTO CLS.TINCIDENCIAH (CANAL, CODVEND, CODCLI, PHPVTA, PHNUME, FECHAINCID, MONTDEV, MONEDA, NOMCONTACTO, NUMTLFO, DIRECCONT, EMAILCONT, COMENTARIO, TIPINCD, ESTADOINCD, USUARIOCREA, FECHACREA, USRENC, EJERCICIO, PERIODO, ALMACEN, VALE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '22', ?, TO_CHAR(CURRENT DATE, 'YYYYMMDD'), ?, ?, ?, ?, ?)`,
        [t(body.canal, 10), t(body.codvend, 20), t(body.codcli, 20), body.phpvta, body.phnume, body.fechaincid, body.montdev, t(body.moneda, 2), t(body.nomcontacto, 50), t(body.numtlfo, 20), t(body.direccontact, 100), t(body.emailcontact, 60), t(body.comentario, 200), t(body.tipincd, 10), t(body.usuariocrea, 20), t(body.usrenc, 20), body.ejercicio, body.periodo, t(body.almacen, 10), body.vale]
      )
      return { ok: true }
    },
    async registrarDetalle(body) {
      const t = (v, len) => (v == null ? '' : String(v)).slice(0, len)
      await this._query(
        `INSERT INTO CLS.TINCIDENCIAD (ID_INDH, ITEMINCD, CODPROD, ARTABC, ARTMAR, PRECPROD, CANTDEV, ARTMED, VALE, CANTVALE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [body.id_indh, body.itemincd, t(body.codprod, 20), t(body.artabc, 10), t(body.artmar, 20), body.precprod, body.cantdev, t(body.artmed, 10), body.vale, body.cantvale]
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
    async iniciarAtencion(id, usuario) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '26', USUARIOMOD = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE ID = ? AND ESTADOINCD = '22'",
        [usuario, id]
      )
      return { ok: true }
    },
    async reabrirIncidencia(id, usuario) {
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = '22', USUARIOMOD = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE ID = ? AND ESTADOINCD = '26'",
        [usuario, id]
      )
      return { ok: true }
    },
    async cerrarIncidencia(body) {
      const t = (v, len) => (v == null ? '' : String(v)).slice(0, len)
      await this._query(
        "UPDATE CLS.TINCIDENCIAH SET ESTADOINCD = ?, TIPINCDREAL = ?, MOTCIERRE = ?, FECHCIERRE = ?, USUARIOMOD = ?, FECHAMOD = ? WHERE ID = ?",
        [body.tipcierre, body.tipo, t(body.motivo, 200), body.fecha, t(body.usuario, 20), body.fecha, body.id]
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
    },
    async importarExcel(rows, usuarioReg, onProgress) {
      const auth = useAuthStore()
      let ok = 0, err = 0
      const errores = []

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const ped = await this.searchPedido(r.serie, r.correlativo)
        if (!ped.ok) {
          err++
          errores.push(`Fila ${i + 2}: ${ped.error}`)
          continue
        }
        const det = await this.searchPedidoDetalle(r.serie, r.correlativo)
        if (!det.ok || det.data.length === 0) {
          err++
          errores.push(`Fila ${i + 2}: Sin productos en pedido`)
          continue
        }
        const cab = ped.data
        const canal = cab.PHREF1 || ''
        const codvend = cab.PHUSAP || ''
        const codcli = cab.PHCLIE
        const moneda = cab.PHMONE === 'SOLES' ? '0' : '1'
        const fechaincid = (() => {
          const v = r.fecha
          if (v == null || v === '') return ''
          if (typeof v === 'number') {
            const d = new Date((v - 25569) * 86400 * 1000)
            if (!isNaN(d)) return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
          }
          const s = String(v).trim()
          if (/^\d{8}$/.test(s)) return s
          const m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/)
          if (m) return `${m[3]}${m[2]}${m[1]}`
          return s.replace(/\D/g, '')
        })()
        const monto = det.data.reduce((s, d) => s + (Number(d.PDCANT) || 0) * (Number(d.PDUNIT) || 0), 0)

        const autoResp = await this.buscarResponsable(codcli)

        try {
          await this.registrarCabecera({
            canal, codvend, codcli,
            phpvta: r.serie, phnume: r.correlativo,
            fechaincid, montdev: monto, moneda,
            nomcontacto: r.contacto, numtlfo: r.telefono,
            direccontact: r.direccion, emailcontact: r.email,
            comentario: r.motivo,
            tipincd: r.tipoIncidencia,
            usuariocrea: usuarioReg, usrenc: autoResp || '',
            ejercicio: 0, periodo: 0, almacen: '0', vale: 0
          })
        } catch (e) {
          err++
          errores.push(`Fila ${i + 2}: Error al registrar cabecera - ${e.message}`)
          continue
        }

        const id = await this.obtenerId(r.serie, r.correlativo, codcli)
        if (!id) {
          err++
          errores.push(`Fila ${i + 2}: Cabecera registrada pero no se obtuvo ID`)
          continue
        }

        let item = 0
        for (const d of det.data) {
          item++
          const producto = (d.COD_ARTICULO || d.PDARTI || '').toString().trim()
          const undmed = (d.ARTMED || d.PDUNIT || '').toString().trim()
          const marca = (d.ARTMAR || '').toString().trim()
          const categoria = (d.ARTABC || '').toString().trim()
          const precio = Number(d.PDUNIT || d.PRECIO || 0)
          const cantSolicitada = Number(d.PDCANT || 0)
          const vale = (d.VALE || '1').toString().trim() || '1'
          const cantvale = (d.CANTREQ || '1').toString().trim() || '1'

          try {
            await this.registrarDetalle({
              id_indh: id, itemincd: item, codprod: producto,
              artabc: categoria, artmar: marca,
              precprod: precio, cantdev: cantSolicitada,
              artmed: undmed, vale: Number(vale), cantvale: Number(cantvale)
            })
          } catch (e) {
            errores.push(`Fila ${i + 2} Item ${item}: Error registro detalle - ${e.message}`)
          }
        }
        ok++
        if (onProgress) onProgress(i + 1, rows.length, r.serie, r.correlativo)
      }
      return { ok, err, errores }
    },
    // ── Asignaciones Cliente→Responsable ──────────────────────────────────
    async listarAsignaciones() {
      return await this._query(
        `SELECT R.*, C.CLINOM
         FROM CLS.TCLI_RESP R
         LEFT JOIN SPEED400CS.TCLIE C ON C.CLICVE = R.CODCLI
         ORDER BY R.CODCLI`
      )
    },
    async buscarResponsable(codcli) {
      if (!codcli) return null
      const rows = await this._query(
        "SELECT USRENC FROM CLS.TCLI_RESP WHERE CODCLI = ?",
        [codcli]
      )
      return rows.length > 0 ? rows[0].USRENC : null
    },
    async guardarAsignacion(codcli, usrenc) {
      const exist = await this._query("SELECT COUNT(*) AS C FROM CLS.TCLI_RESP WHERE CODCLI = ?", [codcli])
      if (Number(exist[0].C) > 0) {
        await this._query(
          "UPDATE CLS.TCLI_RESP SET USRENC = ?, FECHAMOD = TO_CHAR(CURRENT DATE, 'YYYYMMDD') WHERE CODCLI = ?",
          [usrenc, codcli]
        )
      } else {
        await this._query(
          "INSERT INTO CLS.TCLI_RESP (CODCLI, USRENC, FECHAMOD) VALUES (?, ?, TO_CHAR(CURRENT DATE, 'YYYYMMDD'))",
          [codcli, usrenc]
        )
      }
      return { ok: true }
    },
    async eliminarAsignacion(codcli) {
      await this._query("DELETE FROM CLS.TCLI_RESP WHERE CODCLI = ?", [codcli])
      return { ok: true }
    },
    async importarAsignaciones(rows, onProgress) {
      let ok = 0, err = 0
      const errores = []
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        try {
          if (!r.codcli || !r.usrenc) {
            err++; errores.push(`Fila ${i+2}: CODCLI y USRENC requeridos`); continue
          }
          const existe = await this._query("SELECT COUNT(*) AS C FROM SPEED400CS.TCLIE WHERE CLICVE = ?", [r.codcli])
          if (Number(existe[0].C) === 0) {
            err++; errores.push(`Fila ${i+2}: Cliente ${r.codcli} no existe en TCLIE`); continue
          }
          await this.guardarAsignacion(r.codcli, r.usrenc)
          ok++
        } catch (e) {
          err++; errores.push(`Fila ${i+2}: ${e.message}`)
        }
        if (onProgress) onProgress(i + 1, rows.length)
      }
      return { ok, err, errores }
    },
    async generarAsignacionesDesdeHistorial(usuarioFiltro) {
      let sql = `SELECT CODCLI, USRENC, COUNT(*) AS VECES
                 FROM CLS.TINCIDENCIAH
                 WHERE USRENC IS NOT NULL AND USRENC <> ''`
      if (usuarioFiltro) sql += ` AND USRENC = ?`
      sql += ` GROUP BY CODCLI, USRENC
               HAVING COUNT(*) = (
                 SELECT MAX(CNT) FROM (
                   SELECT COUNT(*) AS CNT FROM CLS.TINCIDENCIAH
                   WHERE USRENC IS NOT NULL AND USRENC <> ''
                   GROUP BY CODCLI, USRENC
                 ) T
               )`
      // Simplificado: por cada cliente, el responsable que mas lo atendio
      const asignaciones = await this._query(
        `SELECT CODCLI, USRENC
         FROM (
           SELECT CODCLI, USRENC, COUNT(*) AS CNT,
                  ROW_NUMBER() OVER (PARTITION BY CODCLI ORDER BY COUNT(*) DESC) AS RN
           FROM CLS.TINCIDENCIAH
           WHERE USRENC IS NOT NULL AND USRENC <> ''
           GROUP BY CODCLI, USRENC
         ) T
         WHERE RN = 1`
      )
      let insertadas = 0
      for (const a of asignaciones) {
        const exist = await this._query("SELECT COUNT(*) AS C FROM CLS.TCLI_RESP WHERE CODCLI = ?", [a.CODCLI])
        if (Number(exist[0].C) === 0) {
          await this.guardarAsignacion(a.CODCLI, a.USRENC)
          insertadas++
        }
      }
      return { total: asignaciones.length, insertadas }
    },

    async agregarComentario(idIncd, comentario, usuario, fecha, hora) {
      await this._query(
        `INSERT INTO CLS.TINCIDHIST (ID_INCD, COMENTARIO, USUARIO, FECHA, HORA) VALUES (?, ?, ?, ?, ?)`,
        [idIncd, comentario, usuario, fecha, hora]
      )
      return { ok: true }
    },
    async obtenerComentarios(idIncd) {
      return await this._query(
        'SELECT ID, ID_INCD, COMENTARIO, USUARIO, FECHA, HORA FROM CLS.TINCIDHIST WHERE ID_INCD = ? ORDER BY FECHA ASC, HORA ASC',
        [idIncd]
      )
    }
  }
})