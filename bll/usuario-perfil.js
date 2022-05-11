

var UsuarioPerfil = {
    spa : null,
    menu_tela : null,

    Construtor() {
        this_ = this;
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
        this.menu_tela = 'perfil';
    },

    Inicializar() {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        var target = this.spa.find('#usuario_config').offset().top;
        $("html, body").animate({ scrollTop: target - 80 });

        this.spa.find('#codigo').inputmask('999-999', { autoUnmask: true });
        this.spa.find('#novo_celular').inputmask('(99) 9 9999-9999');

        this.spa.find('#nome').prop('disabled', true);
        this.spa.find('#nome').css("background-color", "#cccccc");

        this.spa.find('#cpf').prop('disabled', true);
        this.spa.find('#cpf').css("background-color", "#cccccc");

        this.spa.find('#email').prop('disabled', true);
        this.spa.find('#email').css("background-color", "#cccccc");

        this.spa.find('#celular').prop('disabled', true);
        this.spa.find('#celular').css("background-color", "#cccccc");

        this.spa.find("input").focus(function () {
            $(this).select();
        });

        this.spa.find('#etapa1').show();
        this.spa.find('#etapa2').hide();

        if (!Logado()) {
            Redirecionar('autenticacao.html');
            return;
        }
        
        this.CarregarDadosUsuario();
        this.EventSolicitarCodigoAlteracaoDados();
        this.EventAlterarDadosUsuario();
        this.EventMenuClickPerfil();
    },

    CarregarDadosUsuario: function () {
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

    EventSolicitarCodigoAlteracaoDados: function () {
        var this_ = this;
        this_.spa.find('#etapa1').submit(function (event) {
            event.preventDefault();
            let email_i = this_.spa.find('#email').val();

            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/dados/solicitar',
                type: 'GET', cache: false, async: true, dataType: 'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data: {
                    email: email_i
                },
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        Mensagem(result.mensagem, 'success', function () { this_.spa.find('#codigo').focus(); });
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

    EventAlterarDadosUsuario: function () {
        var this_ = this;
        this.spa.find('#etapa2').submit(function (event) {
            event.preventDefault();
            let codigo_i = this_.spa.find('#codigo').val();
            let novo_email_i = this_.spa.find('#novo_email').val();
            let novo_celular_i = this_.spa.find('#novo_celular').val();

            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/dados/concluir',
                type: 'PUT', cache: false, async: true, dataType: 'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data: {
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

    EventMenuClickPerfil : function(){
        let this_ = this;
        $(document.body).on('click', '#perfil-tab', function(){
            DeletarTagQueryStringURL('menu', this_.menu_tela);
            AdicionarTagQueryStringURL('menu', this_.menu_tela);
        });
    }
}