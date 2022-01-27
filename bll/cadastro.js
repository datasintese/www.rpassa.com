; (function ($) {
    "use strict";

    var target = $('body section.create_account_area');

    $("html, body").animate( { scrollTop: target.height() - 280 } );

    $('#cpf').focus();
    
    $("input").focus( function() {
        $(this).select();
    });

    $('#cpf').inputmask('999.999.999-99');
    $('#data-nascimento').inputmask('99/99/9999');
    $('#celular').inputmask('(99) 9 9999-9999');

    $('#cadastro').click(function(event){
        event.preventDefault();

        let cpf_i = $('#cpf').val();
        let dataInput = $('#data-nascimento').val();
        let email_i = $('#email').val();
        let celular_i = $('#celular').val();
        let senha_i = $('#password').val();
        let confirma_senha_i = $('#c-password').val();

        let data_nascimento_i = dateToMysql(dataInput);

        $.ajax({
            url: StorageGetItem("api") + '/v1/usuarios',
            type: "POST", cache:false, async:true, dataType:'json',
            data: {
                cpf: cpf_i,
                data_nascimento: data_nascimento_i,
                email: email_i,
                celular: celular_i,
                senha: senha_i,
                confirma_senha: confirma_senha_i,
                etapa:3 // Essa etapa descreve todos os campos preenchido
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    Mensagem(result.mensagem, 'success');
                    Redirecionar('autenticacao.html');
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#cpf").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#cpf").select(); });
                    }
                }
            }
        });
    });
})(jQuery);