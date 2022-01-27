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
        let cpf_i = $('#cpf').val();
        let [dia, mes, ano] = $('#data-nascimento').val().split('/');
        let email_i = $('#email').val();
        let celular_i = $('#celular').val();
        let senha_i = $('#password').val();
        let confirma_senha_i = $('#c-password').val();

        let data_nascimento_i = ano + '-' + mes + '-' + dia;

        $.ajax({
            url: StorageGetItem("api") + '/v1/usuarios',
            type: "POST", cache:false, async:true, dataType:'json',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: {
                cpf: cpf_i,
                data_nascimento: data_nascimento_i,
                email: email_i,
                celular: celular_i,
                senha: senha_i,
                confirma_senha: confirma_senha_i,
                etapa:3 // Essa etapa descreve todos os campos preenchido
            },
            success: function(request, textStatus, errorThrown){
                alert(request.responseText);
            },
            error:function(request, textStatus, errorThrown){
                alert(request.responseText);
                var mensagem = undefined;
                try {
                    var obj = $.parseJSON(request.responseText)
                    mensagem = obj.mensagem;
                } catch (error) {
                    mensagem = request.responseText;
                }
            }
        });
    });
})(jQuery);