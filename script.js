/* =========================================================
   AutoMatch AT — Script v3
   Compact cards · Routed detail page · Pesquisar sheet
   FIPE collapsible inside detail · Hash routing
   ========================================================= */

(function () {
  "use strict";

  /* ===== FIPE API ===== */
  var FIPE_BASE = "https://parallelum.com.br/fipe/api/v2/cars";
  var FIPE_TIMEOUT = 8000;

  /* ===== DOM refs ===== */
  var $grid         = document.getElementById("cardGrid");
  var $count        = document.getElementById("resultsCount");
  var $search       = document.getElementById("searchInput");
  var $searchClear  = document.getElementById("searchClear");
  var $sort         = document.getElementById("sortSelect");
  var $chips        = document.getElementById("filterChips");
  var $summary      = document.getElementById("filterSummary");
  var $summaryLabel = document.getElementById("filterLabel");
  var $summaryReset = document.getElementById("filterReset");
  var $listView     = document.getElementById("modelos");
  var $detailPage   = document.getElementById("detailPage");
  var $detailContent= document.getElementById("detailContent");
  var $heroSection  = document.getElementById("heroSection");
  var $toolbar      = document.getElementById("toolbar");
  var $sheetBackdrop= document.getElementById("sheetBackdrop");
  var $sheet        = document.getElementById("searchSheet");
  var $sheetBody    = document.getElementById("sheetBody");
  var $sheetClose   = document.getElementById("sheetClose");

  /* ===== State ===== */
  var state = {
    search: "",
    sort: "default",
    catFilter: "todos",
    cambioFilter: null,
    /* FIPE */
    fipeCar: null,
    fipeModelos: [],
    fipeAnos: [],
    fipeModeloSel: null,
    fipeAnoSel: null,
    fipeValor: null,
    fipeLoading: "",
    fipeError: null,
    fipeOpen: false,
    /* Sheet */
    sheetCar: null,
    sheetAnchor: null
  };

  /* ===== Helpers ===== */

  function norm(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function findCarById(id) {
    return MODELOS.find(function (x) { return x.id === id; }) || null;
  }

  function setHash(hash) {
    if (location.hash !== hash) history.pushState(null, "", hash);
  }

  function toggleSearchClearBtn() {
    if ($searchClear) $searchClear.classList.toggle("show", !!$search.value.trim());
  }

  function minPrice(m) { return m.precoMin || 0; }

  function slugifyPath(text) {
    return norm(text || "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function parseAnoRange(texto) {
    var anos = String(texto || "").match(/\d{4}/g) || [];
    if (!anos.length) return { inicio: null, fim: null };
    var inicio = parseInt(anos[0], 10);
    var fim = parseInt(anos[anos.length - 1], 10);
    if (fim < inicio) { var t = inicio; inicio = fim; fim = t; }
    return { inicio: inicio, fim: fim };
  }

  function anoFromFipeCode(code) {
    var m = String(code || "").match(/^(\d{4})-/);
    return m ? parseInt(m[1], 10) : null;
  }

  function pickBestFipeModel(lista, carro) {
    if (!Array.isArray(lista) || !lista.length || !carro) return null;
    var fam = norm(carro.familia || "");
    var busca = norm(carro.fipeBusca || "");
    var modelo = norm(carro.modelo || "");
    var melhor = null, melhorScore = -Infinity;

    lista.forEach(function (item) {
      var nome = norm(item.name || "");
      var score = 0;
      if (fam && nome.indexOf(fam) !== -1) score += 6;
      if (busca && nome.indexOf(busca) !== -1) score += 5;
      modelo.split(/\s+/).forEach(function (tk) {
        if (tk && tk.length > 1 && nome.indexOf(tk) !== -1) score += 0.4;
      });
      if (carro.tipoCambio === "cvt") {
        if (nome.indexOf("cvt") !== -1 || nome.indexOf("xtronic") !== -1) score += 2;
      } else {
        if (nome.indexOf("cvt") === -1) score += 0.8;
      }
      if (score > melhorScore) { melhorScore = score; melhor = item; }
    });
    return melhor;
  }

  function pickBestFipeAno(lista, carro) {
    if (!Array.isArray(lista) || !lista.length || !carro) return null;
    var range = parseAnoRange(carro.anosIdeais);
    var alvo = range.fim || range.inicio || new Date().getFullYear();
    var melhor = null, melhorScore = -Infinity;

    lista.forEach(function (item) {
      var ano = anoFromFipeCode(item.code);
      var nome = norm(item.name || "");
      var score = 0;
      if (ano !== null) {
        if (range.inicio !== null && range.fim !== null && ano >= range.inicio && ano <= range.fim) score += 10;
        score -= Math.abs(ano - alvo) * 0.2;
      }
      if (nome.indexOf("flex") !== -1) score += 1.2;
      if (nome.indexOf("gasolina") !== -1) score += 0.8;
      if (nome.indexOf("diesel") !== -1) score -= 2;
      if (nome.indexOf("eletrico") !== -1 || nome.indexOf("elétrico") !== -1) score -= 2;
      if (score > melhorScore) { melhorScore = score; melhor = item; }
    });
    return melhor;
  }

  function fetchJSON(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, FIPE_TIMEOUT);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function (err) { clearTimeout(timer); throw err; });
  }

  function buildWebmotorsUrl(car) {
    var anos = parseAnoRange(car.anosIdeais);
    var anoInicial = anos.inicio || "";
    var precoAte = car.precoMax || "";

    var marcaPath = slugifyPath(car.marca);
    var modeloPath = slugifyPath(car.familia);
    var basePath = "https://www.webmotors.com.br/carros-usados/mg-belo-horizonte/" + marcaPath + "/" + modeloPath;

    if (anoInicial) {
      basePath += "/de." + anoInicial;
    }

    var params = new URLSearchParams();
    params.set("tipoveiculo", "carros-usados");
    params.set("localizacao", "-19.9245192,-43.9352685x100km");
    params.set("estadocidade", "Minas Gerais-Belo Horizonte");
    params.set("marca1", String(car.marca || "").toUpperCase());
    params.set("modelo1", String(car.familia || "").toUpperCase());
    params.set("o", "5");
    params.set("page", "1");
    params.set("cambio", "Automática");
    if (anoInicial) params.set("anode", String(anoInicial));
    if (precoAte) params.set("precoate", String(precoAte));

    return basePath + "?" + params.toString();
  }

  function buildOlxUrl(car) {
    var anos = parseAnoRange(car.anosIdeais);
    var anoInicial = anos.inicio || "";
    var precoAte = car.precoMax || "";
    var q = car.marca + " " + car.familia + " automatico";

    var params = new URLSearchParams();
    if (precoAte) params.set("pe", String(precoAte));
    params.set("q", q);
    params.set("gb", "2");
    if (anoInicial) params.set("rs", String(anoInicial));

    return "https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?" + params.toString();
  }

  function buildMobiautoUrl(car) {
    var precoAte = car.precoMax || "";
    var marcaPath = slugifyPath(car.marca);
    var modeloPath = slugifyPath(car.familia);

    return "https://www.mobiauto.com.br/comprar/carros-usados/rj-macae/" +
      marcaPath + "/" + modeloPath + "/s/cambio-automatico/preco-ate-" + String(precoAte);
  }

  function buildICarrosUrl(car) {
    var anos = parseAnoRange(car.anosIdeais);
    var anoInicial = anos.inicio || "";
    var precoAte = car.precoMax || "";
    var q = car.marca + " " + car.familia + " automatico";

    var sop = "esc_4.1_";
    if (anoInicial) sop += "-ami_" + String(anoInicial) + ".1_";
    if (precoAte) sop += "-prf_" + String(precoAte) + ".1_";
    sop += "-cam_true.1_-";

    var params = new URLSearchParams();
    params.set("bid", "1");
    params.set("q", q);
    params.set("sop", sop);

    return "https://www.icarros.com.br/ache/listaanuncios.jsp?" + params.toString();
  }

  function buildUrls(car) {
    return {
      webmotors: buildWebmotorsUrl(car),
      olx: buildOlxUrl(car),
      mobiauto: buildMobiautoUrl(car),
      icarros: buildICarrosUrl(car),
      guia: car.links.guia,
      referencia: car.links.referencia
    };
  }

  /* ===== Filtering + Sorting ===== */

  function getVisible() {
    var list = MODELOS.slice();

    if (state.catFilter !== "todos") {
      list = list.filter(function (m) {
        var c = norm(m.categoria);
        if (state.catFilter === "hatch") return c.indexOf("hatch") !== -1;
        if (state.catFilter === "seda")  return c.indexOf("seda") !== -1 || c.indexOf("sedã") !== -1;
        if (state.catFilter === "suv")   return c.indexOf("suv") !== -1;
        return true;
      });
    }

    if (state.cambioFilter) {
      list = list.filter(function (m) { return m.tipoCambio === state.cambioFilter; });
    }

    if (state.search) {
      var q = norm(state.search);
      list = list.filter(function (m) {
        return norm(m.modelo).indexOf(q) !== -1 ||
               norm(m.marca).indexOf(q) !== -1 ||
               norm(m.familia).indexOf(q) !== -1 ||
               norm(m.categoria).indexOf(q) !== -1 ||
               norm(m.cambio).indexOf(q) !== -1 ||
               norm(m.foco).indexOf(q) !== -1 ||
               (m.tags && m.tags.some(function (t) { return norm(t).indexOf(q) !== -1; }));
      });
    }

    switch (state.sort) {
      case "price-asc":  list.sort(function (a, b) { return minPrice(a) - minPrice(b); }); break;
      case "price-desc": list.sort(function (a, b) { return minPrice(b) - minPrice(a); }); break;
      case "name-asc":   list.sort(function (a, b) { return a.modelo.localeCompare(b.modelo, "pt-BR"); }); break;
      case "name-desc":  list.sort(function (a, b) { return b.modelo.localeCompare(a.modelo, "pt-BR"); }); break;
    }
    return list;
  }

  /* ===== View management ===== */

  function showListView() {
    $listView.removeAttribute("hidden");
    $heroSection.removeAttribute("hidden");
    $toolbar.removeAttribute("hidden");
    $detailPage.setAttribute("hidden", "");
  }

  function showDetailView() {
    $listView.setAttribute("hidden", "");
    $heroSection.setAttribute("hidden", "");
    $toolbar.setAttribute("hidden", "");
    $detailPage.removeAttribute("hidden");
  }

  /* ===== Render Cards (compact) ===== */

  function renderCards() {
    var models = getVisible();

    if (models.length === MODELOS.length) {
      $count.innerHTML = '<strong>' + models.length + '</strong> modelos disponíveis';
    } else {
      $count.innerHTML = '<strong>' + models.length + '</strong> de ' + MODELOS.length + ' modelos';
    }

    if (!models.length) {
      $grid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon" aria-hidden="true">🔍</div>' +
          '<h3>Nenhum modelo encontrado</h3>' +
          '<p>Ajuste sua busca ou limpe os filtros.</p>' +
        '</div>';
      return;
    }

    var html = "";
    models.forEach(function (m) {
      /* Show at most 2 strengths on card */
      var strengths = m.pontosFortes.slice(0, 2);

      html +=
        '<article class="car-card" data-id="' + m.id + '">' +
          '<div class="card-body">' +
            '<div class="card-header">' +
              '<div class="card-badges">' +
                '<span class="badge badge-cat">' + m.categoria + '</span>' +
                '<span class="badge badge-cambio">' + (m.tipoCambio === "cvt" ? "CVT" : "AT") + '</span>' +
              '</div>' +
            '</div>' +
            '<h2 class="card-title">' + m.modelo + '</h2>' +
            '<p class="card-foco">' + m.foco + '</p>' +
            '<div class="card-metas">' +
              '<span class="meta">📅 ' + m.anosIdeais + '</span>' +
              '<span class="meta">🛣️ ' + m.kmAlvo + '</span>' +
            '</div>' +
            '<div class="card-price">' + m.faixaPreco + '</div>' +
            '<div class="card-strengths">' +
              strengths.map(function (s) {
                return '<span><span class="ico" aria-hidden="true">✓</span> ' + s + '</span>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="card-footer">' +
            '<button class="btn btn-primary btn-detail" data-id="' + m.id + '">Ver análise</button>' +
            '<button class="btn btn-ghost btn-pesquisar" data-id="' + m.id + '">Pesquisar</button>' +
          '</div>' +
        '</article>';
    });

    $grid.innerHTML = html;
  }

  /* ===== Filter Summary ===== */

  function renderSummary() {
    var parts = [];
    if (state.catFilter !== "todos") {
      var labels = { hatch: "Hatch", seda: "Sedã", suv: "SUV" };
      parts.push(labels[state.catFilter] || state.catFilter);
    }
    if (state.cambioFilter) parts.push(state.cambioFilter === "cvt" ? "CVT" : "AT Convencional");
    if (state.search) parts.push('"' + state.search + '"');

    if (parts.length) {
      $summaryLabel.innerHTML = 'Filtros: <strong>' + parts.join(" · ") + '</strong>';
      $summary.classList.add("visible");
    } else {
      $summary.classList.remove("visible");
    }
  }

  function syncChips() {
    var chips = $chips.querySelectorAll(".chip");
    chips.forEach(function (c) {
      if (c.dataset.cat !== undefined) c.classList.toggle("active", c.dataset.cat === state.catFilter);
      if (c.dataset.cambio !== undefined) c.classList.toggle("active", c.dataset.cambio === state.cambioFilter);
    });
  }

  function render() {
    syncChips();
    renderSummary();
    renderCards();
    toggleSearchClearBtn();
  }

  /* ===== Pesquisar sheet / popover ===== */

  function openSheet(carId, anchorEl) {
    var m = findCarById(carId);
    if (!m) return;

    state.sheetCar = m;
    state.sheetAnchor = anchorEl || null;
    var urls = buildUrls(m);

    var html =
      '<nav class="sheet-links" aria-label="Pesquisar ' + m.familia + '">' +
        sheetLinkHTML(urls.webmotors, "🚗", "wm", "Webmotors", "Anúncios de " + m.familia) +
        sheetLinkHTML(urls.olx, "🏷️", "olx", "OLX", "Classificados") +
        sheetLinkHTML(urls.mobiauto, "🔎", "mob", "Mobiauto", "Buscar modelo") +
        sheetLinkHTML(urls.icarros, "📋", "ic", "iCarros", "Ver ofertas") +
        sheetLinkHTML(urls.guia, "📺", "gui", "Guia em vídeo", "YouTube reviews") +
        sheetLinkHTML(urls.referencia, "📊", "ref", "Referência FIPE", "Tabela oficial") +
      '</nav>';

    $sheetBody.innerHTML = html;

    /* Desktop: position as popover near button */
    if (window.innerWidth >= 640 && anchorEl) {
      var rect = anchorEl.getBoundingClientRect();
      $sheet.style.position = "absolute";
      $sheet.style.top = (rect.bottom + window.scrollY + 6) + "px";
      $sheet.style.left = Math.max(8, rect.left + window.scrollX - 40) + "px";
      $sheet.style.bottom = "auto";
      $sheet.style.right = "auto";
    } else {
      /* Mobile: bottom sheet */
      $sheet.style.position = "fixed";
      $sheet.style.top = "";
      $sheet.style.left = "0";
      $sheet.style.right = "0";
      $sheet.style.bottom = "0";
    }

    $sheet.removeAttribute("hidden");
    $sheetBackdrop.removeAttribute("hidden");

    /* Trigger animation */
    requestAnimationFrame(function () {
      $sheet.classList.add("open");
      $sheetBackdrop.classList.add("open");
      document.body.classList.add("no-scroll");
    });
  }

  function closeSheet() {
    $sheet.classList.remove("open");
    $sheetBackdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () {
      $sheet.setAttribute("hidden", "");
      $sheetBackdrop.setAttribute("hidden", "");
    }, 250);
    state.sheetCar = null;
    state.sheetAnchor = null;
  }

  function sheetLinkHTML(href, ico, cls, label, sub) {
    return '<a class="sheet-link" href="' + href + '" target="_blank" rel="noopener">' +
      '<span class="link-ico ' + cls + '" aria-hidden="true">' + ico + '</span>' +
      '<span class="sheet-link-label">' + label +
        '<span class="sheet-link-sub">' + sub + '</span>' +
      '</span>' +
    '</a>';
  }

  /* ===== Detail Page ===== */

  function openDetail(id) {
    var m = findCarById(id);
    if (!m) return;

    /* Reset FIPE state for this car */
    state.fipeCar = m;
    state.fipeModelos = [];
    state.fipeAnos = [];
    state.fipeModeloSel = null;
    state.fipeAnoSel = null;
    state.fipeValor = null;
    state.fipeLoading = "";
    state.fipeError = null;
    state.fipeOpen = false;

    var urls = buildUrls(m);

    function listHTML(arr, icon, cls) {
      if (!arr || !arr.length) return "";
      return '<ul class="detail-list ' + cls + '">' +
        arr.map(function (t) {
          return '<li><span class="ico" aria-hidden="true">' + icon + '</span> ' + t + '</li>';
        }).join("") + '</ul>';
    }

    $detailContent.innerHTML =
      /* Back link */
      '<a href="#modelos" class="detail-back">← Voltar aos modelos</a>' +

      /* Hero area */
      '<div class="detail-hero">' +
        '<div class="detail-hero-info">' +
          '<div class="detail-badges">' +
            '<span class="badge badge-cat">' + m.categoria + '</span>' +
            '<span class="badge badge-cambio">' + (m.tipoCambio === "cvt" ? "CVT" : "AT") + '</span>' +
          '</div>' +
          '<h1 class="detail-title">' + m.modelo + '</h1>' +
          '<p class="detail-subtitle">' + m.foco + '</p>' +
        '</div>' +
        '<div class="detail-price-box">' +
          '<div class="detail-price-value">' + m.faixaPreco + '</div>' +
          '<div class="detail-price-label">Faixa de preço</div>' +
        '</div>' +
      '</div>' +

      /* Specs grid */
      '<div class="detail-specs">' +
        '<div class="detail-spec"><div class="detail-spec-label">Anos ideais</div><div class="detail-spec-value">' + m.anosIdeais + '</div></div>' +
        '<div class="detail-spec"><div class="detail-spec-label">Câmbio</div><div class="detail-spec-value">' + m.cambio + '</div></div>' +
        '<div class="detail-spec"><div class="detail-spec-label">KM alvo</div><div class="detail-spec-value">' + m.kmAlvo + '</div></div>' +
        '<div class="detail-spec"><div class="detail-spec-label">Tipo</div><div class="detail-spec-value">' + (m.tipoCambio === "cvt" ? "CVT" : "Automático conv.") + '</div></div>' +
      '</div>' +

      /* Strengths */
      '<div class="detail-section">' +
        '<div class="detail-section-title">✅ Pontos fortes</div>' +
        listHTML(m.pontosFortes, "✅", "list-good") +
      '</div>' +

      /* Cautions */
      '<div class="detail-section">' +
        '<div class="detail-section-title">⚠️ Pontos de atenção</div>' +
        listHTML(m.pontosAtencao, "⚠️", "list-warn") +
      '</div>' +

      /* Versions to target */
      '<div class="detail-section">' +
        '<div class="detail-section-title">🎯 Versões para mirar</div>' +
        listHTML(m.versoesMirar, "🎯", "list-aim") +
      '</div>' +

      /* Versions to avoid */
      '<div class="detail-section">' +
        '<div class="detail-section-title">🚫 Versões para evitar</div>' +
        listHTML(m.versoesEvitar, "🚫", "list-skip") +
      '</div>' +

      /* Research links */
      '<div class="detail-research">' +
        '<a class="btn btn-primary" href="' + urls.webmotors + '" target="_blank" rel="noopener">🚗 Webmotors</a>' +
        '<a class="btn btn-secondary" href="' + urls.olx + '" target="_blank" rel="noopener">🏷️ OLX</a>' +
        '<a class="btn btn-secondary" href="' + urls.mobiauto + '" target="_blank" rel="noopener">🔎 Mobiauto</a>' +
        '<a class="btn btn-secondary" href="' + urls.icarros + '" target="_blank" rel="noopener">📋 iCarros</a>' +
        '<a class="btn btn-secondary" href="' + urls.guia + '" target="_blank" rel="noopener">📺 Guia</a>' +
        '<a class="btn btn-secondary" href="' + urls.referencia + '" target="_blank" rel="noopener">📊 Referência</a>' +
      '</div>' +

      /* FIPE collapsible */
      '<div class="fipe-section">' +
        '<button class="fipe-toggle" id="fipeToggle">' +
          '📊 Consulta FIPE — ' + m.modelo +
          '<span class="arrow" aria-hidden="true">▼</span>' +
        '</button>' +
        '<div class="fipe-panel" id="fipePanel"></div>' +
      '</div>';

    showDetailView();
    setHash("#/modelo/" + id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* Update nav */
    updateNav("#modelos");
  }

  function closeDetail() {
    showListView();
    state.fipeCar = null;
    setHash("#modelos");
    updateNav("#modelos");
  }

  /* ===== FIPE rendering (inside detail page) ===== */

  function renderFipe() {
    var panel = document.getElementById("fipePanel");
    if (!panel || !state.fipeCar) return;

    var m = state.fipeCar;
    var html = '<p class="fipe-car-name">🚗 ' + m.modelo + ' · ' + m.anosIdeais + '</p>';

    /* Error */
    if (state.fipeError) {
      html +=
        '<div class="fipe-error">' +
          '<span>' + state.fipeError + '</span>' +
          '<button class="fipe-retry" id="fipeRetry">Tentar novamente</button>' +
        '</div>';
      html += fipeOfficialBtn();
      panel.innerHTML = html;
      return;
    }

    /* Step 1: Models */
    html += '<div class="fipe-step">';
    html += '<div class="fipe-step-label">Modelo FIPE</div>';
    if (state.fipeLoading === "modelos") {
      html += '<div class="fipe-loading"><span class="spinner"></span> Carregando modelos…</div>';
    } else if (state.fipeModelos.length) {
      html += '<select class="fipe-select" id="fipeModeloSelect">';
      html += '<option value="">Selecione o modelo…</option>';
      state.fipeModelos.forEach(function (mod) {
        var sel = mod.code == state.fipeModeloSel ? " selected" : "";
        html += '<option value="' + mod.code + '"' + sel + '>' + mod.name + '</option>';
      });
      html += '</select>';
    } else if (!state.fipeLoading) {
      html += '<div class="fipe-loading">Nenhum modelo encontrado para esta marca.</div>';
    }
    html += '</div>';

    /* Step 2: Years */
    if (state.fipeModeloSel) {
      html += '<div class="fipe-step">';
      html += '<div class="fipe-step-label">Ano / Combustível</div>';
      if (state.fipeLoading === "anos") {
        html += '<div class="fipe-loading"><span class="spinner"></span> Carregando anos…</div>';
      } else if (state.fipeAnos.length) {
        html += '<select class="fipe-select" id="fipeAnoSelect">';
        html += '<option value="">Selecione o ano…</option>';
        state.fipeAnos.forEach(function (a) {
          var sel = a.code == state.fipeAnoSel ? " selected" : "";
          html += '<option value="' + a.code + '"' + sel + '>' + a.name + '</option>';
        });
        html += '</select>';
      } else if (!state.fipeLoading) {
        html += '<div class="fipe-loading">Nenhum ano encontrado.</div>';
      }
      html += '</div>';
    }

    /* Step 3: Value */
    if (state.fipeAnoSel) {
      html += '<div class="fipe-step">';
      html += '<div class="fipe-step-label">Valor FIPE</div>';
      if (state.fipeLoading === "valor") {
        html += '<div class="fipe-loading"><span class="spinner"></span> Consultando valor…</div>';
      } else if (state.fipeValor) {
        var v = state.fipeValor;
        html +=
          '<div class="fipe-result">' +
            '<div class="fipe-result-price">' + (v.price || "—") + '</div>' +
            '<div class="fipe-result-meta">' +
              'Código FIPE: <strong>' + (v.codeFipe || "—") + '</strong><br>' +
              'Referência: <strong>' + (v.referenceMonth || "—") + '</strong><br>' +
              'Combustível: <strong>' + (v.fuel || "—") + '</strong>' +
            '</div>' +
          '</div>';
      }
      html += '</div>';
    }

    html += fipeOfficialBtn();
    panel.innerHTML = html;
  }

  function fipeOfficialBtn() {
    return '<div class="fipe-official">' +
      '<a class="btn btn-secondary" href="https://veiculos.fipe.org.br/" target="_blank" rel="noopener">🔗 Abrir FIPE oficial</a>' +
    '</div>';
  }

  /* ===== FIPE data loading ===== */

  function loadFipeModelos(marcaCodigo, searchTerm) {
    state.fipeLoading = "modelos";
    state.fipeError = null;
    renderFipe();

    fetchJSON(FIPE_BASE + "/brands/" + marcaCodigo + "/models")
      .then(function (data) {
        state.fipeLoading = "";
        if (!Array.isArray(data)) { state.fipeModelos = []; renderFipe(); return; }

        var term = norm(searchTerm);
        var filtered = data.filter(function (d) { return norm(d.name).indexOf(term) !== -1; });
        state.fipeModelos = filtered.length ? filtered : data;

        var melhor = pickBestFipeModel(state.fipeModelos, state.fipeCar);
        if (!melhor && state.fipeModelos.length === 1) melhor = state.fipeModelos[0];

        if (melhor) {
          state.fipeModeloSel = melhor.code;
          renderFipe();
          loadFipeAnos(marcaCodigo, melhor.code);
          return;
        }
        renderFipe();
      })
      .catch(function () {
        state.fipeLoading = "";
        state.fipeError = "Não foi possível carregar os modelos. Verifique sua conexão.";
        renderFipe();
      });
  }

  function loadFipeAnos(marcaCodigo, modeloCodigo) {
    state.fipeLoading = "anos";
    state.fipeAnos = [];
    state.fipeAnoSel = null;
    state.fipeValor = null;
    state.fipeError = null;
    renderFipe();

    fetchJSON(FIPE_BASE + "/brands/" + marcaCodigo + "/models/" + modeloCodigo + "/years")
      .then(function (data) {
        state.fipeLoading = "";
        state.fipeAnos = Array.isArray(data) ? data : [];

        var melhor = pickBestFipeAno(state.fipeAnos, state.fipeCar);
        if (melhor) {
          state.fipeAnoSel = melhor.code;
          renderFipe();
          loadFipeValor(marcaCodigo, modeloCodigo, melhor.code);
          return;
        }
        renderFipe();
      })
      .catch(function () {
        state.fipeLoading = "";
        state.fipeError = "Não foi possível carregar os anos. Verifique sua conexão.";
        renderFipe();
      });
  }

  function loadFipeValor(marcaCodigo, modeloCodigo, anoCodigo) {
    state.fipeLoading = "valor";
    state.fipeValor = null;
    state.fipeError = null;
    renderFipe();

    fetchJSON(FIPE_BASE + "/brands/" + marcaCodigo + "/models/" + modeloCodigo + "/years/" + anoCodigo)
      .then(function (data) {
        state.fipeLoading = "";
        state.fipeValor = data || null;
        renderFipe();
      })
      .catch(function () {
        state.fipeLoading = "";
        state.fipeError = "Não foi possível consultar o valor. Verifique sua conexão.";
        renderFipe();
      });
  }

  /* ===== Nav ===== */

  function updateNav(activeHash) {
    document.querySelectorAll(".header-nav a").forEach(function (a) {
      a.classList.toggle("active",
        a.getAttribute("href") === activeHash ||
        (activeHash === "#" && a.getAttribute("href") === "#modelos")
      );
    });
  }

  /* ===== Hash Routing ===== */

  function handleRoute() {
    var hash = location.hash || "#";

    /* Close sheet on any navigation */
    if ($sheet.classList.contains("open")) closeSheet();

    if (hash.indexOf("#/modelo/") === 0) {
      var id = hash.replace("#/modelo/", "");
      openDetail(id);
      return;
    }

    /* Any other hash: show list view */
    showListView();

    if (hash === "#notas") {
      var el = document.getElementById("notas");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "#modelos" || hash === "#") {
      var root = document.getElementById("modelos");
      if (root) root.scrollIntoView({ behavior: "smooth" });
    }

    updateNav(hash);
  }

  /* ===== Events ===== */

  /* Search debounce */
  var searchTimer = null;
  $search.addEventListener("input", function () {
    var val = this.value.trim();
    toggleSearchClearBtn();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { state.search = val; render(); }, 200);
  });

  if ($searchClear) {
    $searchClear.addEventListener("click", function () {
      $search.value = "";
      state.search = "";
      toggleSearchClearBtn();
      render();
      $search.focus();
    });
  }

  /* Sort */
  $sort.addEventListener("change", function () { state.sort = this.value; render(); });

  /* Category + cambio chips */
  $chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    if (chip.dataset.cat !== undefined) state.catFilter = chip.dataset.cat;
    if (chip.dataset.cambio !== undefined) {
      state.cambioFilter = state.cambioFilter === chip.dataset.cambio ? null : chip.dataset.cambio;
    }
    render();
  });

  /* Reset filters */
  $summaryReset.addEventListener("click", function () {
    state.catFilter = "todos";
    state.cambioFilter = null;
    state.search = "";
    $search.value = "";
    toggleSearchClearBtn();
    state.sort = "default";
    $sort.value = "default";
    render();
  });

  /* Card grid — delegation */
  $grid.addEventListener("click", function (e) {
    /* Pesquisar button */
    var pesqBtn = e.target.closest(".btn-pesquisar");
    if (pesqBtn) {
      e.stopPropagation();
      openSheet(pesqBtn.dataset.id, pesqBtn);
      return;
    }

    /* Detail button */
    var detBtn = e.target.closest(".btn-detail");
    if (detBtn) {
      e.stopPropagation();
      openDetail(detBtn.dataset.id);
      return;
    }

    /* External link — let through */
    if (e.target.closest("a")) return;

    /* Card click → detail */
    var card = e.target.closest(".car-card");
    if (card) openDetail(card.dataset.id);
  });

  /* Detail page — delegation */
  $detailContent.addEventListener("click", function (e) {
    /* FIPE toggle */
    var toggle = e.target.closest("#fipeToggle");
    if (toggle) {
      state.fipeOpen = !state.fipeOpen;
      toggle.classList.toggle("open", state.fipeOpen);
      var panel = document.getElementById("fipePanel");
      if (panel) {
        panel.classList.toggle("open", state.fipeOpen);
        /* Auto-load FIPE on first open */
        if (state.fipeOpen && !state.fipeModelos.length && !state.fipeLoading && state.fipeCar) {
          loadFipeModelos(state.fipeCar.fipeMarca, state.fipeCar.fipeBusca);
        }
      }
      return;
    }

    /* FIPE retry */
    if (e.target.id === "fipeRetry" || e.target.closest("#fipeRetry")) {
      if (!state.fipeCar) return;
      state.fipeError = null;
      var marca = state.fipeCar.fipeMarca;
      if (!state.fipeModelos.length) {
        loadFipeModelos(marca, state.fipeCar.fipeBusca);
      } else if (state.fipeModeloSel && !state.fipeAnos.length) {
        loadFipeAnos(marca, state.fipeModeloSel);
      } else if (state.fipeAnoSel && !state.fipeValor) {
        loadFipeValor(marca, state.fipeModeloSel, state.fipeAnoSel);
      } else {
        loadFipeModelos(marca, state.fipeCar.fipeBusca);
      }
      return;
    }
  });

  /* FIPE selects — delegation */
  $detailContent.addEventListener("change", function (e) {
    if (!state.fipeCar) return;
    var marca = state.fipeCar.fipeMarca;

    if (e.target.id === "fipeModeloSelect") {
      var val = e.target.value;
      if (!val) return;
      state.fipeModeloSel = val;
      state.fipeAnos = [];
      state.fipeAnoSel = null;
      state.fipeValor = null;
      renderFipe();
      loadFipeAnos(marca, val);
    }

    if (e.target.id === "fipeAnoSelect") {
      var yearVal = e.target.value;
      if (!yearVal) return;
      state.fipeAnoSel = yearVal;
      state.fipeValor = null;
      renderFipe();
      loadFipeValor(marca, state.fipeModeloSel, yearVal);
    }
  });

  /* Sheet close */
  $sheetClose.addEventListener("click", closeSheet);
  $sheetBackdrop.addEventListener("click", closeSheet);

  /* Click outside popover on desktop */
  document.addEventListener("click", function (e) {
    if (!$sheet.classList.contains("open")) return;
    if ($sheet.contains(e.target)) return;
    if (e.target.closest(".btn-pesquisar")) return;
    closeSheet();
  });

  /* Esc key */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if ($sheet.classList.contains("open")) { closeSheet(); return; }
    }
  });

  /* Hash routing */
  window.addEventListener("hashchange", handleRoute);

  /* ===== Init ===== */
  render();
  handleRoute();

})();
