var UsuarioMeusCarros = {
    spa : null,
    menu_tela : null,

    RolamentoMeusCarros: {
        orderby: 1,
        offset: 0,
        skip: 0,
        lote: 9,
        next_skip: 0,
        next_offset: 0
    },

    QtdPaginas: 6,
    TotPaginasFor: 6,
    PaginaAtual: 0,
    UltimaAtivadadeCarregamento : null,

    Construtor(){
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
        this.menu_tela = 'meus-carros';
    },

    Inicializar(){
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        this.CarregarComboOrdernacao();
        this.CarregarDetalhes();
        this.EventMenuClick();
        //this.EventImgFavoritoClick();
        this.EventChangeOrdenacao();
        this.EventClickPaginacao();
        this.EventClickExcluirCarro();

        if('menu' in params){
            if(params['menu'] == this.menu_tela){
                this.spa.find('#nav_meus_carros').trigger('click');
            }
        }
    },

    EventMenuClick: async function () {
        var this_ = this;
        $(document).on('click', '#nav_meus_carros', function(event) {

            DeletarTagQueryStringURL('menu', this_.menu_tela);
            AdicionarTagQueryStringURL('menu', this_.menu_tela);
            
            this_.CarregarComboOrdernacao();
            this_.CarregarRolamentoPadrao();
            this_.TotPaginasFor= this_.QtdPaginas;
            this_.PaginaAtual = 0;
            this_.CarregarPaginas();
        });
    },

    EventImgFavoritoClick: function () {
        var this_ = this;
        $(document).on('click', '.favorito img', function(event) {
            event.preventDefault();
            if (!Logado()) {
                Redirecionar('autenticacao.html');
                return;
            }
            this_.FavoritarDesfavoritar(this);
        });
    },

    EventClickExcluirCarro : function(){
        let this_ = this;

        $(document.body).on('click', '#excluir-carro', function(event){
            event.preventDefault();
            let produto_id = $(this).attr('carro');
            Mensagem('Deseja realmente excluir esse anúncio?', 'question', function(){
                this_.spa.find(`div[produto_id="${produto_id}"]`).remove();
                this_.ExcluirCarro(produto_id);
            });
        });
    },

    EventChangeOrdenacao: function () {
        var this_ = this;
        this_.spa.find('#order_by_meus_carros').change(function () {
            if ($(this).val() != 0) {
                this_.RolamentoMeusCarros.orderby = $(this).val();
                this_.RolamentoMeusCarros.offset = 0;
                this_.RolamentoMeusCarros.skip = 0;
                this_.RolamentoMeusCarros.lote = 9;
                this_.TotPaginasFor = this_.QtdPaginas;
                this_.CarregarPaginas();
            }
        });
    },

    EventClickPaginacao: function () {
        var this_ = this;
        let html_meus_carros = this_.spa.find("#segm_meus_carros");

        $(document).on('click', '.pagination.meus_carros a.page-link', function(event) {
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

                    if ((this_.TotPaginasFor - numPageClicked) % this_.QtdPaginas === 0) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked + i}"]`).css('display', 'none');
                        }

                        // Exibir lista anterior
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked + 1 - i}"]`).css('display', 'block');
                        }
                    }
                }
                // Próximo
                else if (valor === 'icon-arrow_2') {
                    numPageClicked = parseInt(this_.PaginaAtual) + 1;

                    let qtdPaginas = this_.spa.find('ul.pagination.meus_carros li').length - 2;

                    // Verificar se tem paginas na memoria
                    if ((numPageClicked - 1) % this_.QtdPaginas === 0 && numPageClicked < this_.TotPaginasFor) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                        }

                        // Exibir lista próximos
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked - 1 + i}"]`).css('display', 'block');
                        }
                    } else {
                        // Carregar mais paginas
                        if (numPageClicked > qtdPaginas) {
                            // Verificar se tem mais página para carregar
                            if (this_.RolamentoMeusCarros.next_skip < 0 || this_.RolamentoMeusCarros.next_offset < 0) {
                                return;
                            } else {
                                this_.TotPaginasFor = numPageClicked + (this_.QtdPaginas - 1);

                                // Ocultar lista anteriores
                                for (let i = 1; i <= this_.QtdPaginas; i++) {
                                    this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                                }

                                // Carregar Proximos
                                this_.CarregarPaginas(numPageClicked);
                            }
                        }
                    }
                }
            }

            this_.spa.find('ul.pagination.meus_carros li.page-item.active').attr('class', 'page-item');
            this_.spa.find(`ul.pagination.meus_carros li.page-item[numPage="${numPageClicked}"]`).attr('class', 'page-item active');

            html_meus_carros.find(`div[numPage="${paginaAtual}"]`).each(function (i, element) {
                $(this).css('display', 'none');
            });

            html_meus_carros.find(`div[numPage="${numPageClicked}"]`).each(function (i, element) {
                $(this).css('display', 'block');
            });

            this_.PaginaAtual = numPageClicked;

            //let target = this_.spa.find('ul.pagination.meus_carros').offset().top;
            //$("html, body").animate( { scrollTop: target } );
        });
    },

    ObterMeusCarros: function () {
        var this_ = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: StorageGetItem('api') + '/v1/mobile/carros?orderby=' + this_.RolamentoMeusCarros.orderby + '&offset=' + this_.RolamentoMeusCarros.offset + '&skip=' + this_.RolamentoMeusCarros.skip + '&lote=' + this_.RolamentoMeusCarros.lote + '&meus_carros=1',
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

    CarregarComboOrdernacao: function () {
        var this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/ordenacao',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                let menu_ordernacao = this_.spa.find('#order_by_meus_carros');
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

    CarregarDetalhes: function () {
        var this_ = this;

        let params = {};
        params['orderby'] = 1;
        params['meus_carros'] = 1;
        params['analitico'] = 1;
        
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
                    this_.spa.find('#meus_carros').text('Meus Carros (' + result.encontrados + ')');
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

    CarregarRolamentoPadrao : function(){
        this.RolamentoMeusCarros.orderby = 1;
        this.RolamentoMeusCarros.offset = 0;
        this.RolamentoMeusCarros.skip = 0;
        this.RolamentoMeusCarros.lote = 9;
        this.RolamentoMeusCarros.favoritos = 0;
        this.RolamentoMeusCarros.next_skip = 0;
        this.RolamentoMeusCarros.next_offset = 0;
    },

    CarregarPaginas: async function (pagina = 1) {
        var this_ = this;

        const atividadeLocal = this_.UltimaAtivadadeCarregamento = new Object();

        let exibirPagina = true;

        let pagination = this_.spa.find('ul.pagination.meus_carros');
        let html_meus_carro= this_.spa.find("#segm_meus_carros");

        pagination.find('li#pag_proximo').remove();

        for (let i = pagina; i <= this_.TotPaginasFor; i++) {

            let result = await this_.ObterMeusCarros();

            if(atividadeLocal !== this_.UltimaAtivadadeCarregamento){
                return;
            }

            if(i == 1){
                pagination.empty();
                html_meus_carro.empty();
                pagination.append('<li class="page-item" id="pag_anterior"><a class="page-link" href="#"><i class="icon-arrow"></i></a></li>');
            }
            
            this_.RolamentoMeusCarros.offset = result.offset;
            this_.RolamentoMeusCarros.lote = result.lote;
            this_.RolamentoMeusCarros.skip = result.next_skip;
            this_.RolamentoMeusCarros.next_skip = result.next_skip;
            this_.RolamentoMeusCarros.next_offset = result.next_offset;

            let meus_carros = result.registros;

            if (meus_carros.length > 0) {
                let html_meus_carro = this_.spa.find("#segm_meus_carros");

                $.each(meus_carros, function (j, carro) {
                    html_meus_carro.append(this_.HtmlMeusCarros(carro, i, exibirPagina));

                    this_.PaginaAtual = pagina;
                });

                pagination.append(this_.HtmlPagination(i, exibirPagina))
                exibirPagina = false;
                this_.RolamentoMeusCarros.offset = this_.RolamentoMeusCarros.next_offset;
                this_.RolamentoMeusCarros.skip = this_.RolamentoMeusCarros.next_skip;
            }
            if (this_.RolamentoMeusCarros.next_skip < 0 || this_.RolamentoMeusCarros.next_offset < 0) {
                break;
            }
        }

        pagination.append('<li class="page-item" id="pag_proximo"><a class="page-link" href="#"><i class="icon-arrow_2"></i></a></li>');

        this_.PaginaAtual = pagina;
    },

    ExcluirCarro : function(produto_id){
        $.ajax({
            url: StorageGetItem("api") + '/v1/mobile/carros/' + produto_id,
            type: "DELETE", cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                Mensagem('Anúncio excluido com êxito!', 'success');
            },
            error: function (request, textStatus, errorThrown) {
                //console.log(errorThrown);
                /*
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'error');
                    } catch (error) {
                        Mensagem(request.responseText, 'error');
                    }
                }
                */
            }
        });
    },

    FavoritarDesfavoritar: function (ref) {
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

    HtmlMeusCarros: function (meu_carro, numPage, exibirPagina) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + meu_carro.id + '/imagens/' + meu_carro.imagem_hash + '?tipo=principal';

        return `<div class="col-lg-4 col-md-4 col-sm-6 " data-wow-delay="0.2s" produto_id="${meu_carro.id}" numPage="${numPage}" style="display: ${exibirPagina ? "block" : "none"};">
                    <div class="l_collection_item orange grid_four red">
                        <div class="car_img">
                            <a href="detalhes-produto.html?carro=${meu_carro.id}"><img class="img-fluid" src="${url_imagem}" alt="Imagem principal"></a>
                            ${SegmentoCarros.HtmlFaixaSuperiorProduto(meu_carro, 15, 20, 20)}
                        </div>
                        <div class="text_body">
                            <a href="product-details.html"><h4>${meu_carro.marca} - ${meu_carro.modelo}</h4></a>
                            <h5>${meu_carro.preco}</h5>
                            <p>Ano/Modelo: <span>${meu_carro.ano}</span></p>
                            <p>Quilometragem: <span>${meu_carro.km.split(' ')[0]}</span></p>
                        </div>
                        <div class="cat_list" style="inline-block">
                            <a style="background:#FF2A39; color:#fff; text-decoration:none; padding:5px;" href="cadastro_carro.html?id_produto=${meu_carro.id}" class="icon-edit1"> Editar</a>
                            <a style="background:#FF2A39; color:#fff; text-decoration:none; padding:5px;" href="#" class="icon-remove" id="excluir-carro" carro="${meu_carro.id}"> Excluir</a>
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