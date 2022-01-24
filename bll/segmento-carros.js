var SegmentoCarros = {
    spa: null,

    RolamentoMaisRecentes: {
        orderby: 1,
        offset: 0,
        skip: 0,
        lote: 12
    },

    RolamentoPesquisa: {
        categoria_id: null,
        orderby: 1,
        offset: 0,
        skip: 0,
        lote: 12,
        marcas_ids: null,
        modelos_ids: null,
        categoria_id: null,
        km_min: null,
        km_max: null
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
        this.spa.find('#formPesquisar').on("submit", function (event) {
            event.preventDefault();

            this_.RolamentoPesquisa.categoria_id = parseInt(this_.spa.find('.nice_select#categoria').val());

            this_.RolamentoPesquisa.marcas_ids = parseInt(this_.spa.find('.nice_select#marca').val());
            this_.RolamentoPesquisa.modelos_ids = parseInt(this_.spa.find('.nice_select#modelo').val());

            this_.RolamentoPesquisa.km_min = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[0]);
            this_.RolamentoPesquisa.km_max = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[1]);

            var target = this_.spa.find('.pesquisa');
            target.fadeIn();
            $("html, body").animate({ scrollTop: target.offset().top });

            this_.Pesquisar(true);
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

        $(document.body).on('click', '.favorito' ,function(event){
            event.preventDefault();
            alert('favorito');
        });

        $(document.body).on('click', '.compartilhar' ,function(event){
            event.preventDefault();
            TelaCompartilhamento.ExibirTela($(this).attr('data-url-compartilhar'));
        });
    },

    Inicializar: function () {
        $('.spa>.segmento#carros').show();

        this.spa.find('.pesquisa').hide();
        this.spa.find('.vitrine').show();

        this.LimparTodasAsCombosCarro();
        this.CarregarComboCarroCategoria();
        this.CarregarComboCarroMarca();
        this.CarregarComboCarroQuilometragem();
        this.VitrineCarregarMaisRecentes(true);
        this.VitrineCarregarMelhoresOfertasCarrosel(true);
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
        </div>`
    },

    HtmlFaixaSuperiorProduto: function (produto) {
        var tooltipAlienado = (produto.alienado ? 'Alienado' : 'Quitado');
        var imgAlienado = (produto.alienado ? 'tag-alienado.png' : 'tag-quitado.png');

        var tooltipFavorito = (produto.favorito ? 'Desvaforitar' : 'Favoritar');
        var imgFavorito = (produto.favorito ? 'favorite2.png' : 'favorite.png');

        return `
        <div style="position: absolute; overflow: hidden; top: 0; width: 100%; height: auto; padding: 0px 5px;">
            <img style="float: left; width: 20px"
                data-toggle="tooltip" data-placement="top" title="` + tooltipAlienado + `" 
                src="img/` + imgAlienado + `"></img>
            
                <a class='favorito' href="#" style="float: right;"
                    data-id-produto="` + produto.id + `">

                    <img style="width: 20px"
                        data-toggle="tooltip" data-placement="top" title="` + tooltipFavorito + `" 
                        src="img/` + imgFavorito + `"></img>
                </a>

                <a class='compartilhar' href="#" style="float: right; margin: 0px 5px 0px 0px"
                    data-url-compartilhar="` + produto.url_compartilhamento + `">

                    <img style="width: 20px"
                        data-toggle="tooltip" data-placement="top" title="Compartilhar" 
                        src="img/share.png"></img>
                </a>
        </div>`;
    },

    HtmlItemCarroColecao: function (produto) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + produto.imagem_hash + '?tipo=principal';

        return `
        <div class="col-lg-4 col-md-6">
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
                <div class="text_footer">
                    <a href="#"><i class="icon-engine"></i> 2500</a>
                    <a href="#"><i class="icon-gear1"></i> Manual</a>
                    <a href="#"><i class="icon-oil"></i>20/24</a>
                </div>
            </div>
        </div>`
    },

    HtmlItemCarroCarousel: function (produto) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + produto.imagem_hash + '?tipo=principal';

        return `
        <div class="item">
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
                <div class="text_footer">
                    <a href="#"><i class="icon-engine"></i> 2500</a>
                    <a href="#"><i class="icon-gear1"></i> Manual</a>
                    <a href="#"><i class="icon-oil"></i>20/24</a>
                </div>
            </div>
        </div>`;
    },

    Pesquisar: function (limpar) {
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
            url: sessionStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
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

    VitrineCarregarMaisRecentes: function (limpar) {
        var this_ = this;

        var colecao = this.spa.find('.vitrine').find('.latest_collection_area').find('.row.l_collection_inner');
        if (limpar) {
            this.RolamentoMaisRecentes.offset = 0;
            this.RolamentoMaisRecentes.skip = 0;
            colecao.empty();
        }

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            data: {
                orderby: this_.RolamentoMaisRecentes.orderby,
                offset: this_.RolamentoMaisRecentes.offset,
                skip: this_.RolamentoMaisRecentes.skip,
                lote: this_.RolamentoMaisRecentes.lote
            },
            success: function (result, textStatus, request) {
                this_.RolamentoMaisRecentes.offset = result.next_offset;
                this_.RolamentoMaisRecentes.skip = result.next_skip;

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

    LimparCarrosel: function (owlCarousel) {
        for (var i = 0; i < owlCarousel.find('.item').length; i++) {
            owlCarousel.find(".edit-manage-carousel").trigger('remove.owl.carousel', [i])
                .trigger('refresh.owl.carousel');
        }
    },

    ResetarOwlCarouselMelhoresOfertas: function (carousel) {
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

        // $(".f_car_slider").show();

        // carousel.html(carousel.find('.owl-stage-outer').html()).removeClass('owl-hidden');
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
            url: sessionStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            data: {
                orderby: this_.RolamentoMelhoresOfertas.orderby,
                offset: this_.RolamentoMelhoresOfertas.offset,
                skip: this_.RolamentoMelhoresOfertas.skip,
                lote: this_.RolamentoMelhoresOfertas.lote,
                ofertas: 1 /* true */
            },
            success: function (result, textStatus, request) {
                this_.RolamentoMelhoresOfertas.offset = result.next_offset;
                this_.RolamentoMelhoresOfertas.skip = result.next_skip;

                var produtos = result.registros;

                $.each(produtos, function (i, produto) {
                    carousel.owlCarousel('add', this_.HtmlItemCarroCarousel(produto)).owlCarousel('update');
                });

                carousel.owlCarousel('show');
                // f_car_slider
                // owl-hiden
            },
            error: function (request, textStatus, errorThrown) {
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

    LimparTodasAsCombosCarro: function () {
        this.spa.find('.nice_select#categoria').empty().append('<option selected="selected" value="0">Categoria</option>');
        this.spa.find('.nice_select#categoria').niceSelect('update');

        this.LimparComboModelo();

        this.spa.find('.nice_select#quilometragem').empty().append('<option selected="selected" value="0">Quilometragem</option>');
        this.spa.find('.nice_select#quilometragem').niceSelect('update');

        this.spa.find('.nice_select#marca').empty().append('<option selected="selected" value="0">Marca</option>');
        this.spa.find('.nice_select#marca').niceSelect('update');
    },

    LimparComboModelo: function () {
        this.spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
        this.spa.find('.nice_select#modelo').niceSelect('update');
    },

    CarregarComboCarroCategoria: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/categorias',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#categoria').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#categoria').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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

    CarregarComboCarroMarca: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/marcas',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#marca').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#marca').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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

    CarregarComboModelo: function (marca_id) {
        let spa = this.spa;

        spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/modelos?marca_id=' + marca_id,
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#modelo').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#modelo').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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

    CarregarComboCarroQuilometragem: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/quilometragem',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#quilometragem').last()
                        .append('<option value="' + obj.km_min + '|' + obj.km_max + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#quilometragem').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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
    }
};