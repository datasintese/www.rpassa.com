var SegmentoCarros = {
    spa: null,

    RolamentoMaisRecentes: {
        orderby: 1,
        offset: 0,
        skip: 0,
        lote: 12
    },

    RolamentoPesquisa: {
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

    Construtor() {
        var this_ = this;
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);

        // Combo Marca
        this.spa.find('.nice_select#marca').on('change', function (event) {
            event.preventDefault();
            this_.CarregarComboModelo(this.value);
        });

        // Botão Pesquisar
        this.spa.find('#formPesquisar').on("submit", function (event) {
            event.preventDefault();

            this_.RolamentoPesquisa.marcas_ids = parseInt(this_.spa.find('.nice_select#marca').val());
            this_.RolamentoPesquisa.modelos_ids = parseInt(this_.spa.find('.nice_select#modelo').val());

            this_.RolamentoPesquisa.km_min = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[0]);
            this_.RolamentoPesquisa.km_max = parseInt(this_.spa.find('.nice_select#quilometragem').val().split('|')[1]);

            var target = this_.spa.find('.pesquisa');
            target.fadeIn();
            $("html, body").animate({ scrollTop: target.offset().top });

            this_.Pesquisar(true);
        });

        this_.spa.find('.vitrine').find('.latest_collection_area.p_100')
            .last().append(this.HtmlBotaoCarregarMais('carregar_mais_carros_recentes'));

        $("#carregar_mais_carros_recentes").on('click', function (event) {
            this_.VitrineCarregarMaisRecentes(false);
        });

        this_.spa.find('.pesquisa')
            .last().append(this.HtmlBotaoCarregarMais('carregar_mais_carros_pesquisa'));

        $("#carregar_mais_carros_pesquisa").on('click', function (event) {
            this_.Pesquisar(false);
        });
    },

    InicializarSegmento: function () {
        this.spa.find('.pesquisa').hide();
        this.spa.find('.vitrine').show();

        this.LimparTodasAsCombosCarro();
        this.CarregarComboCarroCategoria();
        this.CarregarComboCarroMarca();
        this.CarregarComboCarroQuilometragem();
        this.VitrineCarregarMaisRecentes(true);
        this.VitrineCarregarMelhoresOfertasCarrosel(true);
    },

    HtmlItemCarroColecao: function (row) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + row.id + '/imagens/' + row.imagem_hash + '?tipo=principal';

        return `
        <div class="col-lg-4 col-md-6">
            <div class="l_collection_item wow animated fadeInUp" data-wow-delay="0.2s">
                <div class="car_img"><a href="product-details.html"><img class="img-fluid" src="`+ url_imagem + `" alt="Imagem principal"></a></div>
                <div class="text_body">
                    <a href="product-details.html"><h4>` + row.marca + ' - ' + row.modelo + `</h4></a>
                    <h5>` + row.preco + `</h5>
                    <p>Ano/Modelo: <span>`+ row.ano + `</span></p>
                    <p>Quilometragem: <span>`+ row.km + `</span></p>
                </div>
                <div class="text_footer">
                    <a href="#"><i class="icon-engine"></i> 2500</a>
                    <a href="#"><i class="icon-gear1"></i> Manual</a>
                    <a href="#"><i class="icon-oil"></i>20/24</a>
                </div>
            </div>
        </div>`
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

    HtmlItemCarroCarousel: function (row) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + row.id + '/imagens/' + row.imagem_hash + '?tipo=principal';

        return `
        <div class="item">
            <div class="l_collection_item">
                <div class="car_img"><a href="product-details.html"><img src="`+ url_imagem + `" alt="Imagem principal"></a></div>
                <div class="text_body">
                    <a href="product-details.html"><h4>` + row.marca + ' - ' + row.modelo + `</h4></a>
                    <h5>` + row.preco + `</h5>
                    <p>Ano/Modelo: <span>`+ row.ano + `</span></p>
                    <p>Quilometragem: <span>`+ row.km + `</span></p>
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
                    params[key] = '[' + value + ']';
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

                var rows = result.registros;
                $.each(rows, function (i, row) {
                    colecao.append(this_.HtmlItemCarroColecao(row));
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

                var rows = result.registros;
                $.each(rows, function (i, row) {
                    colecao.append(this_.HtmlItemCarroColecao(row));
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
            loop: true,
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
            },
            onDragged: function () {
                alert('onDragged');
            },
            onDrag: function () {
                alert('onDrag');
            }
        });

        // carousel.html(carousel.find('.owl-stage-outer').html()).removeClass('owl-hidden');
    },

    VitrineCarregarMelhoresOfertasCarrosel: function (limpar) {
        var this_ = this;
        var carousel = this.spa.find('.vitrine').find('.feature_car_area').find('.f_car_slider.owl-carousel');

        if (limpar) this.ResetarOwlCarouselMelhoresOfertas(carousel);

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            data: {
                orderby: 4,
                offset: 0,
                skip: 0,
                lote: 12,
                ofertas: 1 /* true */
            },
            success: function (result, textStatus, request) {
                var rows = result.registros;

                $.each(rows, function (i, row) {
                    carousel.owlCarousel('add', this_.HtmlItemCarroCarousel(row)).owlCarousel('update');
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

        this.spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
        this.spa.find('.nice_select#modelo').niceSelect('update');

        this.spa.find('.nice_select#quilometragem').empty().append('<option selected="selected" value="0">Quilometragem</option>');
        this.spa.find('.nice_select#quilometragem').niceSelect('update');

        this.spa.find('.nice_select#marca').empty().append('<option selected="selected" value="0">Marca</option>');
        this.spa.find('.nice_select#marca').niceSelect('update');
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