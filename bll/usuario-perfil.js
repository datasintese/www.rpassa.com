
var UsuarioPerfil = {
    spa : null,
    this_ : null,
    
    proposta : [],
    palavra_chave : "result",
    chave : null,

    RolamentoHistoricoChat : {
        offset: 0,
        lote: 15,
        next_offset: null,
        usuario_principal: null
    },

    RolamentoMensagens : {
        offset: 0,
        lote: 15,
        next_offset: null,
        usuario_principal: null
    },

    Construtor() {
        this_ = this;
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
    },

    Inicializar(){
        var target = this.spa.find('#usuario_config').offset().top;
        $("html, body").animate( { scrollTop: target - 80 } );
        
        this.spa.find('#codigo').inputmask('999-999', {autoUnmask: true});
        this.spa.find('#novo_celular').inputmask('(99) 9 9999-9999');
    
        this.spa.find('#nome').prop('disabled', true);
        this.spa.find('#nome').css("background-color", "#cccccc"); 
    
        this.spa.find('#cpf').prop('disabled', true);
        this.spa.find('#cpf').css("background-color", "#cccccc"); 
    
        this.spa.find('#email').prop('disabled', true);
        this.spa.find('#email').css("background-color", "#cccccc"); 
    
        this.spa.find('#celular').prop('disabled', true);
        this.spa.find('#celular').css("background-color", "#cccccc"); 
        
        this.spa.find("input").focus( function() {
            $(this).select();
        });
    
        this.spa.find('#etapa1').show();
        this.spa.find('#etapa2').hide();

        if(!Logado()){
            Redirecionar('autenticacao.html');
            return;
        }

        this_.spa.find("#historico_proposta").empty();

        this.CarregarDadosUsuario();
        this.CarregarDetalhesFavorito();
        this.EventSolicitarCodigoAlteracaoDados();
        this.EventAlterarDadosUsuario();
        this.EventAlterarSenhaUsuario();
        this.ObterHistoricoProposta();
        this.EventEscutarScrollHistoricoProposta();
        this.EventEscutarScrollHistoricoMensagem();
    },

    CarregarDadosUsuario : function(){
        $.ajax({
            url: StorageGetItem("api") + '/v1/usuarios',
            type: "GET", cache:false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    this_.spa.find('#cpf').val(result.cpf);
                    this_.spa.find('#nome').val(result.nome);
                    this_.spa.find('#email').val(result.email);
                    this_.spa.find('#celular').val(result.telefone);
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning');
                    } catch (error) {
                        Mensagem(request.responseText, 'error');
                    }
                }
            }
        });
    },

    CarregarDetalhesFavorito : function(){
        $.ajax({
            url: StorageGetItem("api") + '/v1/mobile/carros/favoritos/detalhes',
            type: "GET", cache:false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    this_.spa.find('#favoritos').text('Favoritos (' + result.quantidade_favoritos + ')');
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

    EventSolicitarCodigoAlteracaoDados : function(){
        this_.spa.find('#etapa1').submit(function(event){
            event.preventDefault();
            let email_i = this_.spa.find('#email').val();
    
            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/dados/solicitar',
                type: 'GET', cache: false, async:true, dataType:'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data:{
                    email: email_i
                },
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        Mensagem(result.mensagem, 'success', function(){ this_.spa.find('#codigo').focus(); });
                        this_.spa.find('#etapa1').hide();
                        this_.spa.find('#etapa2').show();
    
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
        });
    },

    EventAlterarDadosUsuario: function(){
        this.spa.find('#etapa2').submit(function(event){
            event.preventDefault();
            
            let codigo_i = this_.spa.find('#codigo').val();
            let novo_email_i = this_.spa.find('#novo_email').val();
            let novo_celular_i = this_.spa.find('#novo_celular').val();
    
            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/dados/concluir',
                type: 'PUT', cache: false, async:true, dataType:'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data:{
                    codigo: codigo_i,
                    novo_email: novo_email_i,
                    novo_celular: novo_celular_i,
                },
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        Mensagem(result.mensagem, 'success');
    
                        this_.spa.find('#email').val(novo_email_i != '' ? novo_email_i : this_.spa.find('#email').val());
                        this_.spa.find('#celular').val(novo_celular_i != '' ? novo_celular_i : this_.spa.find('#celular').val());
    
                        this_.spa.find('#codigo').val('');
                        this_.spa.find('#novo_email').val('');
                        this_.spa.find('#novo_celular').val('');
    
                        this_.spa.find('#etapa1').show();
                        this_.spa.find('#etapa2').hide();
    
                    } catch (error) {
                        Mensagem(JSON.stringify(result), 'success');
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    if (!MensagemErroAjax(request, errorThrown)) {
                        try {
                            var obj = $.parseJSON(request.responseText)
                            Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                        } catch (error) {
                            Mensagem(request.responseText, 'error', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                        }
                    }
                }
            });
        });
    },
    
    EventAlterarSenhaUsuario : function(){
        this_.spa.find('#formSenha').submit(function(event){
            event.preventDefault();
            
            let senha_atual = this_.spa.find('#senha-atual').val();
            let nova_senha = this_.spa.find('#nova-senha').val();
            let confirma_senha = this_.spa.find('#confirma-senha').val();
    
            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/senha',
                type: 'PUT', cache: false, async:true, dataType:'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data:{
                    SenhaAtual: senha_atual,
                    NovaSenha: nova_senha,
                    ConfirmaSenha: confirma_senha,
                },
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        this_.spa.find('#senha-atual').val('');
                        this_.spa.find('#nova-senha').val('');
                        this_.spa.find('#confirma-senha').val('');
    
                        Mensagem(result.mensagem, 'success');
                    } catch (error) {
                        Mensagem(JSON.stringify(result), 'success');
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    if (!MensagemErroAjax(request, errorThrown)) {
                        try {
                            var obj = $.parseJSON(request.responseText)
                            Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                        } catch (error) {
                            Mensagem(request.responseText, 'error', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                        }
                    }
                }
            });
        });
    },

    ObterHistoricoProposta : function(){
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/propostas/historico?offset=' + this_.RolamentoHistoricoChat.offset + '&lote=' + this_.RolamentoHistoricoChat.lote,
            type: 'GET', cache: false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {

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

    HtmlHistoricoProposta : function(historico_proposta){
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + historico_proposta.id_produto + '/imagens/' + historico_proposta.imagem_hash + '?tipo=principal';

        this_.proposta[this_.palavra_chave + historico_proposta.id] = {
            id_produto : historico_proposta.id_produto,
            usuario : this_.RolamentoHistoricoChat.usuario_principal === historico_proposta.usuario_id_de ? historico_proposta.usuario_id_para: historico_proposta.usuario_id_de,
            nome_usuario : this_.RolamentoHistoricoChat.usuario_principal === historico_proposta.usuario_id_de ? historico_proposta.nome_para: historico_proposta.nome_de
        };

        return `<li class="clearfix conversa" id="${this_.palavra_chave + historico_proposta.id}">
            <img src="${url_imagem}" alt="avatar">
            <div class="about">
                <div class="name">${this_.proposta[this_.palavra_chave + historico_proposta.id].nome_usuario}</div>
                <div class="status"> <i class="fa fa-circle offline"></i> ${historico_proposta.tempo_corrido_ult_conversa} </div>                                            
            </div>
        </li>`
    },

    EventEscutarScrollHistoricoProposta : function(){
        this_.spa.find(".people-list").scroll(function(){
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 1) {
                if(this_.RolamentoHistoricoChat.next_offset > -1){
                    this_.RolamentoHistoricoChat.offset = this_.RolamentoHistoricoChat.next_offset;
                    this_.ObterHistoricoProposta();
                }
            }
        });
    },

    ObterMensagensProposta : function(chave, isRolamento){
        let obj = this_.proposta[chave];
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens/historico?offset=' + this_.RolamentoMensagens.offset + '&lote=' + this_.RolamentoMensagens.lote + '&produto_id=' + obj.id_produto,
            type: 'GET', cache: false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {

                    console.log(result);

                    this_.RolamentoMensagens.offset = result.offset;
                    this_.RolamentoMensagens.lote = result.lote;
                    this_.RolamentoMensagens.next_offset = result.next_offset;
                    this_.RolamentoMensagens.usuario_principal = result.usuario_principal;
                    let historico_mensagem = result.registros;

                    let hist_mensagem = this_.spa.find("#historico_mensagem");

                    if(!isRolamento){
                        this_.spa.find("#cabecalho_proposta").empty();
                        this_.spa.find("#cabecalho_proposta").append(this_.HtmlCabecalhoMensagem(obj.nome_usuario));
                        hist_mensagem.empty();
                    }

                    $.each(historico_mensagem, function (i, historico) {
                        hist_mensagem.prepend(this_.HtmlMensagemProposta(historico));
                    });

                    let hist_scroll = hist_mensagem.parent();
                    if(!isRolamento){
                        hist_scroll.prop("scrollTop", hist_scroll.prop("scrollHeight"));
                    }else{
                        alert(hist_scroll.scrollTop());
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

    HtmlMensagemProposta : function(historico_mensagem){

        if(this_.RolamentoHistoricoChat.usuario_principal === historico_mensagem.usuario_id_de){
            return `<li class="clearfix">
                        <div class="message-data text-right">
                            <span class="message-data-time">${historico_mensagem.data_hora}</span>
                        </div>
                        <div class="message other-message float-right">${historico_mensagem.mensagem}</div>
                    </li>`
        }
        else{
            return `<li class="clearfix">
                        <div class="message-data">
                            <span class="message-data-time">${historico_mensagem.data_hora}</span>
                        </div>
                        <div class="message my-message">${historico_mensagem.mensagem}</div>                                    
                    </li>`
        }
    },

    HtmlCabecalhoMensagem(nomeUsuario){
        return `<div class="row">
                    <div class="col-lg-6">
                        <div class="chat-about">
                            <h6 class="m-b-0">${nomeUsuario}</h6>
                        </div>
                    </div>
                </div>`;
    },

    EventObterMensagemUsuarioSelecionado(){
        let historicoProposta = this_.spa.find("li.clearfix.conversa");
        historicoProposta.click(function(){
            this_.chave = $(this).attr('id');
            this_.ObterMensagensProposta(this_.chave, false);
        });
    },

    RemoverAssinaturaEvento(){
        let historicoProposta = this_.spa.find("li.clearfix.conversa");
        historicoProposta.off('click');
    },

    EventEscutarScrollHistoricoMensagem : function(){
        this_.spa.find("#historico_mensagem").parent().scroll(function(){
            if($(this).scrollTop() <= 0) {
                if(this_.RolamentoMensagens.next_offset > -1){
                    this_.RolamentoMensagens.offset = this_.RolamentoMensagens.next_offset;
                    this_.ObterMensagensProposta(this_.chave, true);
                }
            }
        });
    },
};