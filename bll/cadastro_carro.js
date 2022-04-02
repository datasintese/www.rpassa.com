var CadastroCarro = {
    versoes : null,
    etapa : 1,
    especificaoes: [],

    Construtor(){
        var baseTela = '.spa.calculator_area.p_100.cadastro_carro';
        this.spa = $(baseTela);
    },

    Inicializar(){
        this.ObterMarcas();
        this.ObterTodasEspecificacoes();
        this.ObterTagsDetalhes();

        this.EventChangeMarca();
        this.EventChangeModelo();
        this.EventChangeVersao();
        this.EventChangeAnoModelo();
        this.EventChangeAnoFabricacao();
        this.EventClickVoltarEtapa();
        this.EventClickProxEtapa();

        this.spa.find('.combo_modelo').hide();
        this.spa.find('.combo_versoes').hide();
        this.spa.find('.combo_ano_modelo').hide();
        this.spa.find('.combo_ano_fabricacao').hide();
        //this.spa.find('.combo_direcao').hide();

        this.spa.find('#placa').hide();
        this.spa.find('#cep').hide();
        this.spa.find('#km').hide();
        this.spa.find('#preco').hide();
        this.spa.find('#voltar_etapa').hide();

        this.spa.find('#placa').inputmask('aaa-999');
        this.spa.find('#cep').inputmask('99999-999');
        this.spa.find('#km').inputmask('(99) 9 9999-9999');
        this.spa.find('#preco').inputmask('RS 999.999.999.999');
        
        /*this.spa.find('#preco').inputmask('decimal', {
                                            'alias': 'numeric',
                                            'groupSeparator': '.',
                                            'autoGroup': false,
                                            'radixPoint': ',',  
                                            'allowMinus': false,
                                            'prefix': 'R$ ',
                                            'placeholder': ''
                                        }); */
        
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

    ObterTodasEspecificacoes : function(){
        var this_ = this;
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/especificacoes/carro/valores',
            type: 'GET', cache: false, async: false, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.HtmlEspecificacoes(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterTagsDetalhes : function(){
        var this_ = this;
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/carros/tags',
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.HtmlTagsDetalhes(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },
    
    HtmlComboEspecificada : function(result, classeCombo, opcaoPadrao, tipoCampo){
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

            // campo especificacao significa que o result contem propiedade valor e id no array
            // campo combo significa que o result contem propiedade nome e id no array
            // campo string significa que o result contem somente string no array
            if(tipoCampo == 'especificacao'){
                $.each(result, function (i, combo) {
                    combo_html.append(`<option value="${combo.id}">${combo.valor}</option>`);
                });
            }else if(tipoCampo == 'combo'){
                $.each(result, function (i, combo) {
                    combo_html.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
            }else if(tipoCampo == 'string'){
                $.each(result, function (i, combo) {
                    combo_html.append(`<option value="${i + 1}">${combo}</option>`);
                });
            }

            combo_html.niceSelect();
            combo_html.val(0).niceSelect('update');
            let niceSelectEspe = this_.spa.find('.nice-select' + classeCombo);
            niceSelectEspe.css('width', '100%');
            //niceSelectEspe.find('li').css('width', '100%');
        }
    },

    HtmlMarcas : function(result){
        var this_ = this;
        this_.HtmlComboEspecificada(result, '.combo_marca', 'Selecione a marca', 'combo');
    },

    HtmlModelos : function(result){
        var this_ = this;
        this_.spa.find('.combo_modelo').show();
        this_.HtmlComboEspecificada(result, '.combo_modelo', 'Selecione o modelo', 'combo');
    },

    HtmlVersoes : function(result){
        var this_ = this;
        this_.spa.find('.combo_versoes').show();
        this_.HtmlComboEspecificada(result, '.combo_versoes', 'Selecione a versão', 'combo');
    },

    HtmlAnoModelo(result){
        var this_ = this;
        this_.spa.find('.combo_ano_modelo').show();
        this_.HtmlComboEspecificada(result, '.combo_ano_modelo', 'Selecione o ano do modelo', 'string');
    },

    HtmlAnoFabricacao(result){
        var this_ = this;
        this_.spa.find('.combo_ano_fabricacao').show();
        this_.HtmlComboEspecificada(result, '.combo_ano_fabricacao', 'Selecione o ano de fabricação', 'string');
    },

    HtmlEspecificacoes : function(result){
        var this_ = this;
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro');
        $.each(result, function (i, combo) {
            let idCombo = combo.chave.replace(/ /g, '_').trim();
            if(combo.valor == 'true' || combo.valor == 'false'){
                
                dados_cadastro_carro.append(
                    `<div class="creat_account">
                        <input type="checkbox" id="f-option_${combo.id}">
                        <label for="f-option_${combo.id}">${combo.chave}</label>
                        <div class="check"></div>
                    </div>`
                );
                                         
            }else{

                // Se a chave não existe adicionado cria caso contrario somente atualiza
                let especificacao_tipo = this_.spa.find('#combo_' + idCombo)
                if(especificacao_tipo.length <= 0){
                    dados_cadastro_carro.append(`
                        <div class="form-group col-md-12">
                            <select id="combo_${idCombo}">
                            </select>
                        </div> <br>`);
                    especificacao_tipo = this_.spa.find('#combo_' + idCombo)
                    especificacao_tipo.append(`<option value="0">Selecione ${combo.chave}</option>`);
                    especificacao_tipo.append(`<option value="${combo.id}">${combo.valor}</option>`);
                    especificacao_tipo.niceSelect();
                    especificacao_tipo.val(0).niceSelect('update');
                }else{
                    especificacao_tipo.append(`<option value="${combo.id}">${combo.valor}</option>`);
                    especificacao_tipo.niceSelect('update');
                }
            }
        });
        this_.spa.find('.nice-select').css('width', '100%');
    },

    HtmlTagsDetalhes : function(result){
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro');
        $.each(result, function (i, combo) {
            dados_cadastro_carro.append(
                `<div class="creat_account">
                    <input type="checkbox" id="f-option_${combo.id}">
                    <label for="f-option_${combo.id}">${combo.nome}</label>
                    <div class="check"></div>
                </div>`
            );
        });
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
    },

    EventChangeAnoFabricacao : function(){
        var this_ = this;
        $(document).on('change', '.combo_ano_fabricacao', function(event) {
            
            this_.spa.find('#placa').show();
            this_.spa.find('#cep').show();
            this_.spa.find('#km').show();
            this_.spa.find('#preco').show();
            // this_.ObterCores();
        });
    },

    EventClickVoltarEtapa: function(){
        var this_ = this;
        $(document).on('click', '#voltar_etapa', function(event) {
            event.preventDefault();
            if(this_.etapa == 1) {
                $(this).hide();
            }
            --this_.etapa;
        });
    },

    EventClickProxEtapa: function(){
        var this_ = this;
        $(document).on('click', '#prox_etapa', function(event) {
            event.preventDefault();

            let marcaSelecionada = this_.spa.find('.combo_marca');
            let modeloSelecionado = this_.spa.find('.combo_modelo');
            let versaoSelecionada = this_.spa.find('.combo_versoes');
            let anoModeloSelecionado = this_.spa.find('.combo_ano_modelo');
            let anoFabricacaoSelecionado = this_.spa.find('.combo_ano_fabricacao');

            /*
            if(){

            }

            /*
            this_.spa.find('#voltar_etapa').show();

            if(this_.etapa == 1) {

            }else if(this_.etapa == 2){
                
                
            }
            ++this_.etapa;
            */
        });
    }
};

(function(){
    "use strict"
    CadastroCarro.Construtor();
    CadastroCarro.Inicializar();
})(jQuery)



