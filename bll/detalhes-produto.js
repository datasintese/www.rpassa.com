; (function ($) {
    "use strict";

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.hasOwnProperty('carro')) {
        DetalhesCarro.Construtor(params);
        DetalhesCarro.Inicializar();
    }
    else if (params.hasOwnProperty('moto')) {
        
    }
    else if (params.hasOwnProperty('aviao')) {
        
    }
    else if (params.hasOwnProperty('embarcacao')) {
        
    }
    else if (params.hasOwnProperty('imovel')) {
        
    }
    else
    {
        window.history.back();
    }

})(jQuery);