var PesquisaCarro = {
    Filtro: [], /* Lista dinâmica de tags selecionadas pelo usuário ou pela query string */
    Tags: [], /* Fonte de todas as tags das especificações ids carregadas do banco de dados */
    TagsLoading: {}, /* Sinaliza se as tags ainda estão sendo carregadas do servidor */

    xhrAjaxAnalitico: null,
    xhrAjaxPesquisa: null,

    TamanhoTituloCategorias: 16, /* Valor em px */

    RolamentoPesquisa: {
        categoria_id: null,
        orderby: 1, /* Mais Recentes */
        offset: 0,
        skip: 0,
        lote: 12,
        marcas_ids: null,
        modelos_ids: null,
        especificacoes_ids: null,
        km_min: null,
        km_max: null
    },

    Inicializar() {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        var this_ = this;
        this_.LimparTagsFiltro();

        // Converte Query String em tags de filtro
        var clock = setInterval(function () {
            let TagsLoaded = false;

            $.each(this_.TagsLoading, function (k, v) {
                if (this_.TagsLoading[k] == true) {
                    TagsLoaded = false;
                    return false;
                }
                TagsLoaded = true;
            });

            if (TagsLoaded) {
                clearInterval(clock);

                let ordenacao = null;
                let preco_min = null;
                let preco_max = null;
                let km_min = null;
                let km_max = null;
                let ano_min = null;
                let ano_max = null;

                $.each(params, function (param, value) {
                    let values = value.split(',');

                    if (param == 'ordenacao')
                        ordenacao = values[0];
                    else if (param == 'preco_min')
                        preco_min = values[0];
                    else if (param == 'preco_max')
                        preco_max = values[0];
                    else if (param == 'km_min')
                        km_min = values[0];
                    else if (param == 'km_max')
                        km_max = values[0];
                    else if (param == 'ano_min')
                        ano_min = values[0];
                    else if (param == 'ano_max')
                        ano_max = values[0];
                    else {
                        $.each(values, function (idx, valueSplit) {
                            $.each(this_.Tags, function (index, obj) {
                                if (param == obj.tag_chave.toLowerCase() && valueSplit == obj.tag_legenda) {
                                    this_.AdicionarTagFiltro(obj.tag_chave, obj.tag_legenda, obj.param_chave, obj.param_valor);
                                }
                                else if (param == obj.tag_chave.toLowerCase() && valueSplit.endsWith(obj.tag_legenda)) {
                                    let left = valueSplit.substring(0, valueSplit.length - obj.tag_legenda.length).trim();

                                    this_.AdicionarTagFiltro(obj.tag_chave, left + ' ' + obj.tag_legenda, obj.param_chave, obj.param_valor);
                                }
                            });
                        });
                    }
                });

                if (ordenacao != null) {
                    // TODO: Checar o valor da ordenação pela lista Tags que foi carregada pelo endpoint de ordenacao

                    let param_valor = 1;
                    $.each(this_.Tags, function (key, obj) {
                        if (obj.tag_chave == 'ordenacao' && obj.tag_legenda == ordenacao) {
                            param_valor = obj.param_valor;
                            return false;
                        }
                    });

                    this_.RolamentoPesquisa['orderby'] = param_valor;
                    $('.nice_select#ordenacao').val(param_valor).niceSelect('update');
                    this_.AdicionarTagFiltroOrdenacao(ordenacao, param_valor, false);
                }

                var ano_options = $('#ano_wd').slider('option');

                // Quando não há faixa de km informado na QueryString
                if (ano_min !== null && ano_max !== null) {
                    $("#ano_wd").slider("values", 0, ano_min);
                    $("#ano_wd").slider("values", 1, ano_max);
                    this_.AdicionarTagFiltroAno({ values: [ano_min, ano_max] }, false);
                }
                else if (ano_min != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#ano_wd").slider("values", 0, ano_min);
                    $("#ano_wd").slider("values", 1, ano_options.max);
                    this_.AdicionarTagFiltroAno({ values: [ano_min, ano_options.max] }, false);
                }
                else if (ano_max != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#ano_wd").slider("values", 0, ano_options.min);
                    $("#ano_wd").slider("values", 1, ano_max);
                    this_.AdicionarTagFiltroAno({ values: [ano_options.min, ano_max] }, false);
                }

                var km_options = $('#km_wd').slider('option');

                // Quando não há faixa de km informado na QueryString
                if (km_min !== null && km_max !== null) {
                    $("#km_wd").slider("values", 0, km_min);
                    $("#km_wd").slider("values", 1, km_max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_min, km_max] }, false);
                }
                else if (km_min != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#km_wd").slider("values", 0, km_min);
                    $("#km_wd").slider("values", 1, km_options.max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_min, km_options.max] }, false);
                }
                else if (km_max != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#km_wd").slider("values", 0, km_options.min);
                    $("#km_wd").slider("values", 1, km_max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_options.min, km_max] }, false);
                }

                var preco_options = $('#price_wd').slider('option');

                // Quando não há faixa de preço informado na QueryString
                if (preco_min !== null && preco_max !== null) {
                    $("#price_wd").slider("values", 0, preco_min);
                    $("#price_wd").slider("values", 1, preco_max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_min, preco_max] }, false);
                }
                else if (preco_min != null) { // Quando há faixa de preço parcial informado na QueryString
                    $("#price_wd").slider("values", 0, preco_min);
                    $("#price_wd").slider("values", 1, preco_options.max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_min, preco_options.max] }, false);
                }
                else if (preco_max != null) { // Quando há faixa de preço parcial informado na QueryString
                    $("#price_wd").slider("values", 0, preco_options.min);
                    $("#price_wd").slider("values", 1, preco_max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_options.min, preco_max] }, false);
                }

                this_.AtualizarLegendaFaixaPreco();
                this_.AtualizarLegendaFaixaAno();
                this_.AtualizarLegendaFaixaQuilometragem();

                this_.PosInicializar();

                this_.AbortarPesquisasEmAndamento();
                this_.Pesquisar(false, true, true);
                this_.Pesquisar(true, false, false);
            }
        }, 10); // 10ms

        this.CarregarComboOrdenacao();
        this.CarregarAcordaosFitro();

        this.AssinarEventos();

        this.LimparItensProdutos();
    },

    AbortarPesquisasEmAndamento() {
        if (this.xhrAjaxAnalitico !== null) {
            if (this.xhrAjaxAnalitico.status != 200 && this.xhrAjaxAnalitico.status != 0) this.xhrAjaxAnalitico.abort();
            this.xhrAjaxAnalitico = null;
        }
        if (this.xhrAjaxPesquisa !== null) {
            if (this.xhrAjaxPesquisa.status != 200 && this.xhrAjaxPesquisa.status != 0) this.xhrAjaxPesquisa.abort();
            this.xhrAjaxPesquisa = null;
        }
    },

    PosInicializar() {
        $(".wd_scroll").mCustomScrollbar({

            theme: "dark",
            setHeight: "20%",
            mouseWheel: { enable: true }
        });

        $('#accordionExample').collapse({
            heightStyle: "fill",
            toggle: true
        })
    },

    AssinarEventos() {
        var this_ = this;

        $(document.body).on('click', '.tag_item', function (event) {
            event.preventDefault();

            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            if (this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor)) {
                this_.AbortarPesquisasEmAndamento();
                this_.Pesquisar(true, false);
                this_.Pesquisar(false, true);
            } else {
                this_.DeletarTagFiltro(tag_chave, tag_legenda, param_valor);
                this_.DeletarTagQueryStringURL(tag_chave, tag_legenda);
                this_.AbortarPesquisasEmAndamento();
                this_.Pesquisar(true, false);
                this_.Pesquisar(false, true);
            }
        });

        $(document.body).on('click', '.tag_item_check', function (event) {
            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = 'Final Placa ' + $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            var element = $(this).parent().find("input[type=checkbox]");
            let checked = element.is(':checked');

            if (checked)
                $(this).parent().find("input[type=checkbox]").removeAttr('checked');
            else
                $(this).parent().find("input[type=checkbox]").attr('checked', 'checked');

            if (checked) {
                this_.DeletarTagQueryStringURL(tag_chave, tag_legenda);
                this_.DeletarTagFiltro(tag_chave, null, param_valor);
            }
            else {
                this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor);
            }

            this_.AbortarPesquisasEmAndamento();
            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $(document).on('click', '.tag_filtro', function (event) {
            event.preventDefault();

            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');
            let use_valor = $(this).attr('use_valor') == 'true'; // Para outros tipos de tag que não seguem a mesma regra das especificacoes_ids

            $.each(this_.Filtro, function (key, value) {
                if (value !== undefined) {
                    if (tag_chave == value.tag_chave && param_valor == value.param_valor) {
                        delete this_.Filtro[key];
                        return false;
                    }
                }
            });

            this_.DeletarTagQueryStringURL(tag_chave, (use_valor ? null : tag_legenda));

            $(this).remove();

            if (tag_chave == 'ordenacao') {
                $('.nice_select#ordenacao').val(1).niceSelect('update');
                this_.RolamentoPesquisa['orderby'] = 1;
            }

            this_.AbortarPesquisasEmAndamento();
            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $(document.body).on('click', '#limpar_tags_filtro', function (event) {
            event.preventDefault();
            this_.LimparTagsFiltro();
            this_.LimparQueryStringURL();

            this_.AbortarPesquisasEmAndamento();
            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $('.nice_select#ordenacao').on('change', function (event) {
            event.preventDefault();

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(this.value) > 0) {
                this_.RolamentoPesquisa['orderby'] = parseInt(this.value);

                this_.AdicionarTagFiltroOrdenacao(tag_legenda, parseInt(this.value), false);

                this_.AbortarPesquisasEmAndamento();
                this_.Pesquisar(true, false);
            }
        });

        $("#price_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroPreco(ui);
        });

        $("#km_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroQuilometragem(ui);
        });

        $("#ano_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroAno(ui);
        });
    },

    LimparQueryStringURL() {
        var url = new URL(window.location.href);
        url.search = '';
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    DeletarTagQueryStringURL(tag_chave, tag_legenda) {
        var url = new URL(window.location.href);
        const urlSearchParams = new URLSearchParams(window.location.search);
        const searchParams = new URLSearchParams(urlSearchParams);

        if (tag_legenda === null) { // Deleta a chave independente do valor
            searchParams.delete(tag_chave);
        }
        else {
            // Deleta o valor da chave
            for (var key of searchParams.keys()) {
                if (tag_chave.toLowerCase() == key) {
                    var values = searchParams.get(key);
                    var arr = values.split(',');
                    $.each(arr, function (k, val) {
                        if (val !== undefined) {
                            if (val == tag_legenda) delete arr[k];
                        }
                    });
                    searchParams.set(tag_chave.toLowerCase(), arr.filter(x => x != '').join(","));
                }
            }
        }
        url.search = searchParams.toString();
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    AdicionarTagQueryStringURL(tag_chave, useParamValor) {
        var values = [];
        $.each(this.Filtro, function (key, obj) {
            if (obj !== undefined)
                if (obj.tag_chave == tag_chave) {
                    if (useParamValor)
                        values.push(obj.param_valor)
                    else
                        values.push(obj.tag_legenda)
                }
        });

        var url = new URL(window.location.href);
        const urlSearchParams = new URLSearchParams(window.location.search);
        const searchParams = new URLSearchParams(urlSearchParams);
        searchParams.set(tag_chave.toLowerCase(), values.join(','));
        url.search = searchParams.toString();
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    AdicionarTagFiltroOrdenacao(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('ordenacao', null);
        this.DeletarTagFiltro('ordenacao');
        this.AdicionarTagFiltro('ordenacao', tag_legenda, 'ordenacao', param_valor, false);

        if (pesquisar) {
            this.AbortarPesquisasEmAndamento();
            this.Pesquisar(true, false);
            this.Pesquisar(false, true);
        }
    },

    AdicionarTagFiltroPreco(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('preco_min', null);
        this.DeletarTagQueryStringURL('preco_max', null);

        this.DeletarTagFiltro('preco_min');
        this.DeletarTagFiltro('preco_max');

        this.AdicionarTagFiltro('preco_min', 'Preço Min: R$ ' + ui.values[0].toLocaleString('de-DE'), 'preco_min', ui.values[0], true);
        this.AdicionarTagFiltro('preco_max', 'Preço Max: R$ ' + ui.values[1].toLocaleString('de-DE'), 'preco_max', ui.values[1], true);

        if (pesquisar) {
            this.AbortarPesquisasEmAndamento();
            this.Pesquisar(true, false);
            this.Pesquisar(false, true);
        }
    },

    AdicionarTagFiltroQuilometragem(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('km_min', null);
        this.DeletarTagQueryStringURL('km_max', null);

        this.DeletarTagFiltro('km_min');
        this.DeletarTagFiltro('km_max');

        this.AdicionarTagFiltro('km_min', 'Km Min: ' + ui.values[0].toLocaleString('de-DE'), 'km_min', ui.values[0], true);
        this.AdicionarTagFiltro('km_max', 'Km Max: ' + ui.values[1].toLocaleString('de-DE'), 'km_max', ui.values[1], true);

        if (pesquisar) {
            this.AbortarPesquisasEmAndamento();
            this.Pesquisar(true, false);
            this.Pesquisar(false, true);
        }
    },

    AdicionarTagFiltroAno(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('ano_min', null);
        this.DeletarTagQueryStringURL('ano_max', null);

        this.DeletarTagFiltro('ano_min');
        this.DeletarTagFiltro('ano_max');

        this.AdicionarTagFiltro('ano_min', 'Ano Min: ' + ui.values[0].toLocaleString('de-DE'), 'ano_min', ui.values[0], true);
        this.AdicionarTagFiltro('ano_max', 'Ano Max: ' + ui.values[1].toLocaleString('de-DE'), 'ano_max', ui.values[1], true);

        if (pesquisar) {
            this.AbortarPesquisasEmAndamento();
            this.Pesquisar(true, false);
            this.Pesquisar(false, true);
        }
    },

    DeletarTagFiltro(tag_chave, tag_legenda = null, param_valor = null) {
        let this_ = this;

        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {

                // Remova tag pelo param_valor (elemento por elemento do grupo)
                if (param_valor !== null) {
                    if (tag_chave == value.tag_chave && param_valor == value.param_valor) {
                        delete this_.Filtro[key];
                    }
                }
                // Remova tag pela legenda (elemento por elemento do grupo)
                else if (tag_legenda !== null) {
                    if (tag_chave == value.tag_chave && tag_legenda == value.tag_legenda) {
                        delete this_.Filtro[key];
                    }
                }
                // Remova tag pela chave (todos os elementos do grupo)
                else {
                    if (tag_chave == value.tag_chave) {
                        delete this_.Filtro[key];
                        return false;
                    }
                }
            }
        });

        // if (filtro.lenght == 0) {
        //     this.LimparQueryStringURL();
        // }

        $('.tag_filtro').each(function (key, value) {
            let tag_chav = $(this).attr('tag_chave');
            let tag_legend = $(this).attr('tag_legenda');
            let param_chav = $(this).attr('param_chave');
            let param_val = $(this).attr('param_valor');

            // Remova tag pela legenda (elemento por elemento do grupo)
            if (param_valor !== null) {
                if (tag_chav == tag_chave && param_valor == param_val) {
                    $(this).remove();
                }
            }
            // Remova tag pela legenda (elemento por elemento do grupo)
            else if (tag_legenda !== null) {
                if (tag_chav == tag_chave && tag_legend == tag_legenda) {
                    $(this).remove();
                }
            }
            // Remova tag pela chave (todos os elementos do grupo)
            else {
                if (tag_chav == tag_chave) {
                    $(this).remove();
                }
            }
        });
    },

    AdicionarTagFiltro: function (tag_chave, tag_legenda, param_chave, param_valor, useParamValor = false) {
        let ja_existe = false;
        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {
                if (param_chave == value.param_chave && param_valor == value.param_valor) {
                    ja_existe = true;
                    return false;
                }
            }
        });
        if (ja_existe) return false;

        this.Filtro.push({
            tag_chave: tag_chave,
            tag_legenda: tag_legenda,
            param_chave: param_chave,
            param_valor: param_valor
        });

        this.AdicionarTagQueryStringURL(tag_chave, useParamValor);
        $('.tags_f').append(this.HtmlItemTag(tag_chave, tag_legenda, param_chave, param_valor, useParamValor));

        return true;
    },

    LimparTagsFiltro() {
        this.Filtro = [];

        $('.nice_select#ordenacao').val(1).niceSelect('update');
        this.RolamentoPesquisa['orderby'] = 1;

        // TODO: Redefinir Faixa de Preço para padrão 0 ao máximo

        $('.tags_f').empty();
    },

    HtmlItemTag: function (tag_chave, tag_legenda, param_chave, param_valor, use_valor) {
        return `<a href="#" class='tag_filtro' 
            tag_chave='${tag_chave}' 
            tag_legenda='${tag_legenda}' 
            param_chave='${param_chave}' 
            param_valor='${param_valor}'
            use_valor='${use_valor}'>${tag_legenda}<i class="ti-close"></i></a>`;
    },

    Pesquisar: function (limpar = false, analitico = false, async = true) {
        var this_ = this;

        if (limpar) {
            this_.RolamentoPesquisa.offset = 0;
            this_.RolamentoPesquisa.skip = 0;
        }

        var params = {};
        params['orderby'] = this_.RolamentoPesquisa.orderby;
        params['offset'] = this_.RolamentoPesquisa.offset;
        params['skip'] = this_.RolamentoPesquisa.skip;
        params['lote'] = this_.RolamentoPesquisa.lote;

        if (analitico)
            params['analitico'] = 1;

        $.each(this.RolamentoPesquisa, function (key, value) {
            if (value !== null) {
                if (key.endsWith('_ids')) {
                    params[key] = '[' + value + ']'; // Coloca no formato de lista os campos terminados em '_ids'
                }
                else
                    params[key] = value;
            }
            else if (value == NaN || value == undefined || value == null) {
                delete params[key];
            }
        });

        let dicEspecificacoes = {};

        // Converte o filtro em parâmetros para o endpoint de pesquisa
        $.each(this_.Filtro, function (key, value) {
            if (value !== undefined && value !== null) {
                if (value.param_chave == 'especificacoes_ids') {
                    if (dicEspecificacoes.hasOwnProperty(value.tag_chave)) {
                        dicEspecificacoes[value.tag_chave].push(parseInt(value.param_valor));
                    }
                    else
                        dicEspecificacoes[value.tag_chave] = [value.param_valor];
                }
                else if (value.param_chave.endsWith('_ids')) {
                    if (params.hasOwnProperty(value.param_chave)) {
                        // Valor agregado na Array
                        let arr = JSON.parse(params[value.param_chave]);
                        arr.push(parseInt(value.param_valor));
                        var str = JSON.stringify($.unique(arr));
                        params[value.param_chave] = str;
                    }
                    else
                        // Primeiro valor da Array
                        params[value.param_chave] = '[' + value.param_valor + ']';
                }
                else
                    params[value.param_chave] = value.param_valor; // Não terminados em '_ids' é valor string ou inteiro!
            }
        });

        console.log(localStorage.getItem('api') + '/v1/mobile/carros');

        params['especificacoes_ids'] = [];
        $.each(dicEspecificacoes, function (key, value) {
            params['especificacoes_ids'].push(value);
        });
        params['especificacoes_ids'] = JSON.stringify(params['especificacoes_ids']);

        let url = localStorage.getItem('api') + '/v1/mobile/carros';

        var xhr = $.ajax({
            url: url,
            type: "GET", cache: true, async: async, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); // Mágica aqui
            },
            data: params,
            success: function (result, textStatus, request) {
                if (limpar) {
                    this_.LimparItensProdutos();
                };

                if (analitico) {
                    $('#encontrados').html(result.encontrados);
                }
                else {
                    this_.RolamentoPesquisa.offset = result.next_offset;
                    this_.RolamentoPesquisa.skip = result.next_skip;

                    var produtos = result.registros;
                    $.each(produtos, function (i, produto) {
                        $('.product_grid_inner').children('.row').append(this_.HtmlItemProduto(produto));
                    });
                }
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        if (analitico)
            this.xhrAjaxAnalitico = xhr;
        else
            this.xhrAjaxPesquisa = xhr;
    },

    CarregarComboOrdenacao() {
        this.TagsLoading['ordenacao'] = true;
        var this_ = this;

        this.LimparComboOrdenacao();

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/ordenacao',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {
                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'ordenacao',
                        tag_legenda: obj.nome,
                        param_chave: 'orderby',
                        param_valor: obj.id
                    });
                });
                this_.TagsLoading['ordenacao'] = false;

                $.each(result, function (i, obj) {
                    $('.nice_select#ordenacao').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                $('.nice_select#ordenacao').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();
                alert(JSON.stringify(request));

                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    },

    HtmlItemProduto: function (produto) {
        return `<div class="col-lg-4 col-md-4 col-sm-6 wow animated fadeInUp" data-wow-delay="0.2s">
            <div class="l_collection_item orange grid_four red">
                <div class="car_img">
                    <a href="detalhes-produto.html?carro=${produto.id}">
                        <img class="img-fluid"
                            src="${localStorage.getItem('api')}/v1/mobile/carros/${produto.id}/imagens/${produto.imagem_hash}?tipo=principal" alt=""></a>
                        ${SegmentoCarros.HtmlFaixaSuperiorProduto(produto)}
                </div>
                <div class="text_body">
                    <a href="detalhes-produto.html?carro=${produto.id}">
                        <h4>${produto.marca} - ${produto.modelo}</h4>
                    </a>
                    <h5>${produto.preco}</h5>
                    <p>Ano/Modelo <span>${produto.ano}</span></p>
                </div>
                <div class="text_footer">
                    <a href="#"><i class="icon-engine"></i> 2500</a>
                    <a href="#"><i class="icon-gear1"></i> Manual</a>
                    <a href="#"><i class="icon-oil"></i>20/24</a>
                </div>
            </div>
        </div>`;
    },

    LimparItensProdutos() {
        $('.product_grid_inner').children('.row').empty();
    },

    LimparComboOrdenacao() {
        $('.nice_select#ordenacao').empty();
        $('.nice_select#ordenacao').niceSelect('update');
    },

    CarregarAcordaosFitro() {
        $('.accordion#accordionExample').empty();
        $('#accordionExample').collapse('dispose');

        this.CarregarAcordaoFaixaPreco('one');
        this.CarregarAcordaoFaixaAno('two');
        this.CarregarAcordaoFaixaQuilometragem('three');
        this.CarregarAcordaoCarrosNovosUsados('four');
        this.CarregarAcordaoFinalDePlaca('five');
        this.CarregarAcordaoCategoria('six');
    },

    CarregarAcordaoCarrosNovosUsados: function (collaspedId) {
        $('.accordion#accordionExample').append(this.HtmlAcordaoCarrosNovosUsados(collaspedId));
    },

    CarregarAcordaoFinalDePlaca: function (collapsedId) {
        this.TagsLoading['final_de_placa'] = true;
        let this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=final da placa',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';
                let index = 0;

                $.each(result, function (key, item) {
                    this_.Tags.push({
                        tag_chave: item.chave,
                        tag_legenda: item.valor,
                        param_chave: 'especificacoes_ids',
                        param_valor: item.id
                    });

                    htmlItems += this_.HtmlItemAcordaoFinalDePlaca(item, index);
                    index++;
                });

                this_.TagsLoading['final_de_placa'] = false;
                $('.accordion#accordionExample').append(this_.HtmlAcordaoFinalDePlaca(htmlItems, collapsedId));
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();
                alert(JSON.stringify(request));

                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });

    },

    CarregarAcordaoCategoria(collapsedId) {
        this.TagsLoading['categoria'] = true;

        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=categoria',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';

                var count = 0;

                $.each(result, function (key, item) {
                    this_.Tags.push({
                        tag_chave: item.chave,
                        tag_legenda: item.valor,
                        param_chave: 'especificacoes_ids',
                        param_valor: item.id
                    });

                    count++;
                    if (count % 2 != 0) htmlItems += '<div class="row">';

                    htmlItems += this_.HtmlItemAcordaoCategoria(item);

                    if (count % 2 == 0) htmlItems += '</div>';
                });

                this_.TagsLoading['categoria'] = false;

                $('.accordion#accordionExample').append(this_.HtmlAcordaoCategoria(htmlItems, collapsedId));
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();

                alert(JSON.stringify(request));

                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    },

    CarregarAcordaoFaixaAno(collapsedId) {
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaAno(collapsedId));

        $("#ano_wd").slider({
            range: true,
            min: 1900,
            max: 2050,
            values: [1900, 2050],
            slide: function (event, ui) {
                $("#ano_amount").val(ui.values[0] + " - " + ui.values[1]);
            }
        });
        this.AtualizarLegendaFaixaPreco();
    },

    CarregarAcordaoFaixaPreco(collapsedId) {
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaPreco(collapsedId));

        $("#price_wd").slider({
            range: true,
            min: 0,
            max: 500000,
            values: [0, 500000],
            slide: function (event, ui) {
                $("#amount").val("R$" + ui.values[0].toLocaleString('de-DE') + " - R$" + ui.values[1].toLocaleString('de-DE'));
            }
        });
        this.AtualizarLegendaFaixaPreco();
    },

    CarregarAcordaoFaixaQuilometragem(collapsedId) {
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaQuilometragem(collapsedId));

        $("#km_wd").slider({
            range: true,
            min: 0,
            max: 500000,
            values: [0, 500000],
            slide: function (event, ui) {
                $("#km_amount").val(ui.values[0].toLocaleString('de-DE') + " km - " + ui.values[1].toLocaleString('de-DE') + " km");
            }
        });
        this.AtualizarLegendaFaixaQuilometragem();
    },

    AtualizarLegendaFaixaPreco() {
        $("#amount").val("R$" + $("#price_wd").slider("values", 0).toLocaleString('de-DE') +
            " - R$" + $("#price_wd").slider("values", 1).toLocaleString('de-DE'));
    },

    AtualizarLegendaFaixaAno() {
        $("#ano_amount").val($("#ano_wd").slider("values", 0) +
            " - " + $("#ano_wd").slider("values", 1));
    },

    AtualizarLegendaFaixaQuilometragem() {
        $("#km_amount").val($("#km_wd").slider("values", 0).toLocaleString('de-DE') +
            " km - " + $("#km_wd").slider("values", 1).toLocaleString('de-DE') + " km");
    },

    HtmlItemAcordaoFinalDePlaca: function (item, index) {
        return `<div class="col-6">
                    <div class="creat_account">
                        <input type="checkbox" id="p-option-final-placa-${index}" name="selector">
                        <label class="tag_item_check" for="p-option-final-placa-${index}"
                            tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'
                            >${item.valor}</label>
                        <div class="check"></div>
                    </div>
                </div>`;
    },

    HtmlItemAcordaoCategoria: function (item) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores/imagem?id_especificacao=' + item.id;

        if (!item.contem_imagem) {
            url_imagem = './img/car/car-2.png';
        }

        // Analítico
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?categoria=' + item.valor,
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: async function (result, textStatus, request) {
                $('span#analitico_categoria_' + item.valor.replace('/', '_')).html('(' + result.total + ')');
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        return `<div class="col-6">
            <div class="type_item">
                <div class="image">
                    <a href="#" class='tag_item' 
                    tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'><img class="img-fluid"
                        src="${url_imagem}" alt=""></a>
                </div>
                <a href="#" class='tag_item' 
                    tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'>
                    <h4>${item.valor} <span id=analitico_categoria_${item.valor.replace('/', '_')}>(0)</span></h4>
                </a>
            </div>
        </div>
        `;
    },

    HtmlAcordaoFaixaAno: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Ano
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="">

                <div class="card-body"
                    style="padding-bottom: 0px !important">

                    <div class="price_wd_inner ">
                        <div id="ano_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="ano_amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFaixaPreco: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Preço
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="">

                <div class="card-body"
                style="padding-bottom: 0px !important">

                    <div class="price_wd_inner ">
                        <div id="price_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFaixaQuilometragem: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Quilometragem
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="" >

                <div class="card-body" 
                    style="padding-bottom: 0px !important" >

                    <div class="price_wd_inner">
                        <div id="km_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="km_amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoCategoria: function (htmlItems, collapseId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Categoria
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}" 
                data-parent="">

                <div class="card-body" 
                    style="padding-bottom: 0px !important" >

                    <div class="row car_body wd_scroll">
                        ${htmlItems}
                    </div>
                </div>
            </div>
        </div>`
    },

    HtmlAcordaoCarrosNovosUsados: function (collapseId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Carros
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}"
                data-parent="">
                
                <div class="row card-body"
                    style="padding-bottom: 0px !important" >
                    
                    <div class="col-6">
                        <div class="creat_account">
                            <input type="checkbox" id="p-option-1" name="selector">
                            <label for="p-option-1">Novos</label>
                            <div class="check"></div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="creat_account">
                            <input type="checkbox" id="p-option-2" name="selector">
                            <label for="p-option-2">Usados</label>
                            <div class="check"></div>
                        </div>
                    </div>

                    <div class="col-6">
                    <div class="creat_account">
                        <input type="checkbox" id="p-option-3" name="selector">
                        <label for="p-option-3">Quitados</label>
                        <div class="check"></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="creat_account">
                        <input type="checkbox" id="p-option-4" name="selector">
                        <label for="p-option-4">Alienados</label>
                        <div class="check"></div>
                    </div>
                </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFinalDePlaca: function (htmlItems, collapseId) {
        return `<div class="card">
                    <div class="card-header" id="heading${collapseId}">
                        <button class="btn btn-link" type="button" data-toggle="collapse"
                            data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                            style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                            Final da Placa
                            <i class="ti-plus"></i>
                            <i class="ti-minus"></i>
                        </button>
                    </div>
                    <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}"
                        data-parent="">
                        
                        <div class="row card-body"
                            style="padding-bottom: 0px !important" >
                                ${htmlItems}
                        </div>
                    </div>
                </div>`;
    }
};

PesquisaCarro.Inicializar();
TelaCompartilhamento.Inicializar();