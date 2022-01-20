; (function ($) {
    "use strict";

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    TelaCompartilhamento.Inicializar();

    if (params.hasOwnProperty('segmento')) {
        let segmento = params.segmento;

        switch (segmento) {
            case 'carros':
                SegmentoCarros.Construtor(params);
                SegmentoCarros.Inicializar();
                break;
            case 'motos':
                break;
            case 'aeronaves':
                break;
            case 'embarcacoes':
                break;
            case 'imoveis':
                break;
            default:
                break;
        }

    }
    else {
        SegmentoCarros.Construtor(params);
        SegmentoCarros.Inicializar();
    }

    $('.menu-segmento').on('click', function (event) {
        event.preventDefault();

        let segmento = $(this).attr('id'); // Obtém o nome do segmento

        // Oculta todos os segmentos da tela
        $('.segmento').each(function (obj) {
            $(this).hide();
        });

        // Exibe o segmento selecionado no menu
        try {
            $('.segmento#' + segmento).fadeIn();

            let baseTela = '.spa>.segmento#' + segmento;
            var target = $(baseTela).find('.find_form');

            // Move a página para a barra de pesquisa do segmento
            $("html, body").animate({ scrollTop: target.height() });

            if (segmento == 'carros') {
                window.location.search = 'segmento=carros';
                SegmentoCarros.Inicializar();
            }
            else if (segmento == 'motos') {
                window.location.search = 'segmento=motos';
            }
            else if (segmento == 'aeronaves') {
                window.location.search = 'segmento=aeronaves';
            }
            else if (segmento == 'embarcacoes') {
                window.location.search = 'segmento=embarcacoes';
            }
            else if (segmento == 'imoveis') {
                window.location.search = 'segmento=imoveis';

            }
        } catch (error) {
        }
    });
})(jQuery);