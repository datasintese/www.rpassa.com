var CadastroCarro = {
    versoes : null,
    etapa : 1,
    especificacoes: [],
    detalhes : [],

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

        this.spa.find('.dados_cadastro_carro>#etapa2').hide();
        this.spa.find('.dados_cadastro_carro>#etapa3').hide();
        this.spa.find('.dados_cadastro_carro>#etapa4').hide();
        this.spa.find('.dados_cadastro_carro>#etapa5').hide();

        // this.spa.find('#placa').inputmask('aaa-999');
        // this.spa.find('#cep').inputmask('99999-999');
        // this.spa.find('#km').inputmask('(99) 9 9999-9999');
        // this.spa.find('#preco').inputmask('RS 999.999.999.999');
        
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

    RetrocederScrollInicio(){
        var target = this.spa.offset().top;
        $("html, body").animate( { scrollTop: target } );
    },

    Cadastrar : function(placa, 
                         cep, 
                         marca_id, 
                         modelo_id, 
                         versao_id, 
                         ano_modelo, 
                         ano_fabricacao, 
                         km , 
                         preco, 
                         detalhes,
                         avarias, 
                         instituicao_financeira,
                         parcelas_pagas,
                         parcelas_em_atraso,
                         especicacoes_ids,
                         dia_vencimento
                        )
    {
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/carros/alterar',
            type: 'PUT', cache: false, async: true, dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            data: {
                placa: placa,
                cep: cep,
                id_marca: marca_id,
                id_modelo: modelo_id,
                id_versao: versao_id,
                ano_fabricacao: ano_fabricacao,
                ano_modelo: ano_modelo,
                km: km,
                preco: preco,
                detalhes: detalhes,
                avarias: avarias,
                instituicao_financeira: instituicao_financeira,
                parcelas_pagas: parcelas_pagas,
                parcelas_em_atraso: parcelas_em_atraso,
                especicacoes_ids: especicacoes_ids,
                dia_vencimento: dia_vencimento
            },
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (result, textStatus, request) {
                try {
                    Mensagem(result.mensagem, 'success');
                } catch (error) {
                    Mensagem(JSON.stringify(result), 'success');
                }
            },
            error: function (request, textStatus, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                    } catch (error) {
                        Mensagem(request.responseText, 'error', function () { this_.spa.find("#" + obj.campo.toLowerCase()).select(); });
                    }
                }
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
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro #etapa2');
        $.each(result, function (i, combo) {
            let idCombo = combo.chave.replace(/ /g, '_').trim();
            if(!combo.auto_gerado){
                if(combo.valor == 'true' || combo.valor == 'false'){
                
                    dados_cadastro_carro.append(
                        `<div class="creat_account">
                            <input type="checkbox" id="esp-option_${combo.id}" required>
                            <label for="esp-option_${combo.id}">${combo.chave}</label>
                            <div class="check"></div>
                        </div>`
                    );
                    this_.especificacoes.push( {id : combo.id, idHtml : `#esp-option_${combo.id}`, obrigatorio : combo.obrigatorio, tipoCampo : 'checkbox', chave : combo.chave});
                                             
                }else{
    
                    // Se a chave não existe adicionado cria caso contrario somente atualiza
                    let especificacao_tipo = this_.spa.find('#combo_' + idCombo)
                    if(especificacao_tipo.length <= 0){
                        this_.especificacoes.push( {id : combo.id, idHtml : '#combo_' + idCombo, obrigatorio : combo.obrigatorio, tipoCampo : 'select', chave : combo.chave} )
                        dados_cadastro_carro.append(`
                            <div class="form-group col-md-12">
                                <select id="combo_${idCombo}" required>
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
            }
        });
        this_.spa.find('.nice-select').css('width', '100%');
    },

    HtmlTagsDetalhes : function(result){
        var this_ = this;
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro>#etapa3');
        $.each(result, function (i, detalhe) {
            if(detalhe.exibir_ao_editar){
                dados_cadastro_carro.append(
                    `<div class="creat_account">
                        <input type="checkbox" id="tag-option_${detalhe.id}">
                        <label for="tag-option_${detalhe.id}">${detalhe.nome}</label>
                        <div class="check"></div>
                    </div>`
                );
                this_.detalhes.push({ id: detalhe.id, idHtml: `#tag-option_${detalhe.id}` });
            }
        });
        //TODO
        this_.HtmlAvarias();
    },

    HtmlDadosAlienado: function(){
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro>#etapa4');
        

        dados_cadastro_carro.append(`
            <div class="row" id="dados_alienado">
                <div class="form-group col-md-12">
                    <input type="text" class="form-control" id="instituicao_financeira" name="instituicao_financeira" placeholder="instituicao_financeira">
                </div>
                <div class="form-group col-md-12">
                    <input type="text" class="form-control" id="parcelas_pagas" name="parcelas_pagas" placeholder="Parcelas pagas">
                </div>
                <div class="form-group col-md-12">
                    <input type="text" class="form-control" id="parcelas_em_atraso" name="parcelas_em_atraso" placeholder="Parcelas em atraso">
                </div>
                <div class="form-group col-md-12">
                    <input type="text" class="form-control" id="dia_vencimento" name="dia_vencimento" placeholder="Dia vencimento">
                </div>
            </div>`
        );

    },  
    HtmlAvarias : function(){
        let dados_cadastro_carro = this.spa.find('.dados_cadastro_carro>#etapa3');

        dados_cadastro_carro.append(`
            <div class="form-group col-md-12">
                <input type="text-area" class="form-control" id="avarias" name="avarias" placeholder="Avarias">
            </div> <br>`
        );
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
            let isAlienado = this_.spa.find('.dados_cadastro_carro>.tag-option_1').prop('checked');

            let ocultar = 0;
            --this_.etapa;
            ocultar = 1
            if(this_.etapa == 4){
                if(!isAlienado){
                    --this_.etapa;
                    ocultar = 2
                }
            }
            
            if(this_.etapa == 1) {
                $(this).hide();
            }

            this_.spa.find('.dados_cadastro_carro>#etapa' + (this_.etapa + ocultar)).hide();
            this_.spa.find('.dados_cadastro_carro>#etapa' + this_.etapa).show();
            this_.RetrocederScrollInicio();

        });
    },

    EventClickProxEtapa: function(){
        var this_ = this;
        $(document).on('click', '#prox_etapa', function(event) {
            event.preventDefault();
            var dados_cadastro_carro = this_.spa.find('.dados_cadastro_carro');

            // Principais parte 1
            if(this_.etapa == 1){
                let marcaSelecionada = dados_cadastro_carro.find('.combo_marca');
                let modeloSelecionado = dados_cadastro_carro.find('.combo_modelo');
                let versaoSelecionada = dados_cadastro_carro.find('.combo_versoes');
                let anoModeloSelecionado = dados_cadastro_carro.find('.combo_ano_modelo');
                let anoFabricacaoSelecionado = dados_cadastro_carro.find('.combo_ano_fabricacao');
    
                let placa = dados_cadastro_carro.find('#placa');
                let cep = dados_cadastro_carro.find('#cep');
                let km = dados_cadastro_carro.find('#km');
                let preco = dados_cadastro_carro.find('#preco');
    
                if(marcaSelecionada.val() == 0){
                    Mensagem('Selecione a marca', 'warning', function () { marcaSelecionada.select(); });
                    return;
                }else if(modeloSelecionado.val() == 0){
                    Mensagem('Selecione o modelo', 'warning', function () { modeloSelecionado.select(); });
                    return;
                }else if(versaoSelecionada.val() == 0){
                    Mensagem('Selecione a versao', 'warning', function () { versaoSelecionada.select(); });
                    return;
                }else if(anoModeloSelecionado.val() == 0){
                    Mensagem('Selecione o ano do modelo', 'warning', function () { anoModeloSelecionado.select(); });
                    return;
                }else if(anoFabricacaoSelecionado.val() == 0){
                    Mensagem('Selecione o ano de fabricacao', 'warning', function () { anoFabricacaoSelecionado.select(); });
                    return;
                }else if(placa.val() == 0){
                    Mensagem('Selecione o modelo', 'warning', function () { modeloSelecionado.select(); });
                    return;
                }else if(cep.val() == 0){
                    Mensagem('Selecione a versao', 'warning', function () { versaoSelecionada.select(); });
                    return;
                }else if(km.val() == 0){
                    Mensagem('Selecione o ano do modelo', 'warning', function () { anoModeloSelecionado.select(); });
                    return;
                }else if(preco.val() == 0){
                    Mensagem('Selecione o ano de fabricacao', 'warning', function () { anoFabricacaoSelecionado.select(); });
                    return;
                }

                // Passar para etapa 2 liberar especificacoes
                ++this_.etapa;
                
                dados_cadastro_carro.find('#etapa1').hide();
                dados_cadastro_carro.find('#etapa2').show();
                this_.RetrocederScrollInicio();

                this_.spa.find('#voltar_etapa').show();
         
                return;
            }
         
            // ----------------------------------------------------

            // Parte 2
            // Especificações

            if(this_.etapa == 2){
                let paramsEspecificacoes = [];
            
                let qtdEspecificacoes = this_.especificacoes.length;
                for(let i = 0; i < qtdEspecificacoes; i++){
                    let especificacao = this_.especificacoes[i];
                    let especificacao_localizada =  dados_cadastro_carro.find(especificacao.idHtml);
                    if(especificacao.tipoCampo == 'checkbox'){
                        let valor = especificacao_localizada.prop('checked');
                        if(valor){
                            paramsEspecificacoes.push(especificacao.id)
                        }
                    }else if(especificacao.tipoCampo == 'select'){
                        let valor = especificacao_localizada.val();
                        if(especificacao.obrigatorio){
                            if(valor == 0){
                                Mensagem(`Selecione ${especificacao.chave}` , 'warning', function () { dados_cadastro_carro.find(especificacao.idHtml).focus(); });
                                return
                            }
                            paramsEspecificacoes.push(especificacao.id);
                        }
                    }
                };

                // Passar para etapa 3 liberar tags
                ++this_.etapa;
                dados_cadastro_carro.find('#etapa2').hide();
                dados_cadastro_carro.find('#etapa3').show();
                this_.RetrocederScrollInicio();

                return;
            }

            // -----------------------------------------------------------------


            // Parte 3
            // Tags 

            if(this_.etapa == 3){
                let isAlienado = false;
                let paramsTagDetalhe = [];
                var dados_cadastro_carro = this_.spa.find('.dados_cadastro_carro');
                let qtdDetalhes = this_.detalhes.length;
                for(let i = 0; i < qtdDetalhes; i++){
                    let detalhe = this_.detalhes[i];
                    let detalhe_localizado =  dados_cadastro_carro.find(detalhe.idHtml);
                    let valor = detalhe_localizado.prop('checked');
                    if(valor){
                        paramsTagDetalhe.push(detalhe.id)
                        if(detalhe.id == 1){
                            isAlienado = true;
                        }
                    }
                };
                // Setar o value do botao para Cadastrar
                $(this).text("Anunciar");
                this_.RetrocederScrollInicio();
                if(isAlienado){
                    // Passar para etapa 4 liberar campos de alienação.
                    ++this_.etapa;
                    dados_cadastro_carro.find('#etapa3').hide();
                    this_.HtmlDadosAlienado();
                    dados_cadastro_carro.find('#etapa4').show();
                    return;
                }else{
                    //Pular diretamente para etapa 5
                    dados_cadastro_carro.find('#etapa3').hide();
                    
                    this_.etapa +=2
                    dados_cadastro_carro.find('#etapa5').show();
                    return;
                }
            }

            // Parte 4
            // Alienado
            if(this_.etapa == 4){
                let instituicao_financeira = null;
                let parcelas_pagas = null;
                let parcelas_em_atraso = null;
                let dia_vencimento = null;
                
                if(isAlienado){
                    instituicao_financeira = dados_cadastro_carro.find('#instituicao_financeira');
                    parcelas_pagas = dados_cadastro_carro.find('#parcelas_pagas');
                    parcelas_em_atraso = dados_cadastro_carro.find('#parcelas_em_atraso');
                    dia_vencimento = dados_cadastro_carro.find('#dia_vencimento');
    
                    if(instituicao_financeira.val() == ''){
                        Mensagem('Selecione a marca', 'warning', function () { instituicao_financeira.select(); });
                        return;
                    }else if(parcelas_pagas.val() == ''){
                        Mensagem('Selecione o modelo', 'warning', function () { parcelas_pagas.select(); });
                        return;
                    }else if(parcelas_em_atraso.val() == ''){
                        Mensagem('Selecione o modelo', 'warning', function () { parcelas_em_atraso.select(); });
                        return;
                    }else if(dia_vencimento.val() == ''){
                        Mensagem('Selecione o modelo', 'warning', function () { dia_vencimento.select(); });
                        return;
                    }
                }
                ++this_.etapa;
            }

            if(this_.etapa == 5){
                let avarias = dados_cadastro_carro.find('#avarias').val();

                this_.Cadastrar(
                    placa.val(), 
                    cep.val(), 
                    marcaSelecionada.val(),
                    modeloSelecionado.val(),
                    versaoSelecionada.val(),
                    anoModeloSelecionado.val(),
                    anoFabricacaoSelecionado.val(),
                    km.val(),
                    preco.val(),
                    paramsTagDetalhe,
                    avarias ?? null,
                    instituicao_financeira != null ? instituicao_financeira.val() : instituicao_financeira,
                    parcelas_pagas != null ? parcelas_pagas.val() : parcelas_pagas,
                    parcelas_em_atraso != null ? parcelas_em_atraso.val() : parcelas_em_atraso,
                    paramsEspecificacoes,
                    dia_vencimento != null ? dia_vencimento.val() : dia_vencimento
                )
            }     
        });
    }
};

(function(){
    "use strict"
    CadastroCarro.Construtor();
    CadastroCarro.Inicializar();
})(jQuery)



