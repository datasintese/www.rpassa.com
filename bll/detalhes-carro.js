var DetalhesCarro = {
    spa: null,
    produto_id: null,

    Construtor(params) {
        this.produto_id = params.carro;

        var this_ = this;
        var baseTela = '.spa>.segmento#carros';
        this.spa = $(baseTela);

        $(document.body).on('click', '.favorito', function (event) {
            event.preventDefault();
            if (!Logado()) {
                Redirecionar('sing-in.html');
            } else {
                alert('favorito');

                $.ajax({
                    url: StorageGetItem("api") + '/v1/mobile/carros/' + this_.produto_id + '/favoritar',
                    type: "POST", cache: false, async: true, dataType: 'json',
                    headers: {
                        'Authorization': StorageGetItem("token")
                    },
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    success: function (request, textStatus, errorThrown) {
                        alert(request.mensagem);
                    },
                    error: function (request, textStatus, errorThrown) {
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

        $(document.body).on('click', '.compartilhar', function (event) {
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

        this.CarregarProduto();
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

    CarregarEspecificacoesPadrao: function (especificacoes) {
        var nav = this.spa.find(".product_list_right>ul.nav");

        $.each(especificacoes, function (key, spec) {
            if (spec.id_tipo == 99) {
                let icon = spec.css_icon;

                nav.append(`
                <li>
                    <div style="
                        height: 61px;
                        line-height: 61px;
                        border-bottom: 1px solid #dddddd;">

                        <a style="
                            display: inline-block;
                            "><i class="` + spec.icone + `"></i>` + spec.chave +

                    `
                        <div style="
                            display: flex; 
                            height: 100%;
                            float: right; 
                            vertical-align: middle;
                            text-align: right">

                            <span style="
                                height: 100%; 
                                width: 100%;
                                display: inline-flex;
                                align-items: center;
                                line-height: 20px
                                ">` + spec.valor + `</span></a>
                        
                        </div>
                    </div:
                </li>`);
            }
        });
    },

    CarregarEspecificacoes: function (especificacoes) {
        var this_ = this;
        var nav = this.spa.find(".right_spec>.tab-content#nav-tabContent");
        nav.empty();

        var spec_html = '';

        var oldTipo = -1;
        $.each(especificacoes, function (key, spec) {
            if (spec.id_tipo != 99 /* Outros */) {
                if (oldTipo != spec.id_tipo) {
                    if (oldTipo != -1) {
                        spec_html += '</ul></div>';
                    }

                    var id = 'nav-carro' + spec.id_tipo;
                    var aria_controls = 'nav-carro-tab' + spec.id_tipo;

                    spec_html += `
                        <div class="tab-pane fade show active" id="` + aria_controls + `" role="tabpanel"
                            aria-labelledby="` + id + `">`;

                    spec_html += `
                    <div class="spec_information nice_scroll">
                        <h4>` + spec.tipo + `</h4>
                        <ul class="nav flex-column">`;

                    oldTipo = spec.id_tipo;
                }

                spec_html += '<li>' + spec.chave;   // Chave

                if (spec.valor == 'true') {
                    spec_html += ' <img src="img/icon/green.png" alt="">';          // True
                }
                else if (spec.valor == 'false') {
                    spec_html += ' <img src="img/icon/close-icon.png" alt="">';     // False
                }
                else
                    spec_html += ' <span>' + spec.valor + '</span></li>';           // Valor
            }
        });
        nav.append(spec_html + '</div>');

        // -------------------------------------------------
        // Adiciona as especificações vazias do lado direito
        // -------------------------------------------------

        var anchors = this.spa.find(".left_spec>div.nav>a");

        anchors.each(function (key, value) {
            var id = $(this).attr('id');
            var texto = $(this).text();
            var aria_controls = $(this).attr('aria-controls');

            var found = this_.spa.find('.right_spec').find('[aria-labelledby=' + id + ']');

            if (found.length == 0) {
                var html = `
                <div class="tab-pane fade" id="` + aria_controls + `" role="tabpanel"
                    aria-labelledby="`+ id + `">
                    <div class="spec_information nice_scroll">
                        <h4>`+ texto + `</h4>
                        <ul class="nav flex-column">
                        </ul>
                    </div>
                </div>
                `;

                nav.append(html);
            }
        });
    },

    CarregarNavTiposEspecificacoes: function () {
        var nav = this.spa.find(".left_spec>div.nav");
        nav.empty();

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/especificacoes/carro/tipos',
            type: "GET", cache: false, async: false, contentData: 'json',
            success: function (result, textStatus, request) {
                $.each(result, function (key, value) {
                    let id = 'nav-carro' + value.id;
                    let aria_controls = 'nav-carro-tab' + value.id;
                    let active = key == 0 ? ' active' : '';

                    nav.append(`
                    <a class="nav-item nav-link ` + active + `" id="` + id + `" data-toggle="tab"
                        href="#`+ aria_controls + `" role="tab" aria-controls="` + aria_controls + `"
                        aria-selected="` + (active == ' active' ? 'true' : 'false') + `">` + value.nome + `</a>`);
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

    CarregarDetalhes: function (detalhes) {
        var row = this.spa.find(".product_overview_text").find('.row');

        var left = row.find('.nav:eq(0)');
        var right = row.find('.nav:eq(1)');

        var valores = detalhes.split(' ⬤ ');

        $.each(valores, function (key, value) {
            let par = key % 2 == 0;

            if (par)
                left.append(`<li><img src="img/icon/green.png" alt="">` + value + `</li>`);
            else
                right.append(`<li><img src="img/icon/green.png" alt="">` + value + `</li>`);
        });
    },

    CarregarProduto: function () {
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

                this_.CarregarDetalhes(result.detalhes);
                this_.CarregarNavTiposEspecificacoes();
                this_.CarregarEspecificacoesPadrao(result.especificacoes);
                this_.CarregarEspecificacoes(result.especificacoes);
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