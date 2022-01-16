;(function($) {
    "use strict";

    // Inicialização de Combos de Pesquisa
    // -----------------------------------

    $('.nice_select#categoria').empty().append('<option selected="selected" value="0">Categoria</option>');
    $('.nice_select#categoria').niceSelect('update');

    $('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
    $('.nice_select#modelo').niceSelect('update');

    $('.nice_select#quilometragem').empty().append('<option selected="selected" value="0">Quilometragem</option>');
    $('.nice_select#quilometragem').niceSelect('update');

    $('.nice_select#marca').empty().append('<option selected="selected" value="0">Marca</option>');
    $('.nice_select#marca').niceSelect('update');

    // Carregamento de dados das Combos
    // --------------------------------

    CarregarComboCategoria();
    CarregarComboMarca();
    CarregarComboQuilometragem();

    $('.nice_select#marca').on('change', function(event){
        event.preventDefault()
        CarregarComboModelo(this.value);
    });

    function CarregarComboCategoria()
    {
        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/categorias',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {
                
                $.each(result, function(i, obj){
                    $('.nice_select#categoria').last()
                        .append('<option value="' + obj.id +'">' + obj.nome + '</option>');
                });
                $('.nice_select#categoria').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                alert(JSON.stringify(request));
    
                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    }
    function CarregarComboMarca()
    {
        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/marcas',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {
                
                $.each(result, function(i, obj){
                    $('.nice_select#marca').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                $('.nice_select#marca').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                alert(JSON.stringify(request));
    
                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    }
    function CarregarComboModelo(marca_id)
    {
        $('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
        
        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/modelos?marca_id=' + marca_id,
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function(i, obj){
                    $('.nice_select#modelo').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                $('.nice_select#modelo').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                alert(JSON.stringify(request));
    
                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    }
    function CarregarComboQuilometragem()
    {
        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/carros/quilometragem',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {
                
                $.each(result, function(i, obj){
                    $('.nice_select#quilometragem').last()
                        .append('<option value="' + obj.id +'">' + obj.nome + '</option>');
                });
                $('.nice_select#quilometragem').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                alert(JSON.stringify(request));
    
                // if (!MensagemErroAjax(request, errorThrown)) {
                //     try {
                //         var obj = $.parseJSON(request.responseText)
                //         Mensagem(obj.mensagem, 'warning');
                //     } catch (error) {
                //         Mensagem(request.responseText, 'warning');
                //     }
                // }
            }
        });
    }
})(jQuery)
