var SegmentoCarros = {
    spa: null,

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

    RolamentoMaisRecentes: {
        orderby: 1, /* Mais Recentes */
        offset: 0,
        skip: 0,
        lote: 12
    },

    RolamentoMelhoresOfertas: {
        orderby: 4, /* Menor Preço */
        offset: 0,
        skip: 0,
        lote: 12
    },

    Construtor(params) {
        var this_ = this;
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);

        // Combo Marca
        this.spa.find('.nice_select#marca').on('change', function (event) {
            event.preventDefault();

            if (parseInt(this.value) > 0)
                this_.CarregarComboModelo(this.value);
            else
                this_.LimparComboModelo();
        });

        // Botão Pesquisar
        this.spa.find('#pesquisar_carro').on("click", function (event) {
            event.preventDefault();

            let marca = this_.spa.find('.nice_select#marca option:selected');
            let modelo = this_.spa.find('.nice_select#modelo option:selected');
            let km_min =  parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[0]);
            let km_max = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[1]);

            let param_consulta = '';

            if(parseInt(marca.val()) > 0){
                param_consulta += param_consulta.length > 0 ? '&marca=' + marca.text() : 'marca=' + marca.text();
                if(parseInt(modelo.val()) > 0){
                    param_consulta += param_consulta.length > 0 ? '&modelo=' + modelo.text() : 'modelo=' + modelo.text();
                }
            }

            if(km_min > 0){
                param_consulta += param_consulta.length > 0 ? '&km_min=' + km_min : 'km_min=' + km_min;
            }

            if(km_max != undefined && km_max > 0){
                param_consulta += param_consulta.length > 0 ? '&km_max=' + km_max : 'km_max=' + km_max;
            }

            window.location = param_consulta.length > 0 ? 'pesquisa-carro.html?' + param_consulta : 'pesquisa-carro.html';

            /*
            $(this).attr('href', 'pesquisa-carro.html?')
            return;
            

            this_.RolamentoPesquisa.categoria_id = parseInt(this_.spa.find('.nice_select#categoria').val());

            this_.RolamentoPesquisa.marcas_ids = parseInt(this_.spa.find('.nice_select#marca').val());
            this_.RolamentoPesquisa.modelos_ids = parseInt(this_.spa.find('.nice_select#modelo').val());

            let pesquisa_km = this_.spa.find('.nice_select#quilometragem').val();

            this_.RolamentoPesquisa.km_min = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[0]);
            this_.RolamentoPesquisa.km_max = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[1]);
            

            var target = this_.spa.find('.pesquisa');
            target.fadeIn();
            $("html, body").animate({ scrollTop: target.offset().top });

            this_.Pesquisar(true);
            */
        });

        // Adiciona Botão Carregar Mais
        this_.spa.find('.vitrine').find('.latest_collection_area.p_100')
            .last().append(this.HtmlBotaoCarregarMais('carregar_mais_carros_recentes'));

        $("#carregar_mais_carros_recentes").on('click', function (event) {
            this_.VitrineCarregarMaisRecentes(false);
        });

        // Adiciona Botão Carregar Mais
        this_.spa.find('.pesquisa')
            .last().append(this.HtmlBotaoCarregarMais('carregar_mais_carros_pesquisa'));

        $("#carregar_mais_carros_pesquisa").on('click', function (event) {
            this_.Pesquisar(false);
        });

        // Adicionar Rolamento no slider
        var carousel = this.spa.find('.vitrine').find('.feature_car_area').find('.f_car_slider.owl-carousel');
        carousel.on('changed.owl.carousel', function (e) {
            var count = (e.item.count - e.page.size);
            if (e.item.index == count) {
                this_.VitrineCarregarMelhoresOfertasCarrosel(false);
            }
        });

        $(document.body).on('click', '.favorito img', function (event) {
            event.preventDefault();

            if (!Logado()) {
                Redirecionar('autenticacao.html');
            } else {

                let produto = $(this).closest('div[produto_id]').attr('produto_id');
                let isfavorito = $(this).attr('isfavorito') == "true";

                let url_dinamica = "";
                let metodo_http = "";

                if (isfavorito) {
                    isfavorito = false;
                    url_dinamica = StorageGetItem("api") + '/v1/mobile/carros/' + produto + '/desfavoritar'
                    metodo_http = "DELETE";
                    $(this).attr('isfavorito', 'false');
                    $(this).attr('src', 'img/favorite.png');
                } else {
                    isfavorito = true;
                    url_dinamica = StorageGetItem("api") + '/v1/mobile/carros/' + produto + '/favoritar'
                    metodo_http = "POST";
                    $(this).attr('isfavorito', 'true');
                    $(this).attr('src', 'img/favorite2.png');
                }

                let this_ = this;
                $.ajax({
                    url: url_dinamica,
                    type: metodo_http, cache: false, async: true, dataType: 'json',
                    headers: {
                        'Authorization': "Bearer " + StorageGetItem("token")
                    },
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    success: function (request, textStatus, errorThrown) {
                        // alert(request.mensagem);
                    },
                    error: function (request, textStatus, errorThrown) {
                        if (isfavorito) {
                            $(this_).attr('isfavorito', 'false');
                            $(this_).attr('src', 'img/favorite.png');
                        } else {
                            $(this_).attr('isfavorito', 'true');
                            $(this_).attr('src', 'img/favorite2.png');
                        }
                        alert(request.responseText);
                        var mensagem = undefined;
                        try {
                            var obj = $.parseJSON(request.responseText)
                            mensagem = obj.mensagem;
                        } catch (error) {
                            mensagem = request.responseText;
                        }
                    }
                });
            }
        });
    },

    Inicializar() {
        $('.spa>.segmento#carros').show();

        this.spa.find('.pesquisa').hide();
        this.spa.find('.vitrine').show();

        this.LimparTodasAsCombosCarro();
        this.CarregarComboCarroCategoria();
        this.CarregarComboCarroMarca();
        this.CarregarComboCarroQuilometragem();
        this.VitrineCarregarMaisRecentes(true);
        this.VitrineCarregarMelhoresOfertasCarrosel(true);
        this.CarregarCategoriasCarroCarrosel();
        this.CarregarAnaliticoMarcas();
    },

    CarregarCategoriasCarroCarrosel() {
        var this_ = this;
        var carousel = this.spa.find('.vitrine').find('.car_browse_area').find('.car_browse_slider.owl-carousel');

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=categoria',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function () {
                this_.ResetarOwlCarouselTiposNavegacao(carousel);
            },
            success: function (result, textStatus, request) {
                $.each(result, function (key, item) {
                    // if (item.contem_imagem) {
                    carousel.owlCarousel('add', this_.HtmlItemCategoriaCarro(item)).owlCarousel('update');
                    // }
                });
                carousel.owlCarousel('show');
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

    ResetarOwlCarouselTiposNavegacao(carousel) {
        carousel.trigger('destroy.owl.carousel');
        carousel.html(carousel.find('.owl-stage-outer').html()).removeClass('owl-loaded');

        carousel.empty();

        $('.car_browse_slider').owlCarousel({
            loop: true,
            margin: 60,
            items: 6,
            nav: false,
            autoplay: false,
            smartSpeed: 1500,
            dots: false,
            navContainerClass: 'car_arrow',
            navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
            responsiveClass: true,
            responsive: {
                0: {
                    items: 2,
                    margin: 30,
                },
                400: {
                    items: 3,
                },
                768: {
                    items: 4,
                },
                992: {
                    items: 6,
                }
            }
        })
    },

    HtmlItemCategoriaCarro: function (item) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores/imagem?id_especificacao=' + item.id;

        if (!item.contem_imagem) {
            url_imagem = './img/car/car-2.png';
        }

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?categoria=' + item.valor,
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: async function (result, textStatus, request) {
                await sleep(300);
                $('span#analitico_categoria_' + item.valor.replace('/', '_')).html('(' + result.total + ')');
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        return `<div class="item">
            <div class="car_c_item">
                <a href="pesquisa-carro.html?categoria=${encodeURIComponent(item.valor)}"><img src="${url_imagem}" alt=""></a>
                <a href="pesquisa-carro.html?categoria=${encodeURIComponent(item.valor)}">
                    <h5>${item.valor} <span id=analitico_categoria_${item.valor.replace('/', '_')}>(0)</span></h5>
                </a>
            </div>
        </div>`;
    },

    HtmlBotaoCarregarMais: function (id_attribute) {
        return `
        <div style="top: 25px;
            width: auto;
            height: auto;
            position: relative;">
            
            <div style="width: auto;
                height: auto;
                text-align: center;
                position: relative;">
                
                <button 
                    id="` + id_attribute + `"
                    style="height: 40px !important; padding: 3px 15px; margin: 0px;"
                    class="btn btn-outline-secondary red" 
                    type="submit" 
                    id="button-addon2">
                    
                    <h4>Carregar Mais</h4>
                </button>
            </div>
        </div>`;
    },

    HtmlFaixaSuperiorProduto: function (produto, widthImgAlienacao = 20, widthImgFavorito = 25, widthCompartilhamento = 20) {
        var tooltipAlienado = (produto.alienado ? 'Alienado' : 'Quitado');
        var imgAlienado = (produto.alienado ? 'tag-alienado.png' : 'tag-quitado.png');

        var tooltipFavorito = (produto.favorito ? 'Desvaforitar' : 'Favoritar');
        var imgFavorito = (produto.favorito ? 'favorite2.png' : 'favorite.png');

        var styleSombra = "-webkit-filter: drop-shadow(1px 1px 1px #000); filter: drop-shadow(1px 1px 1px #000);";

        return `
        <div style="position: absolute; overflow: hidden; top: 0; width: 100%; height: auto; padding: 0px 5px 5px 5px;">
            <img style="float: left; width: ${widthImgAlienacao}px; ` + styleSombra + `"
                data-toggle="tooltip" data-placement="top" title="` + tooltipAlienado + `" 
                src="img/` + imgAlienado + `"></img>
            
                <a class='favorito' href="#" style="float: right;"
                    data-id-produto="` + produto.id + `">

                    <img style="width: ${widthImgFavorito}px; ` + styleSombra + `"
                        data-toggle="tooltip" data-placement="top" title="` + tooltipFavorito + `" 
                        src="img/` + imgFavorito + `" isfavorito="${produto.favorito}"></img>
                </a>

                <a class='compartilhar' href="#" style="float: right; margin: 0px 5px 0px 0px"
                    data-url-compartilhar="` + produto.url_compartilhamento + `">

                    <img style="width: ${widthCompartilhamento}px; ` + styleSombra + `"
                        data-toggle="tooltip" data-placement="top" title="Compartilhar" 
                        src="img/share.png"></img>
                </a>
        </div>`;
    },

    HtmlItemCarroColecao: function (produto) {
        var url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + produto.imagem_hash + '?tipo=principal';

        return `
        <div class="col-lg-4 col-md-6" produto_id="${produto.id}">
            <div class="l_collection_item wow animated fadeInUp" data-wow-delay="0.2s">
                <div class="car_img"><a href="detalhes-produto.html?carro=`+ produto.id + `">
                    <img class="img-fluid" src="`+ url_imagem + `" alt="Imagem principal"></a>
                    
                    ` + this.HtmlFaixaSuperiorProduto(produto) + `
                    
                </div>
                <div class="text_body">
                    <a href="detalhes-produto.html"><h4>` + produto.marca + ' - ' + produto.modelo + `</h4></a>
                    <h5>` + produto.preco + `</h5>
                    <p>Ano/Modelo: <span>`+ produto.ano + `</span></p>
                    <p>Quilometragem: <span>`+ produto.km + `</span></p>
                </div>
            </div>
        </div>`
    },

    HtmlItemCarroCarousel: function (produto) {
        var url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + produto.imagem_hash + '?tipo=principal';

        return `
        <div class="item" produto_id="${produto.id}">
            <div class="l_collection_item">
                <div class="car_img">
                    <a href="detalhes-produto.html?carro=`+ produto.id + `">
                        <img src="` + url_imagem + `" alt="Imagem principal"></a>

                        ` + this.HtmlFaixaSuperiorProduto(produto) + `

                </div>
                <div class="text_body">
                    <a href="detalhes-produto.html"><h4>` + produto.marca + ' - ' + produto.modelo + `</h4></a>
                    <h5>` + produto.preco + `</h5>
                    <p>Ano/Modelo: <span>`+ produto.ano + `</span></p>
                    <p>Quilometragem: <span>`+ produto.km + `</span></p>
                </div>
            </div>
        </div>`;
    },

    Pesquisar(limpar) {
        var this_ = this;

        this.spa.find('.vitrine').hide();
        var colecao = this.spa.find('.pesquisa').find('.latest_collection_area').find('.row.l_collection_inner');

        if (limpar) {
            colecao.empty();
            this_.RolamentoPesquisa.offset = 0;
            this_.RolamentoPesquisa.skip = 0;
        }

        var params = {};
        params['orderby'] = this_.RolamentoPesquisa.orderby;
        params['offset'] = this_.RolamentoPesquisa.offset;
        params['skip'] = this_.RolamentoPesquisa.skip;
        params['lote'] = this_.RolamentoPesquisa.lote;

        $.each(this.RolamentoPesquisa, function (key, value) {
            if (value != null) {
                if (isNaN(value) || value == undefined) {
                    delete params[key];
                }
                else if(value == 0 && key != 'skip' && key != 'offset'){
                    delete params[key];
                }
                else if (key.endsWith('_ids')) {
                    params[key] = '[' + value + ']'; // Coloca no formato de lista campos terminados em _ids
                }
                else
                    params[key] = value;
            }
            else if (value == null) {
                delete params[key];
            }
        });

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) {
                    xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); //Mágica aqui
                }
            },
            data: params,
            success: function (result, textStatus, request) {
                this_.RolamentoPesquisa.offset = result.next_offset;
                this_.RolamentoPesquisa.skip = result.next_skip;

                var produtos = result.registros;
                $.each(produtos, function (i, produto) {
                    colecao.append(this_.HtmlItemCarroColecao(produto));
                });

                if (result.next_offset == -1)
                    $("#carregar_mais_carros_pesquisa").hide();
                else
                    $("#carregar_mais_carros_pesquisa").show();
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

    VitrineCarregarMaisRecentes(limpar) {
        var this_ = this;

        var colecao = this.spa.find('.vitrine').find('.latest_collection_area').find('.row.l_collection_inner');
        if (limpar) {
            this.RolamentoMelhoresOfertas.offset = 0;
            this.RolamentoMelhoresOfertas.skip = 0;
            colecao.empty();
        }

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) {
                    xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token"));
                }
            },
            data: {
                orderby: this_.RolamentoMelhoresOfertas.orderby,
                offset: this_.RolamentoMelhoresOfertas.offset,
                skip: this_.RolamentoMelhoresOfertas.skip,
                lote: this_.RolamentoMelhoresOfertas.lote
            },
            success: function (result, textStatus, request) {
                this_.RolamentoMelhoresOfertas.offset = result.next_offset;
                this_.RolamentoMelhoresOfertas.skip = result.next_skip;

                var produtos = result.registros;
                $.each(produtos, function (i, produto) {
                    colecao.append(this_.HtmlItemCarroColecao(produto));
                });

                if (result.next_offset == -1)
                    $("#carregar_mais_carros_recentes").hide();
                else
                    $("#carregar_mais_carros_recentes").show();
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

    LimparCarrosel(owlCarousel) {
        for (var i = 0; i < owlCarousel.find('.item').length; i++) {
            owlCarousel.find(".edit-manage-carousel").trigger('remove.owl.carousel', [i])
                .trigger('refresh.owl.carousel');
        }
    },

    ResetarOwlCarouselMelhoresOfertas(carousel) {
        carousel.trigger('destroy.owl.carousel');
        carousel.html(carousel.find('.owl-stage-outer').html()).removeClass('owl-loaded');

        carousel.empty();
        carousel.owlCarousel({
            loop: false,
            margin: 0,
            items: 3,
            nav: false,
            autoplay: true,
            smartSpeed: 1500,
            dots: false,
            center: false,
            navContainerClass: 'car_arrow',
            navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                992: {
                    items: 3,
                },
            }
        });
    },

    VitrineCarregarMelhoresOfertasCarrosel: function (limpar) {
        var this_ = this;
        var carousel = this.spa.find('.vitrine').find('.feature_car_area').find('.f_car_slider.owl-carousel');

        if (limpar) {
            this.RolamentoPesquisa.offset = 0;
            this.RolamentoPesquisa.skip = 0;
            this.ResetarOwlCarouselMelhoresOfertas(carousel);
        }

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function (xhr) {
                if (Logado()) {
                    xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); //Mágica aqui
                }
            },
            data: {
                orderby: this_.RolamentoMaisRecentes.orderby,
                offset: this_.RolamentoMaisRecentes.offset,
                skip: this_.RolamentoMaisRecentes.skip,
                lote: this_.RolamentoMaisRecentes.lote,
                ofertas: 1 /* true */
            },
            success: function (result, textStatus, request) {
                this_.RolamentoMaisRecentes.offset = result.next_offset;
                this_.RolamentoMaisRecentes.skip = result.next_skip;

                var produtos = result.registros;

                $.each(produtos, function (i, produto) {
                    carousel.owlCarousel('add', this_.HtmlItemCarroCarousel(produto)).owlCarousel('update');
                });

                carousel.owlCarousel('show');
                // f_car_slider
                // owl-hiden
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

    LimparTodasAsCombosCarro() {
        this.spa.find('.nice_select#categoria').empty().append('<option selected="selected" value="0">Categoria</option>');
        this.spa.find('.nice_select#categoria').niceSelect('update');

        this.LimparComboModelo();

        this.spa.find('.nice_select#quilometragem').empty().append('<option selected="selected" value="0">Quilometragem</option>');
        this.spa.find('.nice_select#quilometragem').niceSelect('update');

        this.spa.find('.nice_select#marca').empty().append('<option selected="selected" value="0">Marca</option>');
        this.spa.find('.nice_select#marca').niceSelect('update');
    },

    LimparComboModelo() {
        this.spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
        this.spa.find('.nice_select#modelo').niceSelect('update');
    },

    CarregarComboCarroCategoria() {
        let spa = this.spa;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/categorias',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#categoria').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#categoria').niceSelect('update');
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
        })
    },

    CarregarComboCarroMarca() {
        let spa = this.spa;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/marcas',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#marca').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#marca').niceSelect('update');
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

    CarregarComboModelo(marca_id) {
        let spa = this.spa;

        spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/modelos?marca_id=' + marca_id,
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#modelo').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#modelo').niceSelect('update');
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

    CarregarComboCarroQuilometragem() {
        let spa = this.spa;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/quilometragem',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#quilometragem').last()
                        .append('<option value="' + obj.km_min + '|' + obj.km_max + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#quilometragem').niceSelect('update');
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

    CarregarMarcasPopulares(){
        let this_ = this;
        let spa = this.spa;
        let resultado = null;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/marcas/populares',
            type: "GET", cache: true, async: false, contentData: 'json',
            success: function (result) {
                resultado = result;
            },
            contentType: 'application/json;charset=utf-8',
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
        return resultado;
    },

    CarregarAnaliticoMarcas(){
        let this_ = this;
        let marcas_populares = this.CarregarMarcasPopulares();
        if(marcas_populares.length > 0){
            let regiao_marca_populares = this.spa.find('.car_company_slider.owl-carousel');
            
            regiao_marca_populares.empty();
            regiao_marca_populares.owlCarousel('destroy');
            this_.InicializarCarouselMarcasPopulares();

            $.each(marcas_populares, function (i, marca_popular) {
                $.ajax({
                    url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?marca=' + marca_popular.nome,
                    type: "GET", cache: true, async: true, contentData: 'json',
                    success: function (result) {
                        this_.HtmlAnaliticoMarcasPopulares(marca_popular.nome,marca_popular.id, result);
                    },
                    contentType: 'application/json;charset=utf-8',
                    error: function (request, textStatus, errorThrown) {
                        alert(JSON.stringify(request));
                    }
                })
            });
        }
    },

    InicializarCarouselMarcasPopulares(){
        let regiao_marca_populares = this.spa.find('.car_company_slider.owl-carousel');
        if($(regiao_marca_populares).length ){
            $(regiao_marca_populares).owlCarousel({
                loop:true,
                margin: 30,
                items: 8,
                nav: false,
                autoplay: false,
                smartSpeed: 1500,
                dots:false, 
				navContainerClass: 'car_arrow',
                navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>'],
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 2,
                    },
                    575: {
                        items: 3,
                    },
                    768: {
                        items: 4,
                    },
                    992: {
                        items: 8,
                    }
                }
            })
        }
    },

    HtmlAnaliticoMarcasPopulares(nome_marca, marca_id, result_analitico){
        let regiao_marca_populares = this.spa.find('.car_company_slider.owl-carousel');

        regiao_marca_populares.owlCarousel('add',
            `<div class="item">
                <div class="car_c_item">
                    <a href="#"></a>
                    <a href="pesquisa-carro.html?marca=${nome_marca}">
                        <img src="${localStorage.getItem('api') + '/v1/mobile/carros/marcas/imagens/' + marca_id}" alt="">
                        <h5>${nome_marca} <span>(${result_analitico.total})</span></h5>
                    </a>
                </div>
            </div>`).owlCarousel('update');
    }
};