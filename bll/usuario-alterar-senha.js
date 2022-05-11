var UsuarioAlterarSenha = {
    spa : null,
    menu_tela : null,

    Construtor() {
        this_ = this;
        var baseTela = '.spa.our_service_area.service_two.p_100.perfil_usuario';
        this.spa = $(baseTela);
        this.menu_tela = 'alterar-senha';
    },

    Inicializar() {

        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        this.EventAlterarSenhaUsuario();
        this.EventMenuAlterarSenhaClick();

        if('menu' in params){
            if(params['menu'] == this.menu_tela){
                this.spa.find('#profile-tab').trigger('click');
            }
        }
    },

    EventAlterarSenhaUsuario: function () {
        var this_ = this;
        this_.spa.find('#formSenha').submit(function (event) {
            event.preventDefault();

            let senha_atual = this_.spa.find('#senha-atual').val();
            let nova_senha = this_.spa.find('#nova-senha').val();
            let confirma_senha = this_.spa.find('#confirma-senha').val();

            $.ajax({
                url: StorageGetItem('api') + '/v1/usuarios/senha',
                type: 'PUT', cache: false, async: true, dataType: 'json',
                headers: {
                    Authorization: 'Bearer ' + StorageGetItem("token")
                },
                data: {
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

    EventMenuAlterarSenhaClick : function(){
        let this_ = this;
        $(document.body).on('click', '#profile-tab', function(){
            DeletarTagQueryStringURL('menu', this_.menu_tela);
            AdicionarTagQueryStringURL('menu', this_.menu_tela);
        });
    }
}