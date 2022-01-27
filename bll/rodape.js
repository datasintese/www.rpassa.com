(function ($) {
    'use strict';

    $('#newsletter').submit(function (event) {
        event.preventDefault();

        $.ajax({
            url: localStorage.getItem("api") + "/v1/newsletter",
            type: "POST", cache: false, async: false, dataType: "json",
            data: {
                Email: $("#emailsubscribe").val(),
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    Mensagem(result.mensagem, 'success');
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
                $("#newsletter").trigger("reset");
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { $("#emailsubscribe").select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'warning', function () { $("#emailsubscribe").select(); });
                    }
                }
            }
        }
        );
    });
})(jQuery);