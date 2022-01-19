var DetalhesCarro = {
    spa: null,
    produto_id: null,
    alienado: null,

    Construtor(params) {
        this.produto_id = params.carro;

        var this_ = this;
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);
    },

    Inicializar: function () {
        $('.spa>.segmento#carros').show();
        var target = this.spa.find('.product_details_area'); 
        $("html, body").animate({ scrollTop: target.offset().top });

        this.IniciarSlickImagemPrimaria();
        this.IniciarSlickImagensSecundarias();

        this.CarregarDetalhes();
    },

    IniciarSlickImagemPrimaria: function () {
        $('.product_main_slider').slick('unslick');

        if ($('.product_main_slider').length) {
            $('.product_main_slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: false,
                fade: true,
                asNavFor: '.product_nav_slider',
                accessibility: true,
                adaptiveHeight: true
            });

        }
    },

    IniciarSlickImagensSecundarias: function () {
        $('.product_nav_slider').slick('unslick');

        if ($('.product_nav_slider').length) {
            $('.product_nav_slider').slick({
                slidesToShow: 5,
                slidesToScroll: 5,
                asNavFor: '.product_main_slider',
                dots: true,
                centerMode: true,
                infinite: false,
                arrows: true,
                focusOnSelect: true,
                accessibility: false,
                variableWidth: false,
                arrows: true,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    },

    HtmlItemBandeiraAlienado: function (row) {
        var tooltip = (row.alienado ? 'Alienado' : 'Quitado');
        var imgFile = (row.alienado ? 'tag-alienado.png' : 'tag-quitado.png');

        return`
        <div style="position: absolute; top: 0; padding-left: 5px; width: 20px; height: auto; "
            data-toggle="tooltip" data-placement="top" title="` + tooltip + `">
            <img style="width: inherit; height: inherit;" 
                src="img/` + imgFile + `"></img>
        </div>`;
    },
    
    HtmlItemImagem: function (imagem_hash, principal, use_bandeira_alienado) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + this.produto_id + '/imagens/' + imagem_hash + '?tipo=' + (principal ? 'principal' : 'secundaria');

        var bandeira_alienado = '';

        if (use_bandeira_alienado){
            bandeira_alienado = this.HtmlItemBandeiraAlienado({ alienado: this.alienado });
        }

        return `
        <div class="item">
            <img src="` + url_imagem + `" alt="Imagem">
            ` + bandeira_alienado + `
        </div>`;
    },

    HtmlItemImagemNavSlider: function (imagem_hash, principal, use_bandeira_alienado) {
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + this.produto_id + '/imagens/' + imagem_hash + '?tipo=' + (principal ? 'principal' : 'secundario');

        var bandeira_alienado = '';

        if (use_bandeira_alienado){
            bandeira_alienado = this.HtmlItemBandeiraAlienado({ alienado: this.alienado });
        }

        return `
        <div class="item">
            <div class="img_inner">
                <img src="` + url_imagem + `" alt="">
                ` + bandeira_alienado +`
            </div>
        </div>`;
    },

    LimparTodasAsImagens: function () {
        this.spa.find('.product_main_slider').empty();
        this.spa.find('.product_nav_slider').slick('removeSlide', null, null, true);
    },

    CarregarDetalhes: function () {
        var this_ = this;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/' + this_.produto_id + '/detalhes',
            type: "GET", cache: false, async: false, contentData: 'json',
            success: function (result, textStatus, request) {
                this_.spa.find('#marca_modelo').html(result.marca + ' - ' + result.modelo);
                this_.spa.find('#preco').html(result.preco);
                this_.spa.find('#sobre').html(result.sobre);
                this_.spa.find('#data').html(result.data);
                this_.spa.find('#ano').html(result.ano);

                this_.LimparTodasAsImagens();

                this_.spa.find('.product_main_slider').last().append(this_.HtmlItemImagem(result.imagem_principal, true, true));
                this_.spa.find('.product_nav_slider').last().append(this_.HtmlItemImagem(result.imagem_principal, true));

                var imagens = result.imagens_hashs;
                $.each(imagens, function (key, value) {
                    this_.spa.find('.product_main_slider').last().append(this_.HtmlItemImagemNavSlider(value, false, true));
                    this_.spa.find('.product_nav_slider').last().append(this_.HtmlItemImagemNavSlider(value, false));
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

        $('.product_main_slider').slick('refresh');
        $('.product_nav_slider').slick('refresh');
    }
}