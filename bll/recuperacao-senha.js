(function($){
    "use strict"
    var target = $('body section.create_account_area');

    $("html, body").animate( { scrollTop: target.height() - 150 } );
    $('#email').focus();

    let recupera_senha = StorageGetItem('recupera_senha');
    $('#codigo').inputmask('999-999');

    if(recupera_senha == null){
        $('#etapa1').show();
        $('#etapa2').hide();
    }else{
        $('#etapa1').hide();
        $('#etapa2').show();
    }

    $("input").focus( function() {
        $(this).select();
    });

    $('#etapa1').submit(function(event){
        event.preventDefault();
        let email_i = $('#email').val();

        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/senha/solicitar',
            type: 'GET', cache: false, async:true, dataType:'json',
            data:{
                email: email_i
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    StorageSetItem('recupera_senha', 'etapa2');
                    Mensagem(result.mensagem, 'success');
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
        let nova_senha_i = $('#password').val();
        let confirma_senha_i = $('#c-password').val();

        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/senha/concluir',
            type: 'PUT', cache: false, async:true, dataType:'json',
            data:{
                Codigo: codigo_i,
                NovaSenha: nova_senha_i,
                ConfirmaSenha: confirma_senha_i,
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    StorageRemoveItem('recupera_senha');
                    Mensagem(result.mensagem, 'success', function(){ Redirecionar('autenticacao.html'); });
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#codigo").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#codigo").select(); });
                    }
                }
            }
        });
    })
})(jQuery)