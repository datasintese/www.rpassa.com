var DetalhesCarro = {
    spa: null,
    produto_id: null,

    Construtor(params) {
        this.produto_id = params.carro;

        var this_ = this;
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);

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

    HtmlItemImagemProduto: function (produto, use_faixa_superior, tipo_imagem, imagem_hash) { /* true = principal, false = secundária */
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + imagem_hash + '?tipo=' + (tipo_imagem ? 'principal' : 'secundaria');

        var htmlFaixaSuperior = '';

        if (use_faixa_superior) {
            htmlFaixaSuperior = this.HtmlFaixaSuperiorProduto(produto);
        }

        return `
        <div class="item">
            <img src="` + url_imagem + `" alt="Imagem">
            ` + htmlFaixaSuperior + `
        </div>`;
    },

    HtmlItemImagemProdutoNavSlider: function (produto, use_faixa_superior, tipo_imagem, imagem_hash) { /* true = principal, false = secundária */
        var url_imagem = sessionStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + imagem_hash + '?tipo=' + (tipo_imagem ? 'principal' : 'secundario');

        var htmlFaixaSuperior = '';

        if (use_faixa_superior) {
            htmlFaixaSuperior = this.HtmlFaixaSuperiorProduto(produto);
        }

        return `
        <div class="item">
            <div class="img_inner">
                <img src="` + url_imagem + `" alt="">
                ` + htmlFaixaSuperior + `
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

                this_.spa.find('.product_main_slider').last().append(this_.HtmlItemImagemProduto(result, true, true, result.imagem_principal));
                this_.spa.find('.product_nav_slider').last().append(this_.HtmlItemImagemProduto(result, false, true, result.imagem_principal));

                var imagens = result.imagens_hashs;
                $.each(imagens, function (key, imagem_secundaria) {
                    this_.spa.find('.product_main_slider').last().append(this_.HtmlItemImagemProdutoNavSlider(result, true, false, imagem_secundaria));
                    this_.spa.find('.product_nav_slider').last().append(this_.HtmlItemImagemProdutoNavSlider(result, false, false, imagem_secundaria));
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