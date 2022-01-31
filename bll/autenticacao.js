(function ($) {
    'use strict';

    if (Logado()) Redirecionar('index.html'); else $('body').show();
    var target = $('section.create_account_area').offset().top;

    $("html, body").animate( { scrollTop: target} );
    $('#email').focus();
    
    $("input[type=email], [type=password]").focus( function() {
        $(this).select();
    });

    $('#autenticacao').on('click', function (event) {
        event.preventDefault();

        let email = $('#email').val();
        let senha = $('#password').val();

        $.ajax({
            url: localStorage.getItem("auth"),
            type: "POST", cache: false, async: false, dataType: "json",
            data: {
                username: email,
                password: senha,
                grant_type: 'password',
                expires_in: 86000,
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    StorageClear();
                    StorageSetItem("start", $.now());
                    StorageSetItem("expires", result.expires_in);
                    StorageSetItem("token", result.access_token);
                    StorageSetItem("refresh", result.refresh_token);
                    Mensagem(result.mensagem, 'success');
                    Redirecionar('usuario.html');
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
    });
})(jQuery);