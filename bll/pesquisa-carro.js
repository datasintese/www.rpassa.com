var PesquisaCarro = {
    Filtro: {},

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
        this.Filtro = params;
        $.each(this.Filtro, function (key, value) {
            try {
                this_.RolamentoPesquisa[key] = JSON.parse(value);
            } catch (error) {
                this_.RolamentoPesquisa[key] = value;
            }
        });
        this.AtualizarTagsFiltro();

        $('#accordionExample').collapse({
            toggle: false
        });

        this.CarregarAcordaosFitro();
        this.CarregarComboOrdenacao();

        this.Pesquisar(true);
        this.Pesquisar(false, true);

        this.AssinarEventos();
    },

    AssinarEventos() {
        var this_ = this;

        $(document.body).on('click', '.tag_item', function (event) {
            event.preventDefault();

            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor);
            this_.ConverterTagsEmFiltro();

            this_.Pesquisar(true, false);
            this_.Pesquisar(false, true);
        });

        $(document).on('click', '.tag_filtro', function (event) {
            event.preventDefault();
            $(this).remove();
        });

        $(document.body).on('click', '#limpar_tags_filtro', function (event) {
            event.preventDefault();
            this_.LimparTagsFiltro();

            this_.ConverterTagsEmFiltro();
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
    },

    AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor) {
        $('.tags_f').append(this.HtmlItemTag(tag_chave, tag_legenda, param_chave, param_valor));
    },

    ConverterTagsEmFiltro() {
        var this_ = this;
        this.Filtro = {};

        $('.tags_f').find('a').each(function (key, value) {
            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            if (param_chave.endsWith('_ids')) {
                if (this_.Filtro.hasOwnProperty(param_chave)) {
                    let arr = JSON.parse(this_.Filtro[param_chave]);
                    arr.push(parseInt(param_valor));
                    var str = JSON.stringify($.unique(arr));
                    this_.Filtro[param_chave] = str;
                }
                else
                    this_.Filtro[param_chave] = '[' + param_valor + ']';
            }
            else {
                this_.Filtro[param_chave] = param_valor;
            }

        });
    },

    AtualizarTagsFiltro() {
        let this_ = this;
        $('.tags_f').empty();

        // $.each(this.Filtro, function (key, value) {
        //     $('.tags_f').append(this_.HtmlItemTag(value));
        // });
    },

    LimparTagsFiltro() {
        $('.tags_f').empty();
    },

    HtmlItemTag: function (tag_chave, tag_legenda, param_chave, param_valor) {
        return `<a href="#" class='tag_filtro' tag_chave='${tag_chave}' tag_legenda='${tag_legenda}' param_chave='${param_chave}' param_valor='${param_valor}'>${tag_legenda}<i class="ti-close"></i></a>`;
    },

    Pesquisar(limpar = false, analitico = false) {
        var this_ = this;

        if (limpar) {
            this.LimparItensProdutos();
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
                    params[key] = '[' + value + ']'; // Coloca no formato de lista campos terminados em _ids
                }
                else
                    params[key] = value;
            }
            else if (value == NaN || value == undefined || value == null) {
                delete params[key];
            }
        });

        $.each(this_.Filtro, function (key, value) {
            if (value !== null) {
                params[key] = value;
            }
        });

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: true, async: !limpar, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); // Mágica aqui
            },
            data: params,
            success: function (result, textStatus, request) {
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

        this.CarregarAcordaoCategoria();
    },

    CarregarAcordaoCategoria() {
        let this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=categoria',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';

                $.each(result, function (key, item) {
                    htmlItems += this_.HtmlItemAcordaoCategoria(item);
                });

                $('.accordion#accordionExample').append(this_.HtmlAcordaoCategoria(htmlItems, 0));
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

    HtmlAcordaoCategoria: function (htmlItems, collapseId) {
        // data-parent="#accordionExample">

        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link collapsed" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}">
                    Categoria
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse" aria-labelledby="heading${collapseId}">
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
