
var UsuarioPerfil = {
    spa : null,
    this_ : null,
    
    proposta : [],
    palavra_chave : "result",
    chave : null,
    
    scrollAnterior : null, // Paginação da mensagem

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
        this.EventEnviarMensagem();
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

                    //console.log(result);

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
            this_.EscutarMensagensUsuarioSelecionado();
        });
    },

    RemoverAssinaturaEvento(){
        let historicoProposta = this_.spa.find("li.clearfix.conversa");
        historicoProposta.off('click');
    },

    EventEscutarScrollHistoricoMensagem : function(){
        this_.spa.find("#historico_mensagem").parent().scroll(function(){
            if($(this).scrollTop() <= 0) {
                this_.scrollAnterior = $(this)[0].scrollHeight;
                if(this_.RolamentoMensagens.next_offset > -1){
                    this_.RolamentoMensagens.offset = this_.RolamentoMensagens.next_offset;
                    this_.ObterMensagensProposta(this_.chave, true);
                }
            }
        });
    },

    EventEnviarMensagem : function(){
        this_.spa.find("#envio_mensagem").keydown(function(event) {
            if (event.keyCode === 13) {
                let mensagem = $(this).val();
                if(mensagem != ''){
                    this_.EnviarMensagem(mensagem);
                    $(this).val('');
                }
            }
        });
    },

    EnviarMensagem: function(msg){
        let obj = this_.proposta[this_.chave];
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/chat/mensagens',
            type: 'POST', cache: false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            data: {
                produto_id : obj.id_produto,
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

    EscutarMensagensUsuarioSelecionado : async function(){
        let obj = this_.proposta[this_.chave];

        let client = new XMLHttpRequest();
        client.multipart = true;
        client.open('GET', StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto, true);
        client.setRequestHeader('Authorization', 'Bearer ' + StorageGetItem("token"));
        client.setRequestHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
        client.setRequestHeader('Connection', 'keep-alive');

        let boundary = "";
        let lastBytesRead = 0;
        client.onreadystatechange = function () {
            if (client.readyState == 2) {
                console.log("Conectado!");

                let contentType = client.getResponseHeader("Content-Type");
                let type = contentType.split(';');
                let subTypeBoundary = type.find(element => element.trim().startsWith('boundary')).trim();
                let boundSplit = subTypeBoundary.split('=')
                boundary = boundSplit[1];
            }
            else if (client.readyState == 3) {

                let part = client.responseText.substring(lastBytesRead);
                lastBytesRead = client.responseText.length;
                let boundaryPart = part.split('\r\n\r\n');
                boundaryPart = boundaryPart[1];
                let idx = boundaryPart.lastIndexOf('\r\n--' + boundary + '\r\n');
                if(idx > -1){
                    boundaryPart = boundaryPart.substring(0, idx);
                }
                let resFinal = JSON.parse(boundaryPart);
                
                let hist_mensagem = this_.spa.find("#historico_mensagem");

                $.each(resFinal, function (i, mensagem) {
                    hist_mensagem.append(this_.HtmlMensagemProposta(mensagem));
                    hist_mensagem.parent().prop("scrollTop", hist_mensagem.parent().prop("scrollHeight"));
                });
            }
            else if (client.readyState == 4) {
                console.log("Desconectado!");
            }
            else {
                console.log(client.response);
            }
        }

        client.send();

        /*
        let cabecalho = {
               method: 'GET',
               headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
                'Connection': 'keep-alive',
                'Authorization': 'Bearer ' + StorageGetItem("token")
               },
               cache: 'default',
               async: true
       

        var oReq = new XMLHttpRequest();

        oReq.open('GET', StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto);

        oReq.setRequestHeader('Accept', 'application/json');
        oReq.setRequestHeader('Authorization', 'Bearer ' + StorageGetItem("token"));
        oReq.setRequestHeader('contentType', 'multipart/x-mixed-replace; boundary=frame');
        //oReq.setRequestHeader('Connection', 'keep-alive');

       
       

        oReq.onprogress = function(event){
            console.log(event);
        }
        oReq.onload = function(event){
            console.log(event);
        }
        oReq.onerror = function(event){
            console.log(event);
        }
        oReq.onabort = function(event){
            console.log(event);
        }

        oReq.send();

        /*
        const evtSource = new EventSource(StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto, cabecalho );
        
        evtSource.onmessage = function(event) {
            console.log(event);
        };

        evtSource.onerror = function(err) {
            console.error("EventSource failed:", err);
        };
        evtSource.OPEN();
        */
        

        /*
        let response = await fetch(StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto, cabecalho)

        let reader = await response.body.getReader();

        let cont = 0
        while(true){
            let teste = await reader.read();
            //if(teste.done) {
             //   reader = await response.body.getReader();
            //    setTimeout(1000);
            //}
            if(teste != null){
                let texto = new TextDecoder('utf-8').decode(teste.value);
                if(texto != ''){
                    let jsonRes = JSON.stringify(texto);
                    let resFinal = JSON.parse(jsonRes);
                    console.log(resFinal);
                }
            }
            // cont++;
        }
        //reader.cancel();
        //reader.closed();

        /* 
        var r = new XMLHttpRequest();
        
        r.multipart = true;
        r.open('GET', StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto, true);
        r.setRequestHeader('ContentType', "multipart/x-mixed-replace; boundary=frame")
        r.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); //Mágica aqui
        r.overrideMimeType("application/json;charset=utf-8");

        r.responseType = "json";
        r.onmessage = function(e) {
            var arraybuffer = r.response; // não é responseText
            console.log(arraybuffer);
        }
        r.send();

        r.onreadystatechange = function () {
            console.log(r.responseText.length);
        };
        r.onprogress = function(){
            alert('progess');
        };
        r.onupdateProgress = function(){
            alert('updateProgress');
        };
        r.onload = function(){
            alert('load');
        };
        r.ontransferComplete = function(){
            alert('transferComplete');
        };
        r.onerror = function(){
            alert('error');
        };
        r.onabort = function(){
            alert('abort');
        };
        r.send();
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/' + obj.usuario + '/chat/mensagens?produto_id=' + obj.id_produto ,
            type: 'GET', cache: false, async:true, dataType:'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            contentType: "multipart/x-mixed-replace; boundary=frame",
            success: function (result, textStatus, request) {
                try {
                    console.log(result);
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

        var r = new XMLHttpRequest();
        r.multipart = true;
        r.open('GET', '/', true);
        r.onreadystatechange = function () {
            console.log(r.responseText.length);
        };
        r.send();
        */
    }
}