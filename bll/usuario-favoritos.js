var UsuarioFavorito = {
    spa : null,

    RolamentoFavoritos : {
        orderby: 1,
        offset: 0,
        skip: 0,
        lote: 9,
        favoritos: 1,
        next_skip: 0,
        next_offset: 0
    },

    QtdPaginasFavoritos: 6,
    TotPaginasFor: 6,
    PaginaAtual: 0,
    UltimaAtivadadeCarregamentoFavorito : null,

    Construtor(){
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
    },

    Inicializar(){
        this.CarregarComboOrdernacao();
        this.CarregarDetalhesFavorito();
        this.EventMenuFavoritoClick();
        this.EventImgFavoritoClick();
        this.EventChangeOrdenacao();
        this.EventClickPaginacao();
    },

    EventMenuFavoritoClick: async function () {
        var this_ = this;
        $(document).on('click', '#nav_favorito', function(){
            this_.CarregarComboOrdernacao();
            this_.CarregarRolamentoFavoritoPadrao();
            this_.TotPaginasFor= this_.QtdPaginasFavoritos;
            this_.PaginaAtual = 0;
            this_.CarregarPaginasFavorito();
        });
    },

    EventImgFavoritoClick: function () {
        var this_ = this;
        $(document).on('click', '.favorito img', function(event){
            event.preventDefault();
            if (!Logado()) {
                Redirecionar('autenticacao.html');
                return;
            }
            this_.FavoritarDesfavoritar(this);
        });
    },

    EventChangeOrdenacao: function () {
        var this_ = this;
        this_.spa.find('#order_by_favoritos').change(function () {
            if ($(this).val() != 0) {
                this_.RolamentoFavoritos.orderby = $(this).val();
                this_.RolamentoFavoritos.offset = 0;
                this_.RolamentoFavoritos.skip = 0;
                this_.RolamentoFavoritos.lote = 9;
                this_.RolamentoFavoritos.favoritos = 1;
                this_.TotPaginasFor = this_.QtdPaginasFavoritos;
                this_.CarregarPaginasFavorito();
            }
        });
    },

    EventClickPaginacao: function () {
        var this_ = this;
        let html_favoritos = this_.spa.find("#segm_favorito");
        let link_pagina = this_.spa.find(".pagination.favoritos a.page-link");

        $(document).on('click', '.pagination.favoritos a.page-link', function(event){
            event.preventDefault();
            let numPageClicked = $(this).text();
            let paginaAtual = this_.PaginaAtual;

            if (numPageClicked === '') {
                let valor = $(this).children().attr('class');
                // Anterior
                if (valor === 'icon-arrow') {
                    numPageClicked = parseInt(this_.PaginaAtual) - 1;
                    if (numPageClicked <= 0) {
                        return;
                    }

                    if ((this_.TotPaginasFor - numPageClicked) % this_.QtdPaginasFavoritos === 0) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginasFavoritos; i++) {
                            this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked + i}"]`).css('display', 'none');
                        }

                        // Exibir lista anterior
                        for (let i = 1; i <= this_.QtdPaginasFavoritos; i++) {
                            this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked + 1 - i}"]`).css('display', 'block');
                        }
                    }
                }
                // Próximo
                else if (valor === 'icon-arrow_2') {
                    numPageClicked = parseInt(this_.PaginaAtual) + 1;

                    let qtdPaginas = this_.spa.find('ul.pagination.favoritos li').length - 2;

                    // Verificar se tem paginas na memoria
                    if ((numPageClicked - 1) % this_.QtdPaginasFavoritos === 0 && numPageClicked < this_.TotPaginasFor) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginasFavoritos; i++) {
                            this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                        }

                        // Exibir lista próximos
                        for (let i = 1; i <= this_.QtdPaginasFavoritos; i++) {
                            this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked - 1 + i}"]`).css('display', 'block');
                        }
                    } else {
                        // Carregar mais paginas
                        if (numPageClicked > qtdPaginas) {
                            // Verificar se tem mais página para carregar
                            if (this_.RolamentoFavoritos.next_skip < 0 || this_.RolamentoFavoritos.next_offset < 0) {
                                return;
                            } else {
                                this_.TotPaginasFor = numPageClicked + (this_.QtdPaginasFavoritos - 1);

                                // Ocultar lista anteriores
                                for (let i = 1; i <= this_.QtdPaginasFavoritos; i++) {
                                    this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                                }

                                // Carregar Proximos
                                this_.CarregarPaginasFavorito(numPageClicked);
                            }
                        }
                    }
                }
            }

            this_.spa.find('ul.pagination.favoritos li.page-item.active').attr('class', 'page-item');
            this_.spa.find(`ul.pagination.favoritos li.page-item[numPage="${numPageClicked}"]`).attr('class', 'page-item active');

            html_favoritos.find(`div[numPage="${paginaAtual}"]`).each(function (i, element) {
                $(this).css('display', 'none');
            });

            html_favoritos.find(`div[numPage="${numPageClicked}"]`).each(function (i, element) {
                $(this).css('display', 'block');
            });

            this_.PaginaAtual = numPageClicked;

            //let target = this_.spa.find('ul.pagination').offset().top;
            //$("html, body").animate( { scrollTop: target } );
        });
    },

    CarregarComboOrdernacao: function () {
        var this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/ordenacao',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                let menu_ordernacao = this_.spa.find('#order_by_favoritos');
                menu_ordernacao.empty();
                
                $.each(result, function (i, obj) {
                    menu_ordernacao.append(`<option value="${obj.id}">${obj.nome}</option>`);
                });
                menu_ordernacao.niceSelect();
                menu_ordernacao.val(1).niceSelect('update');
                this_.spa.find('.nice-select').css('width', '200px');
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

    CarregarDetalhesFavorito: function () {
        var this_ = this;

        let params = {};
        params['orderby'] = 1;
        params['analitico'] = 1;
        params['favoritos'] = 1;
        
        $.ajax({
            url: StorageGetItem("api") + '/v1/mobile/carros',
            type: "GET", cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            data: params,
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    this_.spa.find('#favoritos').text('Favoritos (' + result.encontrados + ')');
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'error');
                    } catch (error) {
                        Mensagem(request.responseText, 'error');
                    }
                }
            }
        });
    },

    CarregarRolamentoFavoritoPadrao : function(){
        this.RolamentoFavoritos.orderby = 1;
        this.RolamentoFavoritos.offset = 0;
        this.RolamentoFavoritos.skip = 0;
        this.RolamentoFavoritos.lote = 9;
        this.RolamentoFavoritos.favoritos = 1;
        this.RolamentoFavoritos.next_skip = 0;
        this.RolamentoFavoritos.next_offset = 0;
    },

    CarregarPaginasFavorito: async function (pagina = 1) {
        var this_ = this;

        const atividadeLocal = this_.UltimaAtivadadeCarregamentoFavorito = new Object();

        let exibirPagina = true;

        let pagination = this_.spa.find('ul.pagination');
        let html_favoritos = this_.spa.find("#segm_favorito");

        pagination.find('li#pag_proximo').remove();

        for (let i = pagina; i <= this_.TotPaginasFor; i++) {

            let result = await this_.ObterFavoritos();

            if(atividadeLocal !== this_.UltimaAtivadadeCarregamentoFavorito){
                return;
            }

            if(i == 1){
                pagination.empty();
                html_favoritos.empty();
                pagination.append('<li class="page-item" id="pag_anterior"><a class="page-link" href="#"><i class="icon-arrow"></i></a></li>');
            }
            
            this_.RolamentoFavoritos.offset = result.offset;
            this_.RolamentoFavoritos.lote = result.lote;
            this_.RolamentoFavoritos.skip = result.next_skip;
            this_.RolamentoFavoritos.next_skip = result.next_skip;
            this_.RolamentoFavoritos.next_offset = result.next_offset;

            let favoritos_registros = result.registros;

            if (favoritos_registros.length > 0) {
                let html_favoritos = this_.spa.find("#segm_favorito");

                $.each(favoritos_registros, function (j, favorito) {
                    html_favoritos.append(this_.HtmlFavoritos(favorito, i, exibirPagina));
                });

                pagination.append(this_.HtmlPagination(i, exibirPagina))
                exibirPagina = false;
                this_.RolamentoFavoritos.offset = this_.RolamentoFavoritos.next_offset;
                this_.RolamentoFavoritos.skip = this_.RolamentoFavoritos.next_skip;
            }
            if (this_.RolamentoFavoritos.next_skip < 0 || this_.RolamentoFavoritos.next_offset < 0) {
                break;
            }
        }

        pagination.append('<li class="page-item" id="pag_proximo"><a class="page-link" href="#"><i class="icon-arrow_2"></i></a></li>');
        this_.PaginaAtual = pagina;
    },

    ObterFavoritos: function () {
        var this_ = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: StorageGetItem('api') + '/v1/mobile/carros?orderby=' + this_.RolamentoFavoritos.orderby + '&offset=' + this_.RolamentoFavoritos.offset + '&skip=' + this_.RolamentoFavoritos.skip + '&lote=' + this_.RolamentoFavoritos.lote + '&favoritos=1',
                type: 'GET', cache: false, async: true, dataType: 'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                beforeSend: function () {
                },
                success: function (result, textStatus, request) {
                    resolve(result)
                },
                error: function (err) {
                    reject(err) // Reject the promise and go to catch()
                }
            });
        });
    },

    FavoritarDesfavoritar: async function (ref) {
        let produto = $(ref).closest('div[produto_id]').attr('produto_id');
        let isfavorito = $(ref).attr('isfavorito') == "true";

        let url_dinamica = "";
        let metodo_http = "";

        let this_ = ref;

        if (isfavorito) {
            isfavorito = false;
            url_dinamica = StorageGetItem("api") + '/v1/mobile/carros/' + produto + '/desfavoritar'
            metodo_http = "DELETE";
            $(this_).attr('isfavorito', 'false');
            $(this_).attr('src', 'img/favorite.png');
        } else {
            isfavorito = true;
            url_dinamica = StorageGetItem("api") + '/v1/mobile/carros/' + produto + '/favoritar'
            metodo_http = "POST";
            $(this_).attr('isfavorito', 'true');
            $(this_).attr('src', 'img/favorite2.png');
        }

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
    },

    HtmlFavoritos: function (favorito, numPage, exibirPagina) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + favorito.id + '/imagens/' + favorito.imagem_hash + '?tipo=principal';

        return `<div class="col-lg-4 col-md-4 col-sm-6 " data-wow-delay="0.2s" produto_id="${favorito.id}" numPage="${numPage}" style="display: ${exibirPagina ? "block" : "none"};">
                    <div class="l_collection_item orange grid_four red">
                        <div class="car_img">
                            <a href="detalhes-produto.html?carro=${favorito.id}"><img class="img-fluid" src="${url_imagem}" alt="Imagem principal"></a>
                            ${SegmentoCarros.HtmlFaixaSuperiorProduto(favorito, 15, 20, 20)}
                        </div>
                        <div class="text_body">
                            <a href="product-details.html"><h4>${favorito.marca} - ${favorito.modelo}</h4></a>
                            <h5>${favorito.preco}</h5>
                            <p>Ano/Modelo: <span>${favorito.ano}</span></p>
                            <p>Quilometragem: <span>${favorito.km.split(' ')[0]}</span></p>
                        </div>
                        <div class="text_footer">
                            <a href="#"><i class="icon-engine"></i> 2500</a>
                            <a href="#"><i class="icon-gear1"></i> Manual</a>
                            <a href="#"><i class="icon-oil"></i>20/24</a>
                        </div>
                    </div>
                </div>`
    },

    HtmlPagination: function (numPage, exibirPagina) {
        return `
            <li class="page-item ${exibirPagina ? "active" : ""}" numPage="${numPage}"><a class="page-link" href="#">${numPage}</a></li>
        `
    },
}