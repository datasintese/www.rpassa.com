var CadastroCarro = {
    versoes : null,

    Construtor(){
        var baseTela = '.spa.calculator_area.p_100.cadastro_carro';
        this.spa = $(baseTela);
    },

    Inicializar(){
        this.ObterMarcas();
        this.EventChangeMarca();
        this.EventChangeModelo();
        this.EventChangeVersao();
        this.EventChangeAnoModelo();

        this.spa.find('.combo_modelo').hide();
        this.spa.find('.combo_versoes').hide();
        this.spa.find('.combo_ano_modelo').hide();
        this.spa.find('.combo_ano_fabricacao').hide();
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
                this_.HtmlMarcas(result, '.combo_marca', 'Selecione a marca');
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterModelos: function(marca_id){
        var this_ = this;

        if(marca_id <= 0){
            this_.HtmlModelos([]);
            return
        }

        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/carros/modelos?marca_id=' + marca_id,
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.HtmlModelos(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterVersoes: function(modelo_id){
        var this_ = this;
        
        if(modelo_id <= 0){
            this_.HtmlVersoes([]);
            return
        }

        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/carros/versoes?modelo_id=' + modelo_id,
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.versoes = result;
                this_.HtmlVersoes(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterAnoModelo: function(versao_id){
        let obj = this.versoes.find(x => x.id == versao_id);
        if(obj != null){
            this.HtmlAnoModelo(obj.ano_modelo);
        }else{
            this.HtmlAnoModelo([]);
        }
    },

    ObterAnoFabricacao: function(ano_modelo){
        let ano_fabricacao = [ano_modelo, ano_modelo - 1];
        if(ano_modelo > 0){
            this.HtmlAnoFabricacao(ano_fabricacao);
        }else{
            this.HtmlAnoFabricacao([]);
        }
    },

    ObterCores: function(){
        var this_ = this;
        
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=cor',
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.versoes = result;
                this_.HtmlVersoes(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterDetalhes: function(){

    },

    ObterEspecificacoes: function(){

    },

    HtmlComboEspecificada : function(result, classeCombo, opcaoPadrao, isObject){
        var this_ = this;
        let combo_html = this_.spa.find(classeCombo);

        if(result.length <= 0){
            combo_html.val(0).niceSelect('update');
            combo_html.trigger('change');
            combo_html.empty();
            combo_html.niceSelect('destroy');
            combo_html.hide();
        }else{
            combo_html.empty();
            combo_html.niceSelect('destroy');
            combo_html.append(`<option value="0">${opcaoPadrao}</option>`);
        
            $.each(result, function (i, combo) {
                combo_html.append(`<option value="${isObject ? combo.id : i}">${isObject ? combo.nome : combo}</option>`);
            });
            combo_html.niceSelect();
            combo_html.val(0).niceSelect('update');
            let niceSelectEspe = this_.spa.find('.nice-select' + classeCombo);
            niceSelectEspe.css('width', '100%');
            niceSelectEspe.find('li').css('width', '100%');
        }
    },

    HtmlMarcas : function(result){
        var this_ = this;
        this_.HtmlComboEspecificada(result, '.combo_marca', 'Selecione a marca', true);
    },

    HtmlModelos : function(result){
        var this_ = this;
        this_.spa.find('.combo_modelo').show();
        this_.HtmlComboEspecificada(result, '.combo_modelo', 'Selecione o modelo', true);
    },

    HtmlVersoes : function(result){
        var this_ = this;
        this_.spa.find('.combo_versoes').show();
        this_.HtmlComboEspecificada(result, '.combo_versoes', 'Selecione a versão', true);
    },

    HtmlAnoModelo(result){
        var this_ = this;
        this_.spa.find('.combo_ano_modelo').show();
        this_.HtmlComboEspecificada(result, '.combo_ano_modelo', 'Selecione o ano do modelo', false);
    },

    HtmlAnoFabricacao(result){
        var this_ = this;
        this_.spa.find('.combo_ano_fabricacao').show();
        this_.HtmlComboEspecificada(result, '.combo_ano_fabricacao', 'Selecione o ano de fabricação', false);
    },

    HtmlCores : function(result){
        var this_ = this;
        this_.spa.find('.combo_ano_fabricacao').show();
        this_.HtmlComboEspecificada(result, '.combo_ano_fabricacao', 'Selecione o ano de fabricação', false);
    },

    EventChangeMarca : function(){
        var this_ = this;
        $(document).on('change', '.combo_marca', function(event) {
            let marca_id = parseInt($(this).val());
            this_.ObterModelos(marca_id)
        });
    },

    EventChangeModelo : function(){
        var this_ = this;
        $(document).on('change', '.combo_modelo', function(event) {
            let modelo_id = parseInt($(this).val());
            this_.ObterVersoes(modelo_id)
        });
    },

    EventChangeVersao : function(){
        var this_ = this;
        $(document).on('change', '.combo_versoes', function(event) {
            let versao_id = parseInt($(this).val());
            this_.ObterAnoModelo(versao_id)
        });
    },

    EventChangeAnoModelo : function(){
        var this_ = this;
        $(document).on('change', '.combo_ano_modelo', function(event) {
            let ano_modelo = parseInt($(this).children('option:selected').text());
            this_.ObterAnoFabricacao(ano_modelo);
        });
    }
};

(function(){
    "use strict"
    CadastroCarro.Construtor();
    CadastroCarro.Inicializar();
})(jQuery)



