var PesquisaCarro = {
    Filtro: null,

    RolamentoPesquisa: {
        categoria_id: null,
        orderby: 1, /* Mais Recentes */
        offset: 0,
        skip: 0,
        lote: 12,
        marcas_ids: null,
        modelos_ids: null,
        categoria_id: null,
        km_min: null,
        km_max: null
    },

    Inicializar() {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        this.Filtro = params;


        this.CarregarComboOrdenacao();

        this.Pesquisar(true);
    },

    Pesquisar(limpar) {
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

        $.each(this.RolamentoPesquisa, function (key, value) {
            if (value > 0) {
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

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); // Mágica aqui
            },
            data: params,
            success: function (result, textStatus, request) {
                this_.RolamentoPesquisa.offset = result.next_offset;
                this_.RolamentoPesquisa.skip = result.next_skip;

                var produtos = result.registros;
                $.each(produtos, function (i, produto) {
                    $('.product_grid_inner').children('.row').append(this_.HtmlItemProduto(produto));
                });

                // if (result.next_offset == -1)
                //     $("#carregar_mais_carros_pesquisa").hide();
                // else
                //     $("#carregar_mais_carros_pesquisa").show();
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
            type: "GET", cache: false, async: true, contentData: 'json',
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
                    <a href="detalhes-produto.html?carro=${produto.id}"><img class="img-fluid"
                            src="${localStorage.getItem('api')}/v1/mobile/carros/${produto.id}/imagens/${produto.imagem_hash}?tipo=principal" alt=""></a>
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

};

PesquisaCarro.Inicializar();