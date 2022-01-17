; (function ($) {
    "use strict";

    SegmentoCarros.Construtor();
    SegmentoMotos.Construtor();

    Init();
    function Init() {
        let segmento = 'carros';
        $('.segmento#' + segmento).show();

        SegmentoCarros.InicializarSegmento();
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
                SegmentoCarros.InicializarSegmento();
            }
            else if (segmento == 'motos') {
                SegmentoMotos.InicializarSegmento();
            }
        } catch (error) {
        }
    });
})(jQuery);