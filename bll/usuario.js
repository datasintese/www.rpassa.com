(function(){
    "use strict"

    var target = $('body section.create_account_area');

    $("html, body").animate( { scrollTop: target.height() - 280 } );

    let altera_dados = StorageGetItem('altera_dados');
    $('#codigo').inputmask('999-999', {autoUnmask: true});


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

    if(altera_dados == null){
        $('#etapa1').show();
        $('#etapa2').hide();
    }else{
        $('#etapa1').hide();
        $('#etapa2').show();
    }

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
                    StorageSetItem('altera_dados', 'etapa2');
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
                    StorageRemoveItem('altera_dados');
                    Mensagem(result.mensagem, 'success', function(){ Redirecionar('autenticacao.html'); });
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        console.log(obj);
                        return;
                        Mensagem(obj.mensagem, 'warning', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { $("#" + obj.campo.toLowerCase()).select(); });
                    }
                }
            }
        });
    })

})(jQuery)