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
        
        // TODO 
        this.ObterTipoDeDirecao();
        this.ObterAssentos();
        this.ObterCategorias();
        this.ObterPortas();
        this.ObterTamanhosMotor();
        this.ObterTransmissao();
        this.ObterFreiosDianteiro();
        this.ObterFreiosTraseiro();
        this.ObterSuspensoesDianteira();
        this.ObterSuspensoesTraseira();
        this.ObterTamanhosRoda();
        this.ObterTiposSegurancaProtecao();

        this.EventChangeMarca();
        this.EventChangeModelo();
        this.EventChangeVersao();
        this.EventChangeAnoModelo();
        this.EventChangeAnoFabricacao();
        this.EventChangeCores();
        this.EventClickVoltarEtapa();
        this.EventClickProxEtapa();

        this.spa.find('.combo_modelo').hide();
        this.spa.find('.combo_versoes').hide();
        this.spa.find('.combo_ano_modelo').hide();
        this.spa.find('.combo_ano_fabricacao').hide();
        this.spa.find('.combo_cores').hide();
        //this.spa.find('.combo_direcao').hide();

        this.spa.find('#placa').hide();
        this.spa.find('#cep').hide();
        this.spa.find('#km').hide();
        this.spa.find('#preco').show();
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

    ObterCores: function(){
        var this_ = this;
        
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=cor',
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result, textStatus, request) {
                this_.HtmlCores(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
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
                this_.especificaoes = result;
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
        
    },

    ObterDetalhes: function(){

    },

    ObterEspecificacoesChave: function(chave){
        return this.especificaoes.filter(x => x.chave == chave);
    },

    ObterEspecificacoesTipo: function(tipo_id){
        return this.especificaoes.filter(x => x.tipo_id == tipo_id);
    },

    ObterTipoDeDirecao : function(){
        let chave = 'Direção';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlDirecoes(result);
    },

    ObterAssentos : function(){
        let chave = 'Assentos';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlAssento(result);
    },

    ObterCategorias: function(){
        let chave = 'Categoria';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlCategorias(result);
    },

    ObterPortas : function(){
        let chave = 'Portas';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlPortas(result);
    },

    ObterTamanhosMotor : function(){
        let chave = 'Tamanho do Motor';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlTamanhosMotor(result);
    },

    ObterTransmissao : function() {
        let chave = 'Transmissão';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlTransmicao(result);
    },

    ObterFreiosDianteiro : function(){
        let chave = 'Freios Dianteiro';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlFreiosDianteiro(result);
    },

    ObterFreiosTraseiro : function(){
        let chave = 'Freios Traseiro';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlFreiosTraseiro(result);
    },

    ObterSuspensoesDianteira : function(){
        let chave = 'Suspensão dianteira';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlSuspensoesDianteira(result);
    },

    ObterSuspensoesTraseira : function(){
        let chave = 'Suspensão traseira';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlSuspensoesTraseira(result);
    },

    ObterTamanhosRoda : function(){
        let chave = 'Tamanho da roda';
        let result = this.ObterEspecificacoesChave(chave);
        this.HtmlTamanhosRoda(result);
    },

    ObterTiposSegurancaProtecao : function(){
        let tipo_id = 5;
        let result = this.ObterEspecificacoesTipo(5);
        this.HtmlInputsChecks(result);
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

    HtmlCores : function(result){
        var this_ = this;
        this_.spa.find('.combo_cores').show();
        this_.HtmlComboEspecificada(result, '.combo_cores', 'Selecione a cor do veiculo', 'especificacao');
    },

    HtmlCores : function(result){
        var this_ = this;
        this_.spa.find('.combo_cores').show();
        this_.HtmlComboEspecificada(result, '.combo_cores', 'Selecione a cor do veiculo', 'especificacao');
    },

    HtmlDirecoes : function(result){
        var this_ = this;
        this_.spa.find('.combo_direcao').show();
        this_.HtmlComboEspecificada(result, '.combo_direcao', 'Selecione a direção', 'especificacao');
    },
    
    HtmlAssento : function(result){
        var this_ = this;
        this_.spa.find('.combo_assentos').show();
        this_.HtmlComboEspecificada(result, '.combo_assentos', 'Selecione a quantidade de acentos', 'especificacao');
    },

    HtmlCategorias : function(result){
        var this_ = this;
        this_.spa.find('.combo_categorias').show();
        this_.HtmlComboEspecificada(result, '.combo_categorias', 'Selecione a categoria', 'especificacao');
    },

    HtmlPortas : function(result){
        var this_ = this;
        this_.spa.find('.combo_portas').show();
        this_.HtmlComboEspecificada(result, '.combo_portas', 'Selecione a quantidade de portas', 'especificacao');
    },

    HtmlTamanhosMotor : function(result){
        var this_ = this;
        this_.spa.find('.combo_tamanhos_motor').show();
        this_.HtmlComboEspecificada(result, '.combo_tamanhos_motor', 'Selecione o tamanho do motor', 'especificacao');
    },

    HtmlTransmicao : function(result){
        var this_ = this;
        this_.spa.find('.combo_transmisao').show();
        this_.HtmlComboEspecificada(result, '.combo_transmisao', 'Selecione o tipo de transmissão', 'especificacao');
    },

    HtmlFreiosDianteiro : function(result){
        var this_ = this;
        this_.spa.find('.combo_freios_dianteiro').show();
        this_.HtmlComboEspecificada(result, '.combo_freios_dianteiro', 'Selecione o tipo de freio dianteiro', 'especificacao');
    },

    HtmlFreiosTraseiro : function(result) {
        var this_ = this;
        this_.spa.find('.combo_freios_traseiro').show();
        this_.HtmlComboEspecificada(result, '.combo_freios_traseiro', 'Selecione o tipo de freio traseiro', 'especificacao');
    },

    HtmlSuspensoesDianteira : function(result){
        var this_ = this;
        this_.spa.find('.combo_suspensoes_dianteira').show();
        this_.HtmlComboEspecificada(result, '.combo_suspensoes_dianteira', 'Selecione o tipo de suspensão dianteira', 'especificacao');
    },

    HtmlSuspensoesTraseira : function(result){
        var this_ = this;
        this_.spa.find('.combo_suspensoes_traseira').show();
        this_.HtmlComboEspecificada(result, '.combo_suspensoes_traseira', 'Selecione o tipo de suspensão traseira', 'especificacao');
    },

    HtmlTamanhosRoda : function(result){
        var this_ = this;
        this_.spa.find('.combo_tamanhos_roda').show();
        this_.HtmlComboEspecificada(result, '.combo_tamanhos_roda', 'Selecione o tamanho da roda', 'especificacao');
    },

    HtmlInputsChecks : function(result){
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro');
        $.each(result, function (i, combo) {
            dados_cadastro_carro.append(` <div class="creat_account">
                                            <input type="checkbox" id="f-option">
                                            <label for="f-option">${combo.chave}</label>
                                            <div class="check"></div>
                                          </div>`
                                        )
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
            this_.ObterCores();
        });
    },

    EventChangeCores : function(){
        var this_ = this;
        $(document).on('change', '.combo_cores', function(event) {
            this_.spa.find('#placa').show();
            this_.spa.find('#cep').show();
            this_.spa.find('#km').show();
            this_.spa.find('#preco').show();
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
            this_.spa.find('#voltar_etapa').show();

            if(this_.etapa == 1) {

            }else if(this_.etapa == 2){
                
            
            }
            ++this_.etapa;
        });
    }
};

(function(){
    "use strict"
    CadastroCarro.Construtor();
    CadastroCarro.Inicializar();
})(jQuery)



