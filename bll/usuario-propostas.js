var UsuarioProposta = {
    spa : null,

    proposta : [],
    palavra_chave : "result",
    chave : null,
    
    scrollAnterior : null, // Paginação da mensagem

    client: null,

    RolamentoHistoricoChat: {
        offset: 0,
        lote: 15,
        next_offset: null,
        usuario_principal: null
    },

    RolamentoMensagens: {
        offset: 0,
        lote: 15,
        next_offset: null,
        usuario_principal: null
    },

    Intervalo : null,

    UltimaAtivadade : null,

    Construtor(){
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
    },

    Inicializar(){
        this.spa.find("#historico_proposta").empty();
        this.EventEscutarScrollHistoricoMensagem();
        this.EventEnviarMensagem();
        this.EventMenuPropostaClick();
        this.CarregarDetalhesProposta();
    },

    CarregarDetalhesProposta: function () {
        var this_ = this;
        $.ajax({
            url: StorageGetItem("api") + '/v1/usuarios',
            type: "GET", cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    this_.spa.find('#minhas_propostas').text('Minhas Propostas (' + result.quantidade_propostas + ')');
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

    EventMenuPropostaClick: async function () {
        var this_ = this;
        this_.spa.find("#nav_propostas").click(function () {

            this_.RemoverAssinaturaEventoScrollHistorico();

            this_.spa.find("#historico_proposta").empty();
            this_.spa.find("#historico_mensagem").empty();
            this_.spa.find("#cabecalho_proposta").empty();

            this_.proposta = [];

            this_.RolamentoHistoricoChat.offset = 0;
            this_.RolamentoHistoricoChat.lote = 15;
            this_.RolamentoHistoricoChat.next_offset = null;
            this_.RolamentoHistoricoChat.usuario_principal = null;

            this_.ObterHistoricoProposta();
        });
    },
    
    EventEscutarScrollHistoricoProposta: function () {
        var this_ = this;
        this_.spa.find(".people-list").scroll(function () {
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 1) {
                if (this_.RolamentoHistoricoChat.next_offset > -1) {
                    this_.RolamentoHistoricoChat.offset = this_.RolamentoHistoricoChat.next_offset;
                    this_.ObterHistoricoProposta();
                }
            }
        });
    },

    EventObterMensagemUsuarioSelecionado() {
        var this_ = this;
        let historicoProposta = this_.spa.find("li.clearfix.conversa");
        historicoProposta.click(function () {
            this_.chave = $(this).attr('id');
            this_.ObterMensagensProposta(this_.chave, false);
            
            this_.EscutarMensagensUsuarioSelecionado();
        });
    },

    EventEscutarScrollHistoricoMensagem: function () {
        var this_ = this;
        this_.spa.find("#historico_mensagem").parent().scroll(function () {
            if ($(this).scrollTop() <= 0) {
                this_.scrollAnterior = $(this)[0].scrollHeight;
                if (this_.RolamentoMensagens.next_offset > -1) {
                    this_.RolamentoMensagens.offset = this_.RolamentoMensagens.next_offset;
                    this_.ObterMensagensProposta(this_.chave, true);
                }
            }
        });
    },

    EventEnviarMensagem: function () {
        var this_ = this;
        this_.spa.find("#envio_mensagem").keydown(function (event) {
            if (event.keyCode === 13) {
                let mensagem = $(this).val();
                if (mensagem != '') {
                    this_.EnviarMensagem(mensagem);
                    $(this).val('');
                }
            }
        });
    },

    RemoverAssinaturaEvento() {
        var this_ = this;
        let historicoProposta = this_.spa.find("li.clearfix.conversa");
        historicoProposta.off('click');
    },

    RemoverAssinaturaEventoScrollHistorico() {
        var this_ = this;
        let historicoProposta = this_.spa.find(".people-list");
        historicoProposta.off('scroll');
    },
    ObterHistoricoProposta: function () {
        var this_ = this;
        const atividadeLocal = this_.UltimaAtivadade = new Object(); 
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/propostas/historico?offset=' + this_.RolamentoHistoricoChat.offset + '&lote=' + this_.RolamentoHistoricoChat.lote,
            type: 'GET', cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    
                    if(atividadeLocal !== this_.UltimaAtivadade){
                        return;
                    }

                    this_.RolamentoHistoricoChat.offset = result.offset;
                    this_.RolamentoHistoricoChat.lote = result.lote;
                    this_.RolamentoHistoricoChat.next_offset = result.next_offset;
                    this_.RolamentoHistoricoChat.usuario_principal = result.usuario_principal;
                    let historico_proposta = result.registros;

                    $.each(historico_proposta, function (i, historico) {
                        this_.spa.find("#historico_proposta").last().append(this_.HtmlHistoricoProposta(historico));
                    });
                    this_.RemoverAssinaturaEvento();
                    this_.EventObterMensagemUsuarioSelecionado();
                    this_.EventEscutarScrollHistoricoProposta();

                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#email").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { this_.spa.find("#email").select(); });
                    }
                }
            }
        });
    },

    EnviarMensagem: function (msg) {
        var this_ = this;
        let obj = this_.proposta[this_.chave];
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/chat/mensagens',
            type: 'POST', cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            data: {
                produto_id: obj.id_produto,
                usuario_id_para: obj.usuario,
                mensagem: msg,
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {

                    let hist_mensagem = this_.spa.find("#historico_mensagem");
                    hist_mensagem.append(this_.HtmlMensagemProposta(result));
                    hist_mensagem.parent().prop("scrollTop", hist_mensagem.parent().prop("scrollHeight"));

                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#email").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { this_.spa.find("#email").select(); });
                    }
                }
            }
        });
    },

    ObterMensagensProposta: function (chave, isRolamento) {
        var this_ = this;
        let obj = this_.proposta[chave];
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens/historico?offset=' + this_.RolamentoMensagens.offset + '&lote=' + this_.RolamentoMensagens.lote + '&produto_id=' + obj.id_produto,
            type: 'GET', cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {

                    this_.RolamentoMensagens.offset = result.offset;
                    this_.RolamentoMensagens.lote = result.lote;
                    this_.RolamentoMensagens.next_offset = result.next_offset;
                    this_.RolamentoMensagens.usuario_principal = result.usuario_principal;
                    let historico_mensagem = result.registros;

                    let hist_mensagem = this_.spa.find("#historico_mensagem");

                    if (!isRolamento) {
                        this_.spa.find("#cabecalho_proposta").empty();
                        this_.spa.find("#cabecalho_proposta").append(this_.HtmlCabecalhoMensagem(obj.nome_usuario));
                        hist_mensagem.empty();
                    }

                    $.each(historico_mensagem, function (i, historico) {
                        hist_mensagem.prepend(this_.HtmlMensagemProposta(historico));
                    });

                    let hist_scroll = hist_mensagem.parent();
                    if (!isRolamento) {
                        hist_scroll.prop("scrollTop", hist_scroll.prop("scrollHeight"));
                    } else {
                        hist_scroll.prop("scrollTop", hist_scroll.prop("scrollHeight") - this_.scrollAnterior);
                    }

                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#email").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { this_.spa.find("#email").select(); });
                    }
                }
            }
        });
    },

    EscutarMensagensUsuarioSelecionado: async function () {
        var this_ = this;
        let obj = this_.proposta[this_.chave];

        if(this_.Intervalo != null){
            clearInterval(this_.Intervalo);
        }

        this_.Intervalo = setInterval( function(){
            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/proposta/mensagens?produto_id=' + obj.id_produto,
                type: 'GET', cache: false, async:true, dataType:'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        if(result.length>0){
                            let hist_mensagem = this_.spa.find("#historico_mensagem");
                            $.each(result, function (i, mensagem) {
                                hist_mensagem.append(this_.HtmlMensagemProposta(mensagem));
                                hist_mensagem.parent().prop("scrollTop", hist_mensagem.parent().prop("scrollHeight"));
                            });
                        }
                    } catch (error) {
                        Mensagem(JSON.stringify(result), 'success');
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    /*
                    if (!MensagemErroAjax(request, errorThrown)) {
                        try {
                            var obj = $.parseJSON(request.responseText)
                            Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#email").select(); });
                        } catch (error) {
                            Mensagem(request.responseText, 'error', function () { this_.spa.find("#email").select(); });
                        }
                    }
                    */
                }
            });
        },1000)
    },

    HtmlHistoricoProposta: function (historico_proposta) {
        var this_ = this;
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + historico_proposta.id_produto + '/imagens/' + historico_proposta.imagem_hash + '?tipo=principal';

        this_.proposta[this_.palavra_chave + historico_proposta.id] = {
            id_produto: historico_proposta.id_produto,
            usuario: this_.RolamentoHistoricoChat.usuario_principal === historico_proposta.usuario_id_de ? historico_proposta.usuario_id_para : historico_proposta.usuario_id_de,
            nome_usuario: this_.RolamentoHistoricoChat.usuario_principal === historico_proposta.usuario_id_de ? historico_proposta.nome_para : historico_proposta.nome_de
        };

        return `<li class="clearfix conversa" id="${this_.palavra_chave + historico_proposta.id}">
            <img src="${url_imagem}" alt="avatar">
            <div class="about">
                <div class="name">${this_.proposta[this_.palavra_chave + historico_proposta.id].nome_usuario}</div>
                <div class="status"> ${historico_proposta.mensagem} </div>  
                <div class="status"> ${historico_proposta.tempo_corrido_ult_conversa} </div>    
                <div class="status"> ${historico_proposta.status_anuncio === 'PUBLICO' ? 'Produto ativo': 'Produto inativo' } </div>                                           
            </div>
        </li>`
    },

    HtmlCabecalhoMensagem(nomeUsuario) {
        return `<div class="row">
                    <div class="col-lg-6">
                        <div class="chat-about">
                            <h6 class="m-b-0">${nomeUsuario}</h6>
                        </div>
                    </div>
                </div>`;
    },

    HtmlMensagemProposta: function (historico_mensagem) {
        var this_ = this;
        if (this_.RolamentoHistoricoChat.usuario_principal === historico_mensagem.usuario_id_de) {
            return `<li class="clearfix">
                        <div class="message-data text-right">
                            <span class="message-data-time">${historico_mensagem.data_hora}</span>
                        </div>
                        <div class="message other-message float-right">${historico_mensagem.mensagem}</div>
                    </li>`
        }
        else {
            return `<li class="clearfix">
                        <div class="message-data">
                            <span class="message-data-time">${historico_mensagem.data_hora}</span>
                        </div>
                        <div class="message my-message">${historico_mensagem.mensagem}</div>                                    
                    </li>`
        }
    },
}