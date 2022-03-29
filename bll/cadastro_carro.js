var CadastroCarro = {

    Construtor(){
        var baseTela = '.spa.calculator_area.p_100.cadastro_carro';
        this.spa = $(baseTela);
    },

    Inicializar(){
        this.ObterMarcas();
    },

    ObterMarcas: function () {
        var this_ = this;
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/carros/marcas',
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.HtmlMarcas(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterModelos: function(){

    },

    ObterVersoes: function(){

    },

    ObterAnoFabricacaoModelo: function(){

    },

    ObterCores: function(){

    },

    ObterDetalhes: function(){

    },

    ObterEspecificacoes: function(){

    },

    HtmlMarcas : function(marcas){
        var this_ = this;
        let combo_marca_html = this_.spa.find('.combo_marca');
        combo_marca_html.empty();
        combo_marca_html.append(`<option value="0">Selecione a marca</option>`);
        $.each(marcas, function (i, marca) {
            combo_marca_html.append(`<option value="${marca.id}">${marca.nome}</option>`);
        });
        combo_marca_html.niceSelect();
        combo_marca_html.val(1).niceSelect('update');
        this_.spa.find('.nice-select').css('width', '100%');
    },

    HtmlModelos : function(){

    },

    HtmlModelos : function(){

    },

    HtmlModelos : function(){

    }

};

(function(){
    "use strict"
    CadastroCarro.Construtor();
    CadastroCarro.Inicializar();
})(jQuery)



