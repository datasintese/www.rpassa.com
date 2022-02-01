(function(){
    "use strict"

    var target = $('#usuario_config').offset().top;

    $("html, body").animate( { scrollTop: target - 80 } );
    
    $('#codigo').inputmask('999-999', {autoUnmask: true});
    $('#novo_celular').inputmask('(99) 9 9999-9999');

    $('#nome').prop('disabled', true);
    $('#nome').css("background-color", "#cccccc"); 

    $('#cpf').prop('disabled', true);
    $('#cpf').css("background-color", "#cccccc"); 

    $('#email').prop('disabled', true);
    $('#email').css("background-color", "#cccccc"); 

    $('#celular').prop('disabled', true);
    $('#celular').css("background-color", "#cccccc"); 
    
    $("input").focus( function() {
        $(this).select();
    });

    $('#etapa1').show();
    $('#etapa2').hide();

    if(!Logado()){
        Redirecionar('autenticacao.html');
    }

    $.ajax({
        url: StorageGetItem("api") + '/v1/usuarios',
        type: "GET", cache:false, async:true, dataType:'json',
        headers: {
            Authorization: 'Bearer ' + StorageGetItem("token")
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function (result, textStatus, request) {
            try {
                $('#cpf').val(result.cpf);
                $('#nome').val(result.nome);
                $('#email').val(result.email);
                $('#celular').val(result.telefone);
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

    $.ajax({
        url: StorageGetItem("api") + '/v1/mobile/carros/favoritos/detalhes',
        type: "GET", cache:false, async:true, dataType:'json',
        headers: {
            Authorization: 'Bearer ' + StorageGetItem("token")
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function (result, textStatus, request) {
            try {
                $('#favoritos').text('Favoritos (' + result.quantidade_favoritos + ')');
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

    $('#etapa1').submit(function(event){
        event.preventDefault();
        let email_i = $('#email').val();

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
                    Mensagem(result.mensagem, 'success', function(){ $('#codigo').focus(); });
                    $('#etapa1').hide();
                    $('#etapa2').show();

                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#email").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#email").select(); });
                    }
                }
            }
        });
    })

    $('#etapa2').submit(function(event){
        event.preventDefault();
        
        let codigo_i = $('#codigo').val();
        let novo_email_i = $('#novo_email').val();
        let novo_celular_i = $('#novo_celular').val();

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

                    $('#email').val(novo_email_i != '' ? novo_email_i : $('#email').val());
                    $('#celular').val(novo_celular_i != '' ? novo_celular_i : $('#celular').val());

                    $('#codigo').val('');
                    $('#novo_email').val('');
                    $('#novo_celular').val('');

                    $('#etapa1').show();
                    $('#etapa2').hide();


                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    }
                }
            }
        });
    })

    $('#formSenha').submit(function(event){
        event.preventDefault();
        
        let senha_atual = $('#senha-atual').val();
        let nova_senha = $('#nova-senha').val();
        let confirma_senha = $('#confirma-senha').val();

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
                    $('#senha-atual').val('');
                    $('#nova-senha').val('');
                    $('#confirma-senha').val('');

                    Mensagem(result.mensagem, 'success');
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    }
                }
            }
        });
    })
})(jQuery)