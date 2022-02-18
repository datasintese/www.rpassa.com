var PesquisaCarro = {
    Filtro: [], /* Lista dinâmica de tags selecionadas pelo usuário ou pela query string */
    Tags: [], /* Fonte de todas as tags das especificações ids carregadas do banco de dados */
    TagsLoaded: false,

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
            if (this_.TagsLoaded) {
                clearInterval(clock);

                let preco_min = 0;
                let preco_max = 0;

                $.each(params, function (param, value) {
                    let values = value.split(',');

                    if (param == 'preco_min')
                        preco_min = values[0];
                    else if (param == 'preco_max')
                        preco_max = values[0];
                    else {
                        $.each(values, function (idx, valueSplit) {
                            $.each(this_.Tags, function (index, obj) {
                                if (param == obj.tag_chave.toLowerCase() && valueSplit == obj.tag_legenda) {
                                    this_.AdicionarTagFiltro(obj.tag_chave, obj.tag_legenda, obj.param_chave, obj.param_valor);
                                }
                            });
                        });
                    }
                });

                $("#price_wd").slider("values", preco_min, preco_max);
                this_.AdicionarTagPreco({ values: [preco_min, preco_max] }, false);

                this_.Pesquisar(false, true, true);
                this_.Pesquisar(true, false, false);
            }
        }, 10); // 10ms

        $('#accordionExample').collapse({
            toggle: false
        });

        this.CarregarComboOrdenacao();
        this.CarregarAcordaosFitro();

        this.AssinarEventos();

        this.LimparItensProdutos();
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
                this_.Pesquisar(true, false);
                this_.Pesquisar(false, true);
            }
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

            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $(document.body).on('click', '#limpar_tags_filtro', function (event) {
            event.preventDefault();
            this_.LimparTagsFiltro();
            this_.LimparQueryStringURL();

            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $('.nice_select#ordenacao').on('change', function (event) {
            event.preventDefault();

            if (parseInt(this.value) > 0) {
                this_.RolamentoPesquisa['orderby'] = parseInt(this.value);
                this_.Pesquisar(true, false);
            }
        });

        $("#price_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagPreco(ui);
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
        else { // Deleta o valor da chave
            // Display the keys
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

    AdicionarTagQueryStringURL(tag_chave, queryStringValor) {
        var values = [];
        $.each(this.Filtro, function (key, obj) {
            if (obj !== undefined)
                if (obj.tag_chave == tag_chave) {
                    if (queryStringValor)
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

    AdicionarTagPreco(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('preco_min', null);
        this.DeletarTagQueryStringURL('preco_max', null);

        this.DeletarTagFiltro('preco_min');
        this.DeletarTagFiltro('preco_max');

        this.AdicionarTagFiltro('preco_min', 'Preço Min: R$ ' + ui.values[0].toLocaleString('de-DE'), 'preco_min', ui.values[0], true);
        this.AdicionarTagFiltro('preco_max', 'Preço Max: R$ ' + ui.values[1].toLocaleString('de-DE'), 'preco_max', ui.values[1], true);

        if (pesquisar) {
            this.Pesquisar(true, false);
            this.Pesquisar(false, true);
        }
    },

    DeletarTagFiltro(tag_chave) {
        let this_ = this;

        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {
                if (tag_chave == value.tag_chave) {
                    delete this_.Filtro[key];
                    return false;
                }
            }
        });

        $('.tag_filtro').each(function (key, value) {
            let tag_chav = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            if (tag_chav == tag_chave) {
                $(this).remove();
            }
        });
    },

    AdicionarTagFiltro: function (tag_chave, tag_legenda, param_chave, param_valor, queryStringValor = false) {
        let ja_existe = false;
        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {
                if (param_valor == value.param_valor) {
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

        this.AdicionarTagQueryStringURL(tag_chave, queryStringValor);

        $('.tags_f').append(this.HtmlItemTag(tag_chave, tag_legenda, param_chave, param_valor, queryStringValor));

        return true;
    },

    LimparTagsFiltro() {
        this.Filtro = [];
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

    Pesquisar(limpar = false, analitico = false, async = true) {
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

        // Converte o filtro em parâmetros para o endpoint de pesquisa
        $.each(this_.Filtro, function (key, value) {
            if (value !== undefined && value !== null) {
                if (value.param_chave.endsWith('_ids')) {
                    if (params.hasOwnProperty(value.param_chave)) {
                        let arr = JSON.parse(params[value.param_chave]);
                        arr.push(parseInt(value.param_valor));
                        var str = JSON.stringify($.unique(arr));
                        params[value.param_chave] = str;
                    }
                    else
                        params[value.param_chave] = '[' + value.param_valor + ']';
                }
                else
                    params[value.param_chave] = value.param_valor;
            }
        });

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
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

    CarregarComboOrdenacao() {
        this.LimparComboOrdenacao();

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/ordenacao',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

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
                    <p>Ano/Modelo: <span>${produto.ano}</span></p>
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

        this.CarregarAcordaoFaixaPreco('0');
        this.CarregarAcordaoCategoria('1');

        $('#accordionExample').collapse({
            heightStyle: "content",
            toggle: true
        })
    },

    CarregarAcordaoCategoria(collaspedId) {
        let this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=categoria',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';

                $.each(result, function (key, item) {
                    this_.Tags.push({
                        tag_chave: item.chave,
                        tag_legenda: item.valor,
                        param_chave: 'especificacoes_ids',
                        param_valor: item.id
                    });

                    htmlItems += this_.HtmlItemAcordaoCategoria(item);
                });

                this_.TagsLoaded = true;

                $('.accordion#accordionExample').append(this_.HtmlAcordaoCategoria(htmlItems, collaspedId));
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

    CarregarAcordaoFaixaPreco(collaspedId) {
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaPreco(collaspedId));

        $("#price_wd").slider({
            range: true,
            min: 0,
            max: 500000,
            values: [0, 500000],
            slide: function (event, ui) {
                $("#amount").val("R$" + ui.values[0].toLocaleString('de-DE') + " - R$" + ui.values[1].toLocaleString('de-DE'));
            },
            // stop: this.EventoFaixaPreco
        });
        $("#amount").val("R$" + $("#price_wd").slider("values", 0).toLocaleString('de-DE') +
            " - R$" + $("#price_wd").slider("values", 1).toLocaleString('de-DE'));
    },


    // this_: this,
    // EventoFaixaPreco: function (event, ui) {
    //     this_.DeletarTagQueryStringURL('preco_min', null);
    //     this_.DeletarTagQueryStringURL('preco_max', null);
    //     this_.AdicionarTagFiltro('preco_min', ui.values[0], 'preco_min', ui.values[0]);
    //     this_.AdicionarTagFiltro('preco_max', ui.values[1], 'preco_max', ui.values[1]);
    // },


    HtmlItemAcordaoCategoria: function (item) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores/imagem?id_especificacao=' + item.id;

        if (!item.contem_imagem) {
            url_imagem = './img/car/car-2.png';
        }

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

    HtmlAcordaoFaixaPreco: function (collaspedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collaspedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collaspedId}" aria-expanded="true" aria-controls="collapse${collaspedId}">
                    Preço
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collaspedId}" class="collapse show" aria-labelledby="heading${collaspedId}"
                data-parent="#accordionExample">

                <div class="card-body">
                    <div class="price_wd_inner">
                        <div id="price_wd" style="margin-right:15px"></div>
                        <label for="amount">Preço:</label>
                        <input type="text" id="amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoCategoria: function (htmlItems, collapseId) {
        // data-parent="#accordionExample">

        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" >
                    Categoria
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}" 
                data-parent="#accordionExample">

                <div class="card-body">
                    <div class="row car_body">
                        ${htmlItems}
                    </div>
                </div>
            </div>
        </div>`
    }
};

PesquisaCarro.Inicializar();
TelaCompartilhamento.Inicializar();
