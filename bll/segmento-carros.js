var SegmentoCarros = {
    spa: null,

    Construtor() {
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);

        this.spa.find('.nice_select#marca').on('change', function (event) {
            event.preventDefault();
            SegmentoCarros.CarregarComboModelo(this.value);
        });

        this.spa.find('#formPesquisar').on("submit", function (event) {
            event.preventDefault();

            SegmentoCarros.Pesquisar();
        });
    },

    InicializarSegmento: function () {
        this.spa.find('.pesquisa').hide();
        this.spa.find('.vitrine').show();
        SegmentoCarros.LimparTodasAsCombosCarro();
        SegmentoCarros.CarregarComboCarroCategoria();
        SegmentoCarros.CarregarComboCarroMarca();
        SegmentoCarros.CarregarComboCarroQuilometragem();
    },

    Pesquisar: function() {
        this.spa.find('.vitrine').hide();
        var target = this.spa.find('.pesquisa');
        target.fadeIn();

        $("html, body").animate({ scrollTop: target.offset().top });

        var colecao = this.spa.find('.latest_collection_area').find('.row.l_collection_inner');
        colecao.empty();

        // ?orderby=4&offset=0&skip=0&lote=10

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType : 'application/json;charset=utf-8',
            data: {
                orderby: 1,
                offset: 0,
                skip: 0,
                lote: 10
            },
            success: function (result, textStatus, request) {
                var rows = result.registros;
                $.each(rows, function (i, row) {
                    var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + row.id + '/imagens/' + row.imagem_hash + '?tipo=principal';

                    colecao.append(`
                    <div class="col-lg-4 col-md-6">
                        <div class="l_collection_item wow animated fadeInUp" data-wow-delay="0.2s">
                            <div class="car_img"><a href="product-details.html"><img class="img-fluid" src="`+ url_imagem +`" alt=""></a></div>
                            <div class="text_body">
                                <a href="product-details.html"><h4>` + row.marca + ' - ' + row.modelo + `</h4></a>
                                <h5>` + row.preco + `</h5>
                                <p>Ano/Modelo: <span>`+ row.ano +`</span></p>
                            </div>
                            <div class="text_footer">
                                <a href="#"><i class="icon-engine"></i> 2500</a>
                                <a href="#"><i class="icon-gear1"></i> Manual</a>
                                <a href="#"><i class="icon-oil"></i>20/24</a>
                            </div>
                        </div>
                    </div>`);
                });
                
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
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
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