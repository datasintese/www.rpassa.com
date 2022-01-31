(function($){
    "use strict"
    var target = $('section.create_account_area').offset().top;

    $("html, body").animate( { scrollTop: target } );
    $('#email').focus();

    $('#codigo').inputmask('999-999', {autoUnmask: true});

    $('#etapa1').show();
    $('#etapa2').hide();

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
                        Mensagem(obj.mensagem, 'error');
                    } catch (error) {
                        Mensagem(request.responseText, 'error');
                    }
                }
            }
        });
    })

    $('#etapa2').submit(function(event){
        event.preventDefault();
        
        //$('#codigo').unmask();
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