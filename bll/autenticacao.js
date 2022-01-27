(function ($) {
    'use strict';

    if (Logado()) Redirecionar('index.html'); else $('body').show();
    var target = $('body section.create_account_area');

    $("html, body").animate( { scrollTop: target.height() - 20 } );
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
                StorageClear();
                StorageSetItem("start", $.now());
                StorageSetItem("expires", result.expires_in);
                StorageSetItem("token", result.access_token);
                StorageSetItem("refresh", result.refresh_token);
                Redirecionar('index.html');
            },
            error: function (request, textStatus, errorThrown) {
                alert(request.responseText);

                if (!MensagemErroAjax(request, errorThrown)) {
                    var mensagem = undefined;
                    try {
                        var obj = $.parseJSON(request.responseText)
                        mensagem = obj.mensagem;
                    } catch (error) {
                        mensagem = request.responseText;
                    }
                    Mensagem(mensagem, 'warning', function () {
                        $("#email").select();
                    });
                }
            }
        });
    });

})(jQuery);