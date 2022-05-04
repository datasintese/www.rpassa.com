var PesquisaCarro = {
    Filtro: [], /* Lista dinâmica de tags selecionadas pelo usuário ou pela query string */
    Tags: [], /* Fonte de todas as tags das especificações ids carregadas do banco de dados */
    TagsLoading: {}, /* Sinaliza se as tags ainda estão sendo carregadas do servidor */

    TamanhoTituloCategorias: 16, /* Valor em px */

    RolamentoPesquisa: {
        categoria_id: null,
        orderby: 1, /* Mais Recentes */
        offset: 0,
        skip: 0,
        lote: 12,
        marcas_ids: null,
        modelos_ids: null,
        especificacoes_ids: null,
        detalhes_ids : null,
        km_min: null,
        km_max: null
    },

    QtdPaginas: 6,
    TotPaginasFor: 6,
    PaginaAtual: 0,
    UltimaAtivadadeCarregamento : null,

    preco_min_padrao : 0,
    ano_min_padrao : 1900,
    km_min_padrao : 0,

    preco_max_padrao : 1000000,
    ano_max_padrao : 2075,
    km_max_padrao : 500000,

    Inicializar() {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        var this_ = this;
        this_.LimparTagsFiltro();

        this_.CarregarPaginas(undefined,false,true,true).then();
        this_.CarregarPaginas(undefined, true, false, false);

        // Converte Query String em tags de filtro
        var clock = setInterval(function () {
            let TagsLoaded = false;

            $.each(this_.TagsLoading, function (k, v) {
                if (this_.TagsLoading[k] == true) {
                    TagsLoaded = false;
                    return false;
                }
                TagsLoaded = true;
            });

            if (TagsLoaded) {
                clearInterval(clock);

                let ordenacao = null;
                let preco_min = null;
                let preco_max = null;
                let km_min = null;
                let km_max = null;
                let ano_min = null;
                let ano_max = null;
                let estado = null;
                let cidade = null;
                let marca = null;
                let modelo = null;
                let versao = null;

                let objSelecaoMult = new Map();

                $.each(params, function (param, value) {
                    let values = value.split(',');

                    if (param == 'ordenacao')
                        ordenacao = values[0];
                    else if (param == 'preco_min')
                        preco_min = values[0];
                    else if (param == 'preco_max')
                        preco_max = values[0];
                    else if (param == 'km_min')
                        km_min = values[0];
                    else if (param == 'km_max')
                        km_max = values[0];
                    else if (param == 'ano_min')
                        ano_min = values[0];
                    else if (param == 'ano_max')
                        ano_max = values[0];
                    else if (param == 'estado')
                        estado = values[0];
                    else if (param == 'cidade')
                        cidade = values[0];
                    else if (param == 'marca')
                        marca = values[0];
                    else if (param == 'modelo')
                        modelo = values[0];
                    else if (param == 'versao')
                        versao = values[0];
                    else {
                        objSelecaoMult.set(param, []);
                        $.each(values, function (idx, valueSplit) {
                            $.each(this_.Tags, function (index, obj) {
                                if (param.toLowerCase() == obj.tag_chave.toLowerCase() && valueSplit == obj.tag_legenda) {
                                    this_.AdicionarTagFiltro(obj.tag_chave, obj.tag_legenda, obj.param_chave, obj.param_valor);
                                    objSelecaoMult.get(param).push(obj.param_valor);
                                }
                            });
                        });
                    }
                });

                if (ordenacao != null) {
                    // TODO: Checar o valor da ordenação pela lista Tags que foi carregada pelo endpoint de ordenacao

                    let param_valor = 1;
                    $.each(this_.Tags, function (key, obj) {
                        if (obj.tag_chave == 'ordenacao' && obj.tag_legenda == ordenacao) {
                            param_valor = obj.param_valor;
                            return false;
                        }
                    });

                    this_.RolamentoPesquisa['orderby'] = param_valor;
                    $('.nice_select#ordenacao').val(param_valor).niceSelect('update');
                    this_.AdicionarTagFiltroOrdenacao(ordenacao, param_valor, false);
                }

                var ano_options = $('#ano_wd').slider('option');

                // Quando não há faixa de km informado na QueryString
                if (ano_min !== null && ano_max !== null) {
                    $("#ano_wd").slider("values", 0, ano_min);
                    $("#ano_wd").slider("values", 1, ano_max);
                    this_.AdicionarTagFiltroAno({ values: [ano_min, ano_max] }, false);
                }
                else if (ano_min != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#ano_wd").slider("values", 0, ano_min);
                    $("#ano_wd").slider("values", 1, ano_options.max);
                    this_.AdicionarTagFiltroAno({ values: [ano_min, ano_options.max] }, false);
                }
                else if (ano_max != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#ano_wd").slider("values", 0, ano_options.min);
                    $("#ano_wd").slider("values", 1, ano_max);
                    this_.AdicionarTagFiltroAno({ values: [ano_options.min, ano_max] }, false);
                }

                var km_options = $('#km_wd').slider('option');

                // Quando não há faixa de km informado na QueryString
                if (km_min !== null && km_max !== null) {
                    $("#km_wd").slider("values", 0, km_min);
                    $("#km_wd").slider("values", 1, km_max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_min, km_max] }, false);
                }
                else if (km_min != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#km_wd").slider("values", 0, km_min);
                    $("#km_wd").slider("values", 1, km_options.max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_min, km_options.max] }, false);
                }
                else if (km_max != null) { // Quando há faixa de km parcial informado na QueryString
                    $("#km_wd").slider("values", 0, km_options.min);
                    $("#km_wd").slider("values", 1, km_max);
                    this_.AdicionarTagFiltroQuilometragem({ values: [km_options.min, km_max] }, false);
                }

                var preco_options = $('#price_wd').slider('option');

                // Quando não há faixa de preço informado na QueryString
                if (preco_min !== null && preco_max !== null) {
                    $("#price_wd").slider("values", 0, preco_min);
                    $("#price_wd").slider("values", 1, preco_max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_min, preco_max] }, false);
                }
                else if (preco_min != null) { // Quando há faixa de preço parcial informado na QueryString
                    $("#price_wd").slider("values", 0, preco_min);
                    $("#price_wd").slider("values", 1, preco_options.max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_min, preco_options.max] }, false);
                }
                else if (preco_max != null) { // Quando há faixa de preço parcial informado na QueryString
                    $("#price_wd").slider("values", 0, preco_options.min);
                    $("#price_wd").slider("values", 1, preco_max);
                    this_.AdicionarTagFiltroPreco({ values: [preco_options.min, preco_max] }, false);
                }

                if(estado != null){
                    let combo_estado = $('.nice_select#combo_estado')
                    let valor = combo_estado.find('option:contains("' + estado + '")').val();

                    combo_estado.val(valor).niceSelect('update');
                    $('.nice_select#combo_estado').trigger('change');

                    if(cidade != null){
                        let combo_cidade = $('.nice_select#combo_cidade')
                        valor = combo_cidade.find('option:contains("' + cidade + '")').val();

                        combo_cidade.val(valor).niceSelect('update');
                        $('.nice_select#combo_cidade').trigger('change');
                    }
                }
               
                if(marca != null){

                    let combo_marca = $('.nice_select#combo_marca')
                    let valor = combo_marca.find('option:contains("' + marca + '")').val();

                    combo_marca.val(valor).niceSelect('update');
                    $('.nice_select#combo_marca').trigger('change');

                    if(modelo != null){

                        let combo_modelo = $('.nice_select#combo_modelo')
                        valor = combo_modelo.find('option:contains("' + modelo + '")').val();
    
                        combo_modelo.val(valor).niceSelect('update');
                        $('.nice_select#combo_modelo').trigger('change');

                        if(versao != null){
                            let combo_versao = $('.nice_select#combo_versao')
                            valor = combo_versao.find('option:contains("' + versao + '")').val();
        
                            combo_versao.val(valor).niceSelect('update');
                            $('.nice_select#combo_versao').trigger('change');
                        }
                    }
                }

                console.log(objSelecaoMult);

                console.log(objSelecaoMult.has('carro'));

                if(objSelecaoMult.has('carro')){
                    let elementos = $('.accordion#accordionExample').find('label[tag_chave="carro"]');

                    $.each(elementos, function (key, item) {

                        let valor = $(item).attr('param_valor');
                        let contem = objSelecaoMult.get('carro').find(x => x.toString() == valor);
                        let input_check_box = $(item).parent().find("input[type=checkbox]");
                        if(contem != null && contem != undefined){
                            input_check_box.prop('checked', true);
                        }else{
                            input_check_box.prop('checked', false);
                        }
                    });
                }
                if(objSelecaoMult.has("final da placa")){
                    let elementos = $('.accordion#accordionExample').find('label[tag_chave="Final da placa"]');

                    $.each(elementos, function (key, item) {

                        let valor = $(item).attr('param_valor');
                        let contem = objSelecaoMult.get('final da placa').find(x => x.toString() == valor);
                        let input_check_box = $(item).parent().find("input[type=checkbox]");
                        if(contem != null && contem != undefined){
                            input_check_box.prop('checked', true);
                        }else{
                            input_check_box.prop('checked', false);
                        }
                    });
                }

                /*
                if(objSelecaoMult.has("categoria")){
                    
                }
                */

                this_.AtualizarLegendaFaixaPreco();
                this_.AtualizarLegendaFaixaAno();
                this_.AtualizarLegendaFaixaQuilometragem();

                this_.PosInicializar();

                /*
                this_.Pesquisar(false, true, true);
                this_.Pesquisar(true, false, false);
                */
            }
        }, 10); // 10ms
        
        this.CarregarComboOrdenacao();
        this.CarregarAcordaosFitro();
        
        this.AssinarEventos();
        

        this.LimparItensProdutos();
    },

    PosInicializar() {
        $(".wd_scroll").mCustomScrollbar({

            theme: "dark",
            setHeight: "20%",
            mouseWheel: { enable: true }
        });

        $('#accordionExample').collapse({
            heightStyle: "fill",
            toggle: true
        })

    },

    AssinarEventos() {
        var this_ = this;

        $(document.body).on('click', '.tag_item', async function (event) {
            event.preventDefault();

            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');

            if (this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor)) {
                await this_.CarregarPaginas(undefined,true, false);
                await this_.CarregarPaginas(undefined,false, true);
            }
        });

        $(document.body).on('click', '.tag_item_check', async function (event) {
            
            let chave = $(this).attr('tag_chave');

            let thisLocal = this;
            let elementos = $('.accordion#accordionExample').find('label[tag_chave="'+ chave +'"]')

            $.each(elementos, function (key, item) {

                let tag_chave = $(item).attr('tag_chave');
                let tag_legenda = (tag_chave === 'carro' ? '' : 'Final da placa ') + $(item).attr('tag_legenda');
                let param_chave = $(item).attr('param_chave');
                let param_valor = $(item).attr('param_valor');

                let input_check_box = $(item).parent().find("input[type=checkbox]");
                let marcado = input_check_box.is(':checked');

                if(param_valor === $(thisLocal).attr('param_valor')){
                    if (marcado) {
                        this_.DeletarTagQueryStringURL(tag_chave, tag_legenda);
                        this_.DeletarTagFiltro(tag_chave, null, param_valor);
                    }
                    else {
                        this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor);
                    }
                }else{
                    if (marcado) {
                        this_.AdicionarTagFiltro(tag_chave, tag_legenda, param_chave, param_valor);
                    }
                    else {
                        this_.DeletarTagQueryStringURL(tag_chave, tag_legenda);
                        this_.DeletarTagFiltro(tag_chave, null, param_valor);
                    }
                }
            });

            await this_.CarregarPaginas(undefined,true,false);
            await this_.CarregarPaginas(undefined, false, true);
        });

        $(document).on('click', '.tag_filtro', async function (event) {
            event.preventDefault();

            let tag_chave = $(this).attr('tag_chave');
            let tag_legenda = $(this).attr('tag_legenda');
            let param_chave = $(this).attr('param_chave');
            let param_valor = $(this).attr('param_valor');
            let use_valor = $(this).attr('use_valor') == 'true'; // Para outros tipos de tag que não seguem a mesma regra das especificacoes_ids

            $.each(this_.Filtro, function (key, value) {
                if (value !== undefined) {
                    if (tag_chave == value.tag_chave && param_valor == value.param_valor) {
                        delete this_.Filtro[key];
                        return false;
                    }
                }
            });

            this_.DeletarTagQueryStringURL(tag_chave, (use_valor ? null : tag_legenda));

            $(this).remove();

            if (tag_chave == 'ordenacao') {
                $('.nice_select#ordenacao').val(1).niceSelect('update');
                this_.RolamentoPesquisa['orderby'] = 1;
            }

            if (tag_chave == 'estado') {
                $('.nice_select#combo_estado').val(0).niceSelect('update');
                $('.nice_select#combo_estado').trigger('change');
                return;
            }

            if (tag_chave == 'cidade') {
                $('.nice_select#combo_cidade').val(0).niceSelect('update');
                $('.nice_select#combo_cidade').trigger('change');
                return;
            }

            if (tag_chave == 'marca') {
                $('.nice_select#combo_marca').val(0).niceSelect('update');
                $('.nice_select#combo_marca').trigger('change');
                return;
            }
            
            if (tag_chave == 'modelo') {
                $('.nice_select#combo_modelo').val(0).niceSelect('update');
                $('.nice_select#combo_modelo').trigger('change');
                return;
            }

            if (tag_chave == 'versao') {
                $('.nice_select#combo_versao').val(0).niceSelect('update');
                $('.nice_select#combo_versao').trigger('change');
                return;
            }

            if(tag_chave == 'Final da placa' || tag_chave == 'carro'){
                let elementos = $('.accordion#accordionExample').find('label[tag_chave="'+ tag_chave +'"][param_valor="' + param_valor +'"]');
                let input_check_box = $(elementos).parent().find("input[type=checkbox]");
                input_check_box.prop('checked', false);
            }

            if(tag_chave== 'preco_min'){
                $("#price_wd").slider("values", 0, this_.preco_min_padrao);
                this_.AtualizarLegendaFaixaPreco();
            }

            if(tag_chave== 'preco_max'){
                $("#price_wd").slider("values", 1, this_.preco_max_padrao);
                this_.AtualizarLegendaFaixaPreco();
            }

            if(tag_chave== 'ano_min'){
                $("#ano_wd").slider("values", 0, this_.ano_min_padrao);
                this_.AtualizarLegendaFaixaAno();
            }

            if(tag_chave== 'ano_max'){
                $("#ano_wd").slider("values", 1, this_.ano_max_padrao);
                this_.AtualizarLegendaFaixaAno();
            }

            if(tag_chave== 'km_min'){
                $("#km_wd").slider("values", 0, this_.km_min_padrao);
                this_.AtualizarLegendaFaixaQuilometragem();
            }

            if(tag_chave== 'km_max'){
                $("#km_wd").slider("values", 1, this_.km_max_padrao);
                this_.AtualizarLegendaFaixaQuilometragem();
            }

            await this_.CarregarPaginas(undefined, true, false);
            await this_.CarregarPaginas(undefined, false, true);
        });

        $(document.body).on('click', '#limpar_tags_filtro', async function (event) {
            event.preventDefault();
            let tagsFiltro = $('.tags_f').children();
            if(tagsFiltro.length > 0){
                this_.LimparTagsFiltro();
                this_.LimparQueryStringURL();
    
                await this_.CarregarPaginas(undefined,true, false);
                await this_.CarregarPaginas(undefined,false, true);
            }
        });

        $('.nice_select#ordenacao').on('change', function (event) {
            event.preventDefault();

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(this.value) > 0) {
                this_.RolamentoPesquisa['orderby'] = parseInt(this.value);

                this_.AdicionarTagFiltroOrdenacao(tag_legenda, parseInt(this.value), false);
                this_.CarregarPaginas(undefined,true, false);
            }
        });

        $("#price_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroPreco(ui);
        });

        $("#km_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroQuilometragem(ui);
        });

        $("#ano_wd").on("slidestop", function (event, ui) {
            this_.AdicionarTagFiltroAno(ui);
        });

        $('.nice_select#combo_marca').on('change', function(event){
            event.preventDefault();
            let id_marca = $(this).val();

            let combo_modelo = $('.accordion#accordionExample').find('#combo_modelo');
            combo_modelo.val(0).niceSelect('update')
            combo_modelo.trigger('change');

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(this.value) > 0) {
                this_.RolamentoPesquisa['marcas_ids'] = parseInt(this.value);

                this_.AdicionarTagFiltroMarca(tag_legenda, parseInt(id_marca), false);
                this_.CarregarPaginas(undefined,true, false);
                this_.CarregarComboModelos(id_marca);
            }else{
                this_.DeletarTagQueryStringURL('marca', null);
                this_.DeletarTagFiltro('marca');
                this_.RolamentoPesquisa['marcas_ids'] = null;

                this_.DeletarTagQueryStringURL('modelo', null);
                this_.DeletarTagFiltro('modelo');
                this_.RolamentoPesquisa['modelos_ids'] = null;

                this_.DeletarTagQueryStringURL('versao', null);
                this_.DeletarTagFiltro('versao');
                this_.RolamentoPesquisa['versoes_ids'] = null;

                this_.LimparComboMarca();

                this_.CarregarPaginas(undefined,true, false);
            }

            let lista = $('.accordion#accordionExample').find('.nice-select>.list');
            lista.css('width', '100%');
            lista.css('max-height', '150px');

        });

        $(document.body).on('change','.nice_select#combo_modelo', function(event){
            let id_modelo = $(this).val();
            
            let combo_versao = $('.accordion#accordionExample').find('#combo_versao');
            combo_versao.val(0).niceSelect('update')
            combo_versao.trigger('change');

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(id_modelo) > 0) {
                this_.RolamentoPesquisa['modelos_ids'] = parseInt(this.value);

                this_.AdicionarTagFiltroModelo(tag_legenda, parseInt(id_modelo), false);
                this_.CarregarPaginas(undefined,true, false);

                this_.CarregarComboVersao(id_modelo);
            }else{
                this_.DeletarTagQueryStringURL('modelo', null);
                this_.DeletarTagFiltro('modelo');
                this_.RolamentoPesquisa['modelos_ids'] = null;

                this_.DeletarTagQueryStringURL('versao', null);
                this_.DeletarTagFiltro('versao');
                this_.RolamentoPesquisa['versoes_ids'] = null;

                this_.LimparComboModelo();
                this_.CarregarPaginas(undefined,true, false);
            }

            let lista = $('.accordion#accordionExample').find('.nice-select>.list');
            lista.css('width', '100%');
            lista.css('max-height', '150px');

        });

        $(document.body).on('change','.nice_select#combo_versao', function(event){
            let id_versao = $(this).val();

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(id_versao) > 0) {
                this_.RolamentoPesquisa['versoes_ids'] = parseInt(id_versao);

                this_.AdicionarTagFiltroVersao(tag_legenda, parseInt(id_versao), false);
                this_.CarregarPaginas(undefined,true, false);
            }else{
                this_.DeletarTagQueryStringURL('versao', null);
                this_.DeletarTagFiltro('versao');
                this_.RolamentoPesquisa['versoes_ids'] = null;
                this_.CarregarPaginas(undefined,true, false);
            }

            let lista = $('.accordion#accordionExample').find('.nice-select>.list');
            lista.css('width', '100%');
            lista.css('max-height', '150px');

            let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
            niceSelectEspe.css('width', '100%');
        });

        $(document.body).on('change','.nice_select#combo_estado', function(event){
            let id_estado = $(this).val();

            let combo_cidade = $('.accordion#accordionExample').find('#combo_cidade');
            combo_cidade.val(0).niceSelect('update')
            combo_cidade.trigger('change');

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(id_estado) > 0) {
                this_.RolamentoPesquisa['estados_ids'] = parseInt(id_estado);

                this_.AdicionarTagFiltroEstado(tag_legenda, parseInt(id_estado), false);
                this_.CarregarPaginas(undefined,true, false);
                this_.CarregarComboCidades(id_estado);
            }else{
                this_.DeletarTagQueryStringURL('estado', null);
                this_.DeletarTagFiltro('estado');
                this_.RolamentoPesquisa['estados_ids'] = null;

                this_.DeletarTagQueryStringURL('cidade', null);
                this_.DeletarTagFiltro('cidade');
                this_.RolamentoPesquisa['cidades_ids'] = null;

                combo_cidade.niceSelect('destroy');
                combo_cidade.remove();

                this_.CarregarPaginas(undefined,true, false);
            }
            let lista = $('.accordion#accordionExample').find('.nice-select>.list');
            lista.css('width', '100%');
            lista.css('max-height', '150px');
        });

        $(document.body).on('change','.nice_select#combo_cidade', function(event){
            let id_cidade = $(this).val();

            let tag_legenda = $(this).find(":selected").text();

            if (parseInt(id_cidade) > 0) {
                this_.RolamentoPesquisa['cidades_ids'] = parseInt(id_cidade);

                this_.AdicionarTagFiltroCidade(tag_legenda, parseInt(id_cidade), false);
                this_.CarregarPaginas(undefined,true, false);
            }else{
                this_.DeletarTagQueryStringURL('cidade', null);
                this_.DeletarTagFiltro('cidade');
                this_.RolamentoPesquisa['cidades_ids'] = null;

                this_.CarregarPaginas(undefined,true, false);
            }
            let lista = $('.accordion#accordionExample').find('.nice-select>.list');
            lista.css('width', '100%');
            lista.css('max-height', '150px');

            let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
            niceSelectEspe.css('width', '100%');
        });

        this_.EventClickPaginacao()
    },

    LimparQueryStringURL() {
        var url = new URL(window.location.href);
        url.search = '';
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    LimparComboMarca(){
        let combo_modelo = $('.accordion#accordionExample').find('#combo_modelo');
        combo_modelo.niceSelect('destroy');
        combo_modelo.remove();

        let combo_versao = $('.accordion#accordionExample').find('#combo_versao');
        combo_versao.niceSelect('destroy');
        combo_versao.remove();
    },

    LimparComboModelo(){
        let combo_versao = $('.accordion#accordionExample').find('#combo_versao');
        combo_versao.niceSelect('destroy');
        combo_versao.remove();
    },

    DeletarTagQueryStringURL(tag_chave, tag_legenda) {
        var url = new URL(window.location.href);
        const urlSearchParams = new URLSearchParams(window.location.search);
        const searchParams = new URLSearchParams(urlSearchParams);

        if (tag_legenda === null) { // Deleta a chave independente do valor
            searchParams.delete(tag_chave);
        }
        else {
            // Deleta o valor da chave
            for (var key of searchParams.keys()) {
                if (tag_chave.toLowerCase() == key) {
                    var values = searchParams.get(key);
                    var arr = values.split(',');
                    $.each(arr, function (k, val) {
                        if (val !== undefined) {
                            if (val == tag_legenda) delete arr[k];
                        }
                    });
                    searchParams.set(tag_chave.toLowerCase(), arr.filter(x => x != '').join(","));
                }
            }
        }
        url.search = searchParams.toString();
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    AdicionarTagQueryStringURL(tag_chave, useParamValor) {
        var values = [];
        $.each(this.Filtro, function (key, obj) {
            if (obj !== undefined)
                if (obj.tag_chave == tag_chave) {
                    if (useParamValor)
                        values.push(obj.param_valor)
                    else
                        values.push(obj.tag_legenda)
                }
        });

        var url = new URL(window.location.href);
        const urlSearchParams = new URLSearchParams(window.location.search);
        const searchParams = new URLSearchParams(urlSearchParams);
        searchParams.set(tag_chave.toLowerCase(), values.join(','));
        url.search = searchParams.toString();
        url = url.toString();
        window.history.replaceState({ url: url }, null, url);
    },

    async AdicionarTagFiltroOrdenacao(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('ordenacao', null);
        this.DeletarTagFiltro('ordenacao');
        this.AdicionarTagFiltro('ordenacao', tag_legenda, 'ordenacao', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroPreco(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('preco_min', null);
        this.DeletarTagQueryStringURL('preco_max', null);

        this.DeletarTagFiltro('preco_min');
        this.DeletarTagFiltro('preco_max');

        this.AdicionarTagFiltro('preco_min', 'Preço Min: R$ ' + ui.values[0].toLocaleString('de-DE'), 'preco_min', ui.values[0], true);
        this.AdicionarTagFiltro('preco_max', 'Preço Max: R$ ' + ui.values[1].toLocaleString('de-DE'), 'preco_max', ui.values[1], true);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroQuilometragem(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('km_min', null);
        this.DeletarTagQueryStringURL('km_max', null);

        this.DeletarTagFiltro('km_min');
        this.DeletarTagFiltro('km_max');

        this.AdicionarTagFiltro('km_min', 'Km Min: ' + ui.values[0].toLocaleString('de-DE'), 'km_min', ui.values[0], true);
        this.AdicionarTagFiltro('km_max', 'Km Max: ' + ui.values[1].toLocaleString('de-DE'), 'km_max', ui.values[1], true);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroAno(ui, pesquisar = true) {
        this.DeletarTagQueryStringURL('ano_min', null);
        this.DeletarTagQueryStringURL('ano_max', null);

        this.DeletarTagFiltro('ano_min');
        this.DeletarTagFiltro('ano_max');

        this.AdicionarTagFiltro('ano_min', 'Ano Min: ' + ui.values[0].toLocaleString('de-DE'), 'ano_min', ui.values[0], true);
        this.AdicionarTagFiltro('ano_max', 'Ano Max: ' + ui.values[1].toLocaleString('de-DE'), 'ano_max', ui.values[1], true);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroMarca(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('marca', null);
        this.DeletarTagFiltro('marca');
        this.AdicionarTagFiltro('marca', tag_legenda, 'marca', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroModelo(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('modelo', null);
        this.DeletarTagFiltro('modelo');
        this.AdicionarTagFiltro('modelo', tag_legenda, 'modelo', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroVersao(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('versao', null);
        this.DeletarTagFiltro('versao');
        this.AdicionarTagFiltro('versao', tag_legenda, 'versao', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroEstado(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('estado', null);
        this.DeletarTagFiltro('estado');
        this.AdicionarTagFiltro('estado', tag_legenda, 'estado', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    async AdicionarTagFiltroCidade(tag_legenda, param_valor, pesquisar = true) {
        this.DeletarTagQueryStringURL('cidade', null);
        this.DeletarTagFiltro('cidade');
        this.AdicionarTagFiltro('cidade', tag_legenda, 'cidade', param_valor, false);

        if (pesquisar) {
            await this.CarregarPaginas(undefined,true, false);
            await this.CarregarPaginas(undefined,false, true);
        }
    },

    DeletarTagFiltro(tag_chave, tag_legenda = null, param_valor = null) {
        let this_ = this;

        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {
                // Remova tag pelo param_valor (elemento por elemento do grupo)
                if (param_valor !== null) {
                    if (tag_chave == value.tag_chave && param_valor == value.param_valor) {
                        delete this_.Filtro[key];
                    }
                }
                // Remova tag pela legenda (elemento por elemento do grupo)
                else if (tag_legenda !== null) {
                    if (tag_chave == value.tag_chave && tag_legenda == value.tag_legenda) {
                        delete this_.Filtro[key];
                    }
                }
                // Remova tag pela chave (todos os elementos do grupo)
                else {
                    if (tag_chave == value.tag_chave) {
                        delete this_.Filtro[key];
                        return false;
                    }
                }
            }
        });

        $('.tag_filtro').each(function (key, value) {
            let tag_chav = $(this).attr('tag_chave');
            let tag_legend = $(this).attr('tag_legenda');
            let param_chav = $(this).attr('param_chave');
            let param_val = $(this).attr('param_valor');

            // Remova tag pela legenda (elemento por elemento do grupo)
            if (param_valor !== null) {
                if (tag_chav == tag_chave && param_valor == param_val) {
                    $(this).remove();
                }
            }
            // Remova tag pela legenda (elemento por elemento do grupo)
            else if (tag_legenda !== null) {
                if (tag_chav == tag_chave && tag_legend == tag_legenda) {
                    $(this).remove();
                }
            }
            // Remova tag pela chave (todos os elementos do grupo)
            else {
                if (tag_chav == tag_chave) {
                    $(this).remove();
                }
            }
        });
    },

    AdicionarTagFiltro: function (tag_chave, tag_legenda, param_chave, param_valor, useParamValor = false) {
        let ja_existe = false;
        $.each(this.Filtro, function (key, value) {
            if (value !== undefined) {
                if (param_chave == value.param_chave && param_valor == value.param_valor) {
                    ja_existe = true;
                    return false;
                }
            }
        });
        if (ja_existe) {
            return false;
        }

        this.Filtro.push({
            tag_chave: tag_chave,
            tag_legenda: tag_legenda,
            param_chave: param_chave,
            param_valor: param_valor
        });

        this.AdicionarTagQueryStringURL(tag_chave, useParamValor);
        $('.tags_f').append(this.HtmlItemTag(tag_chave, tag_legenda, param_chave, param_valor, useParamValor));

        return true;
    },

    LimparTagsFiltro() {
        this.Filtro = [];
        
        $('.nice_select#ordenacao').val(1).niceSelect('update');
        this.RolamentoPesquisa['orderby'] = 1;

        $('.nice_select#combo_estado').val(0).niceSelect('update');
        this.RolamentoPesquisa['estados_ids'] = null;

        $('.nice_select#combo_cidade').niceSelect('destroy');
        $('.nice_select#combo_cidade').remove();
        this.RolamentoPesquisa['cidades_ids'] = null;

        $('.nice_select#combo_marca').val(0).niceSelect('update');
        this.RolamentoPesquisa['marcas_ids'] = null;

        $('.nice_select#combo_modelo').niceSelect('destroy');
        $('.nice_select#combo_modelo').remove();
        this.RolamentoPesquisa['modelos_ids'] = null;

        $('.nice_select#combo_versao').niceSelect('destroy');
        $('.nice_select#combo_versao').remove();
        this.RolamentoPesquisa['versoes_ids'] = null;

        $("#price_wd").slider("values", 0, this.preco_min_padrao);
        $("#price_wd").slider("values", 1, this.preco_max_padrao);
        this.AtualizarLegendaFaixaPreco();

        $("#ano_wd").slider("values", 0, this.ano_min_padrao);
        $("#ano_wd").slider("values", 1, this.ano_max_padrao);
        this.AtualizarLegendaFaixaAno();

        $("#km_wd").slider("values", 0, this.km_min_padrao);
        $("#km_wd").slider("values", 1, this.km_max_padrao);
        this.AtualizarLegendaFaixaQuilometragem();

        let elementos = $('.accordion#accordionExample').find('label[tag_chave="Final da placa"]');
        $.each(elementos, function (key, item) {
            let input_check_box = $(item).parent().find("input[type=checkbox]");
            input_check_box.prop('checked', true);
        });

        elementos = $('.accordion#accordionExample').find('label[tag_chave="carro"]');
        $.each(elementos, function (key, item) {
            let input_check_box = $(item).parent().find("input[type=checkbox]");
            input_check_box.prop('checked', true);
        });

        let lista = $('.accordion#accordionExample').find('.nice-select.nice_select.select-comarison-car');
        lista.css('width', '100%');
        lista.css('max-height', '150px');

        lista = $('.accordion#accordionExample').find('.nice-select>.list');
        lista.css('width', '100%');
        lista.css('max-height', '150px');

        $('.tags_f').empty();
    },

    HtmlItemTag: function (tag_chave, tag_legenda, param_chave, param_valor, use_valor) {
        return `<a href="#" class='tag_filtro' 
            tag_chave='${tag_chave}' 
            tag_legenda='${tag_legenda}' 
            param_chave='${param_chave}' 
            param_valor='${param_valor}'
            use_valor='${use_valor}'>${tag_legenda}<i class="ti-close"></i></a>`;
    },

    Pesquisar(analitico = false, async = true) {
        var this_ = this;

        var params = {};
        params['orderby'] = this_.RolamentoPesquisa.orderby;
        params['offset'] = this_.RolamentoPesquisa.offset;
        params['skip'] = this_.RolamentoPesquisa.skip;
        params['lote'] = this_.RolamentoPesquisa.lote;

        if (analitico)
            params['analitico'] = 1;

        $.each(this.RolamentoPesquisa, function (key, value) {
            if (value !== null) {
                if (key.endsWith('_ids')) {
                    params[key] = '[' + value + ']'; // Coloca no formato de lista os campos terminados em '_ids'
                }
                else
                    params[key] = value;
            }
            else if (value == NaN || value == undefined || value == null) {
                delete params[key];
            }
        });

        // Converte o filtro em parâmetros para o endpoint de pesquisa
        $.each(this_.Filtro, function (key, value) {
            if (value !== undefined && value !== null) {
                if (value.param_chave.endsWith('_ids')) {
                    if (params.hasOwnProperty(value.param_chave)) {
                        // Valor agregado na Array
                        let arr = JSON.parse(params[value.param_chave]);
                        arr.push(parseInt(value.param_valor));
                        var str = JSON.stringify($.unique(arr));
                        params[value.param_chave] = str;
                    }
                    else
                        // Primeiro valor da Array
                        params[value.param_chave] = '[' + value.param_valor + ']';
                }
                else
                    params[value.param_chave] = value.param_valor; // Não terminados em '_ids' é valor único
            }
        });

        return new Promise( function (resolve, reject ) {
            $.ajax({
                url: localStorage.getItem('api') + '/v1/mobile/carros',
                type: "GET", cache: true, async: async, contentData: 'json',
                contentType: 'application/json;charset=utf-8',
                beforeSend: function (xhr) {
                    if (Logado()) xhr.setRequestHeader('Authorization', "Bearer " + StorageGetItem("token")); // Mágica aqui
                },
                data: params,
                success: function (result, textStatus, request) {

                    resolve(result);

                    /*
                    if (limpar) {
                        this_.LimparItensProdutos();
                    };

                    if (analitico) {
                        $('#encontrados').html(result.encontrados);
                    }
                    else {
                        
                        this_.RolamentoPesquisa.offset = result.next_offset;
                        this_.RolamentoPesquisa.skip = result.next_skip;

                        var produtos = result.registros;
                        $.each(produtos, function (i, produto) {
                            $('.product_grid_inner').children('.row').append(this_.HtmlItemProduto(produto));
                        });
                    }
                    */

                },
                error: function (request, textStatus, errorThrown) {
                    StorageClear();
                    alert(JSON.stringify(request));

                    reject(errorThrown)
                    

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
        });
    },

    async CarregarPaginas(pagina = 1, limpar = false, analitico = false, async = true) {
        var this_ = this;

        let pagination = $('.pesquisa_carro').find('ul.pagination.pesquisa-carro');
        if (limpar) {
            this_.RolamentoPesquisa.offset = 0;
            this_.RolamentoPesquisa.skip = 0;
            this_.LimparItensProdutos();
            pagination.empty();
            this_.TotPaginasFor = 6;
        };

        const atividadeLocal = this_.UltimaAtivadadeCarregamento = new Object();

        let exibirPagina = true;

        let html_meus_carro= $('.product_grid_inner').children('.row');

        if (!analitico) {
            pagination.find('li#pag_proximo').remove();
        }

        for (let i = pagina; i <= this_.TotPaginasFor; i++) {

            let result = await this_.Pesquisar(analitico, async)

            if (analitico) {
                $('#encontrados').html(result.encontrados);
                return;
            }

            if(atividadeLocal !== this_.UltimaAtivadadeCarregamento){
                return;
            }

            if(i == 1){
                pagination.empty();
                html_meus_carro.empty();
                pagination.append('<li class="page-item" id="pag_anterior"><a class="page-link" href="#"><i class="icon-arrow"></i></a></li>');
            }
            
            this_.RolamentoPesquisa.offset = result.offset;
            this_.RolamentoPesquisa.lote = result.lote;
            this_.RolamentoPesquisa.skip = result.next_skip;
            this_.RolamentoPesquisa.next_skip = result.next_skip;
            this_.RolamentoPesquisa.next_offset = result.next_offset;
            
            let meus_carros = result.registros;

            if (meus_carros.length > 0) {
                let html_meus_carro = $('.product_grid_inner').children('.row');;

                $.each(meus_carros, function (j, carro) {
                    html_meus_carro.append(this_.HtmlItemProduto(carro, i, exibirPagina));

                    this_.PaginaAtual = pagina;
                });

                pagination.append(this_.HtmlPagination(i, exibirPagina))
                exibirPagina = false;
                this_.RolamentoPesquisa.offset = this_.RolamentoPesquisa.next_offset;
                this_.RolamentoPesquisa.skip = this_.RolamentoPesquisa.next_skip;
            }
            if (this_.RolamentoPesquisa.next_skip < 0 || this_.RolamentoPesquisa.next_offset < 0) {
                break;
            }
        }

        pagination.append('<li class="page-item" id="pag_proximo"><a class="page-link" href="#"><i class="icon-arrow_2"></i></a></li>');

        this_.PaginaAtual = pagina;
    },

    EventClickPaginacao: function () {
        var this_ = this;
        let html_meus_carros = $('.product_grid_inner').children('.row');

        $(document).on('click', '.pagination.pesquisa-carro a.page-link', function(event) {
            event.preventDefault();
            let numPageClicked = $(this).text();
            let paginaAtual = this_.PaginaAtual;

            if (numPageClicked === '') {
                let valor = $(this).children().attr('class');
                // Anterior
                if (valor === 'icon-arrow') {
                    numPageClicked = parseInt(this_.PaginaAtual) - 1;
                    if (numPageClicked <= 0) {
                        return;
                    }

                    if ((this_.TotPaginasFor - numPageClicked) % this_.QtdPaginas === 0) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked + i}"]`).css('display', 'none');
                        }

                        // Exibir lista anterior
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked + 1 - i}"]`).css('display', 'block');
                        }
                    }
                }
                // Próximo
                else if (valor === 'icon-arrow_2') {
                    numPageClicked = parseInt(this_.PaginaAtual) + 1;

                    let qtdPaginas = $('.pesquisa_carro').find('ul.pagination.pesquisa-carro li').length - 2;

                    // Verificar se tem paginas na memoria
                    if ((numPageClicked - 1) % this_.QtdPaginas === 0 && numPageClicked < this_.TotPaginasFor) {
                        // Ocultar Lista atual
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                        }

                        // Exibir lista próximos
                        for (let i = 1; i <= this_.QtdPaginas; i++) {
                            $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked - 1 + i}"]`).css('display', 'block');
                        }
                    } else {
                        // Carregar mais paginas
                        if (numPageClicked > qtdPaginas) {
                            // Verificar se tem mais página para carregar
                            if (this_.RolamentoPesquisa.next_skip < 0 || this_.RolamentoPesquisa.next_offset < 0) {
                                return;
                            } else {
                                this_.TotPaginasFor = numPageClicked + (this_.QtdPaginas - 1);

                                // Ocultar lista anteriores
                                for (let i = 1; i <= this_.QtdPaginas; i++) {
                                    $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked - i}"]`).css('display', 'none');
                                }

                                // Carregar Proximos
                                this_.CarregarPaginas(numPageClicked,false,false);
                            }
                        }
                    }
                }
            }

            $('.pesquisa_carro').find('ul.pagination.pesquisa-carro li.page-item.active').attr('class', 'page-item');
            $('.pesquisa_carro').find(`ul.pagination.pesquisa-carro li.page-item[numPage="${numPageClicked}"]`).attr('class', 'page-item active');

            html_meus_carros.find(`div[numPage="${paginaAtual}"]`).each(function (i, element) {
                $(this).css('display', 'none');
            });

            html_meus_carros.find(`div[numPage="${numPageClicked}"]`).each(function (i, element) {
                $(this).css('display', 'block');
            });

            this_.PaginaAtual = numPageClicked;

            //let target = this_.spa.find('ul.pagination.meus_carros').offset().top;
            //$("html, body").animate( { scrollTop: target } );
        });
    },

    CarregarComboOrdenacao() {
        this.TagsLoading['ordenacao'] = true;
        var this_ = this;

        this.LimparComboOrdenacao();

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/ordenacao',
            type: "GET", cache: true, async: true, contentData: 'json',
            success: function (result, textStatus, request) {
                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'ordenacao',
                        tag_legenda: obj.nome,
                        param_chave: 'orderby',
                        param_valor: obj.id
                    });
                });
                this_.TagsLoading['ordenacao'] = false;

                $.each(result, function (i, obj) {
                    $('.nice_select#ordenacao').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                $('.nice_select#ordenacao').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();
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
    },


    /*

    HtmlItemProduto: function (produto) {
        return `<div class="col-lg-4 col-md-4 col-sm-6 wow animated fadeInUp" data-wow-delay="0.2s">
            <div class="l_collection_item orange grid_four red">
                <div class="car_img">
                    <a href="detalhes-produto.html?carro=${produto.id}">
                        <img class="img-fluid"
                            src="${localStorage.getItem('api')}/v1/mobile/carros/${produto.id}/imagens/${produto.imagem_hash}?tipo=principal" alt=""></a>
                        ${SegmentoCarros.HtmlFaixaSuperiorProduto(produto)}
                </div>
                <div class="text_body">
                    <a href="detalhes-produto.html?carro=${produto.id}">
                        <h4>${produto.marca} - ${produto.modelo}</h4>
                    </a>
                    <h5>${produto.preco}</h5>
                    <p>Ano/Modelo <span>${produto.ano}</span></p>
                </div>
                <div class="text_footer">
                    <a href="#"><i class="icon-engine"></i> 2500</a>
                    <a href="#"><i class="icon-gear1"></i> Manual</a>
                    <a href="#"><i class="icon-oil"></i>20/24</a>
                </div>
            </div>
        </div>`;
    },
    */

    HtmlItemProduto: function (produto, numPage, exibirPagina) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/carros/' + produto.id + '/imagens/' + produto.imagem_hash + '?tipo=principal';

        return `<div class="col-lg-4 col-md-4 col-sm-6 " data-wow-delay="0.2s" produto_id="${produto.id}" numPage="${numPage}" style="display: ${exibirPagina ? "block" : "none"};">
                    <div class="l_collection_item orange grid_four red">
                        <div class="car_img">
                            <a href="detalhes-produto.html?carro=${produto.id}"><img class="img-fluid" src="${url_imagem}" alt="Imagem principal"></a>
                            ${SegmentoCarros.HtmlFaixaSuperiorProduto(produto, 15, 20, 20)}
                        </div>
                        <div class="text_body">
                            <a href="product-details.html"><h4>${produto.marca} - ${produto.modelo}</h4></a>
                            <h5>${produto.preco}</h5>
                            <p>Ano/Modelo: <span>${produto.ano}</span></p>
                            <p>Quilometragem: <span>${produto.km.split(' ')[0]}</span></p>
                        </div>
                    </div>
                </div>`
    },

    LimparItensProdutos() {
        $('.product_grid_inner').children('.row').empty();
    },

    LimparComboOrdenacao() {
        $('.nice_select#ordenacao').empty();
        $('.nice_select#ordenacao').niceSelect('update');
    },

    CarregarAcordaosFitro() {
        $('.accordion#accordionExample').empty();
        $('#accordionExample').collapse('dispose');
        this.CarregarComboEstados('one');
        this.CarregarComboMarcas('two');
        this.CarregarAcordaoFaixaPreco('three');
        this.CarregarAcordaoFaixaAno('four');
        this.CarregarAcordaoFaixaQuilometragem('five');
        this.CarregarAcordaoCarrosNovosUsados('six');
        this.CarregarAcordaoFinalDePlaca('seven');
        this.CarregarAcordaoCategoria('eight');
        
    },

    CarregarAcordaoCarrosNovosUsados: function (collaspedId) {
        this.TagsLoading['carro'] = true;

        let this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/tags',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';
                let index = 0;

                $.each(result, function (key, item) {

                    if(item.nome === 'Alienado' || item.nome === 'Carro Novo' || item.nome === 'Carro Usado' || item.nome === 'Quitado'){
                        this_.Tags.push({
                            tag_chave: 'carro',
                            tag_legenda: item.nome,
                            param_chave: 'detalhes_ids',
                            param_valor: item.id
                        });
    
                        htmlItems += this_.HtmlItemAcordaoCarro(item, index);
                        index++;
                    }
                });

                $('.accordion#accordionExample').append(this_.HtmlAcordaoCarrosNovosUsados(htmlItems,collaspedId));

                this_.TagsLoading['carro'] = false;
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();
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
    },

    CarregarAcordaoFinalDePlaca: function (collapsedId) {
        this.TagsLoading['final_de_placa'] = true;
        let this_ = this;

        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=final da placa',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';
                let index = 0;

                $.each(result, function (key, item) {
                    this_.Tags.push({
                        tag_chave: item.chave,
                        tag_legenda: item.chave + ' ' + item.valor,
                        param_chave: 'especificacoes_ids',
                        param_valor: item.id
                    });

                    htmlItems += this_.HtmlItemAcordaoFinalDePlaca(item, index);
                    index++;
                });

                this_.TagsLoading['final_de_placa'] = false;
                $('.accordion#accordionExample').append(this_.HtmlAcordaoFinalDePlaca(htmlItems, collapsedId));
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();
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
    },

    CarregarAcordaoCategoria(collapsedId) {
        this.TagsLoading['categoria'] = true;

        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores?chave=categoria',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {
                let htmlItems = '';

                var count = 0;

                $.each(result, function (key, item) {
                    this_.Tags.push({
                        tag_chave: item.chave,
                        tag_legenda: item.valor,
                        param_chave: 'especificacoes_ids',
                        param_valor: item.id
                    });

                    count++;
                    if (count % 2 != 0) htmlItems += '<div class="row">';

                    htmlItems += this_.HtmlItemAcordaoCategoria(item);

                    if (count % 2 == 0) htmlItems += '</div>';
                });

                this_.TagsLoading['categoria'] = false;

                $('.accordion#accordionExample').append(this_.HtmlAcordaoCategoria(htmlItems, collapsedId));
            },
            error: function (request, textStatus, errorThrown) {
                StorageClear();

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
    },

    CarregarAcordaoFaixaAno(collapsedId) {
        let this_ = this;
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaAno(collapsedId));

        $("#ano_wd").slider({
            range: true,
            min: this_.ano_min_padrao,
            max: this_.ano_max_padrao,
            values: [this_.ano_min_padrao, this_.ano_max_padrao],
            slide: function (event, ui) {
                $("#ano_amount").val(ui.values[0] + " - " + ui.values[1]);
            }
        });
        this.AtualizarLegendaFaixaPreco();
    },

    CarregarAcordaoFaixaPreco(collapsedId) {
        let this_ = this;
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaPreco(collapsedId));

        $("#price_wd").slider({
            range: true,
            min: this_.preco_min_padrao,
            max: this_.preco_max_padrao,
            values: [this_.preco_min_padrao, this_.preco_max_padrao],
            slide: function (event, ui) {
                $("#amount").val("R$" + ui.values[0].toLocaleString('de-DE') + " - R$" + ui.values[1].toLocaleString('de-DE'));
            }
        });
        this.AtualizarLegendaFaixaPreco();
    },

    CarregarAcordaoFaixaQuilometragem(collapsedId) {
        let this_ = this;
        $('.accordion#accordionExample').append(this.HtmlAcordaoFaixaQuilometragem(collapsedId));

        $("#km_wd").slider({
            range: true,
            min: this_.km_min_padrao,
            max: this_.km_max_padrao,
            values: [this_.km_min_padrao, this_.km_max_padrao],
            slide: function (event, ui) {
                $("#km_amount").val(ui.values[0].toLocaleString('de-DE') + " km - " + ui.values[1].toLocaleString('de-DE') + " km");
            }
        });
        this.AtualizarLegendaFaixaQuilometragem();
    },

    CarregarComboEstados(collapsedId){
        this.TagsLoading['estado'] = true;
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/estados',
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {

                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'estado',
                        tag_legenda: obj.nome,
                        param_chave: 'estados_ids',
                        param_valor: obj.id
                    });
                });
                this_.TagsLoading['estado'] = false;

                htmlItems = '';
                

                htmlItems += '<select class="nice_select select-comarison-car" id="combo_estado">'
                htmlItems += '</select>'

                $('.accordion#accordionExample').append(this_.HtmlAcordaoEstadoCidade(htmlItems, collapsedId))
                let combo_estado = $('.accordion#accordionExample').find('#combo_estado');
     
                combo_estado.empty();
                combo_estado.niceSelect('destroy');
                combo_estado.append(`<option value="0">Selecione o estado</option>`);
                $.each(result, function (i, combo) {
                    combo_estado.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
        
                combo_estado.niceSelect();
                combo_estado.val(0).niceSelect('update');
                let lista = $('.accordion#accordionExample').find('.nice-select>.list');
                lista.css('width', '100%');
                lista.css('max-height', '150px');

                let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
                niceSelectEspe.css('width', '100%');
            },
            error: function (request, textStatus, errorThrown) {
                //StorageClear();

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
    },

    CarregarComboCidades(id_estado){
        this.TagsLoading['cidade'] = true;
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/cidades/' + id_estado,
            type: "GET", cache: true, async: false, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {

                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'cidade',
                        tag_legenda: obj.nome,
                        param_chave: 'cidades_ids',
                        param_valor: obj.id
                    });
                });
                this_.TagsLoading['cidade'] = false;

                htmlItems = '';

                htmlItems += '<select class="nice_select select-comarison-car" id="combo_cidade">'
                htmlItems += '</select>'

                let acordao_exemplo = $('.accordion#accordionExample');

                let combo_cidade = acordao_exemplo.find('#combo_cidade');

                if(combo_cidade.length <= 0){
                    acordao_exemplo.find('#area_selecao_1').append(htmlItems);
                    combo_cidade = acordao_exemplo.find('#combo_cidade');
                }else{
                    combo_cidade.empty();
                }
                
                combo_cidade.niceSelect('destroy');
                combo_cidade.append(`<option value="0">Selecione o cidade</option>`);
                $.each(result, function (i, combo) {
                    combo_cidade.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
        
                combo_cidade.niceSelect();
                combo_cidade.val(0).niceSelect('update');
                let lista = $('.accordion#accordionExample').find('.nice-select>.list');
                lista.css('width', '100%');
                lista.css('max-height', '150');

                let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
                niceSelectEspe.css('width', '100%');
            },
            error: function (request, textStatus, errorThrown) {
                //StorageClear();

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
    },

    CarregarComboMarcas(collapsedId){
        this.TagsLoading['marca'] = true;
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/marcas',
            type: "GET", cache: true, async: false, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {

                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'marca',
                        tag_legenda: obj.nome,
                        param_chave: 'marcas_ids',
                        param_valor: obj.id
                    });
                });
                this_.TagsLoading['marca'] = false;

                htmlItems = '';
                
                this_.TagsLoading['marca'] = false;

                htmlItems += '<select class="nice_select select-comarison-car" id="combo_marca">'
                htmlItems += '</select>'

                $('.accordion#accordionExample').append(this_.HtmlAcordaoMarcaModeloVersao(htmlItems, collapsedId))
                let combo_marca = $('.accordion#accordionExample').find('#combo_marca');
     
                combo_marca.empty();
                combo_marca.niceSelect('destroy');
                combo_marca.append(`<option value="0">Selecione a marca</option>`);
                $.each(result, function (i, combo) {
                    combo_marca.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
        
                combo_marca.niceSelect();
                combo_marca.val(0).niceSelect('update');
                let lista = $('.accordion#accordionExample').find('.nice-select>.list');
                lista.css('width', '100%');
                lista.css('max-height', '150px');

                let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
                niceSelectEspe.css('width', '100%');
            },
            error: function (request, textStatus, errorThrown) {
                //StorageClear();

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
    },

    CarregarComboModelos: function(id_marca){
        this.TagsLoading['modelo'] = true;
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/modelos?marca_id=' + id_marca,
            type: "GET", cache: true, async: false, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {

                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'modelo',
                        tag_legenda: obj.nome,
                        param_chave: 'modelos_ids',
                        param_valor: obj.id
                    });
                });

                htmlItems = '';
                
                this_.TagsLoading['modelo'] = false;

                htmlItems += '<select class="nice_select select-comarison-car" id="combo_modelo">'
                htmlItems += '</select>'

                let acordao_exemplo = $('.accordion#accordionExample');

                let combo_modelo = acordao_exemplo.find('#combo_modelo');

                if(combo_modelo.length <= 0){
                    acordao_exemplo.find('#area_selecao_2').append(htmlItems);
                    combo_modelo = acordao_exemplo.find('#combo_modelo');
                }else{
                    combo_modelo.empty();
                }
                
                combo_modelo.niceSelect('destroy');
                combo_modelo.append(`<option value="0">Selecione o modelo</option>`);
                $.each(result, function (i, combo) {
                    combo_modelo.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
        
                combo_modelo.niceSelect();
                combo_modelo.val(0).niceSelect('update');
                let lista = $('.accordion#accordionExample').find('.nice-select>.list');
                lista.css('width', '100%');
                lista.css('max-height', '150');

                let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select');
                niceSelectEspe.css('width', '100%');
            },
            error: function (request, textStatus, errorThrown) {
                //StorageClear();
                
                //alert(JSON.stringify(request));

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
    },

    CarregarComboVersao: function(id_modelo){
        this.TagsLoading['versao'] = true;
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/carros/versoes?modelo_id=' + id_modelo,
            type: "GET", cache: true, async: false, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (result, textStatus, request) {

                $.each(result, function (key, obj) {
                    this_.Tags.push({
                        tag_chave: 'versao',
                        tag_legenda: obj.nome,
                        param_chave: 'versoes_ids',
                        param_valor: obj.id
                    });
                });


                htmlItems = '';
                
                this_.TagsLoading['versao'] = false;

                htmlItems += '<select class="nice_select select-comarison-car" id="combo_versao">'
                htmlItems += '</select>'

                let acordao_exemplo = $('.accordion#accordionExample');

                let combo_versao = acordao_exemplo.find('#combo_versao');

                if(combo_versao.length <= 0){
                    acordao_exemplo.find('#area_selecao_2').append(htmlItems);
                    combo_versao = acordao_exemplo.find('#combo_versao');
                }else{
                    combo_versao.empty();
                }
                
                combo_versao.niceSelect('destroy');
                combo_versao.append(`<option value="0">Selecione a versão </option>`);
                $.each(result, function (i, combo) {
                    combo_versao.append(`<option value="${combo.id}">${combo.nome}</option>`);
                });
        
                combo_versao.niceSelect();
                combo_versao.val(0).niceSelect('update');
                let lista = $('.accordion#accordionExample').find('.nice-select>.list');
                lista.css('width', '100%');
                lista.css('max-height', '150px');

                let niceSelectEspe = $('.accordion#accordionExample').find('.nice-select.nice_select.select-comarison-car');
                niceSelectEspe.css('width', '100%');
            },
            error: function (request, textStatus, errorThrown) {
                //StorageClear();
                
                //alert(JSON.stringify(request));

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
    },

    AtualizarLegendaFaixaPreco() {
        $("#amount").val("R$" + $("#price_wd").slider("values", 0).toLocaleString('de-DE') +
            " - R$" + $("#price_wd").slider("values", 1).toLocaleString('de-DE'));
    },

    AtualizarLegendaFaixaAno() {
        $("#ano_amount").val($("#ano_wd").slider("values", 0) +
            " - " + $("#ano_wd").slider("values", 1));
    },

    AtualizarLegendaFaixaQuilometragem() {
        $("#km_amount").val($("#km_wd").slider("values", 0).toLocaleString('de-DE') +
            " km - " + $("#km_wd").slider("values", 1).toLocaleString('de-DE') + " km");
    },

    HtmlItemAcordaoCarro: function (item, index) {
        
        // Analítico
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?detalhes=' + item.nome,
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: async function (result, textStatus, request) {
                $('span#detalhes_' + item.nome.replace(/ /g, '_')).html('(' + result.total + ')');
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        return `<div class="col-6">
                    <div class="creat_account">
                        <input type="checkbox" id="p-option-carro-${index}" name="selector" checked>
                        <label class="tag_item_check" for="p-option-carro-${index}"
                            tag_legenda='${item.nome}' tag_chave='carro' param_chave='detalhes_ids' param_valor='${item.id}'
                            >${item.nome} <span id="detalhes_${item.nome.replace(/ /g, '_')}">(0)</span></label>
                        <div class="check"></div>
                        
                    </div>
                </div>`;
    },

    HtmlItemAcordaoFinalDePlaca: function (item, index) {

        
        // Analítico
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?final_da_placa=' + item.valor,
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: async function (result, textStatus, request) {
                $('span#analitico_final_de_placa_' + item.valor.replace(/ /g, '_')).html('(' + result.total + ')');
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        return `<div class="col-6">
                    <div class="creat_account">
                        <input type="checkbox" id="p-option-final-placa-${index}" name="selector" checked>
                        <label class="tag_item_check" for="p-option-final-placa-${index}"
                            tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'
                            >${item.valor} <br><span id="analitico_final_de_placa_${item.valor.replace(/ /g, '_')}">(0)</span></label>
                        <div class="check"></div>
                    </div>
                </div>`;
    },

    HtmlItemAcordaoCategoria: function (item) {
        let url_imagem = localStorage.getItem('api') + '/v1/mobile/especificacoes/carro/valores/imagem?id_especificacao=' + item.id;

        if (!item.contem_imagem) {
            url_imagem = './img/car/car-2.png';
        }

        // Analítico
        $.ajax({
            url: localStorage.getItem('api') + '/v1/mobile/analitico/carro?categoria=' + item.valor,
            type: "GET", cache: true, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            success: async function (result, textStatus, request) {
                $('span#analitico_categoria_' + item.valor.replace('/', '_')).html('(' + result.total + ')');
            },
            error: function (request, textStatus, errorThrown) {
            }
        });

        return `<div class="col-6">
            <div class="type_item">
                <div class="image">
                    <a href="#" class='tag_item' 
                    tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'><img class="img-fluid"
                        src="${url_imagem}" alt=""></a>
                </div>
                <a href="#" class='tag_item' 
                    tag_legenda='${item.valor}' tag_chave='${item.chave}' param_chave='especificacoes_ids' param_valor='${item.id}'>
                    <h4>${item.valor} <span id=analitico_categoria_${item.valor.replace('/', '_')}>(0)</span></h4>
                </a>
            </div>
        </div>
        `;
    },

    HtmlAcordaoFaixaAno: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Ano
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="">

                <div class="card-body"
                    style="padding-bottom: 0px !important">

                    <div class="price_wd_inner ">
                        <div id="ano_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="ano_amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFaixaPreco: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Preço
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="">

                <div class="card-body"
                style="padding-bottom: 0px !important">

                    <div class="price_wd_inner ">
                        <div id="price_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFaixaQuilometragem: function (collapsedId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapsedId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapsedId}" aria-expanded="true" aria-controls="collapse${collapsedId}"
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Quilometragem
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapsedId}" class="collapse show" aria-labelledby="heading${collapsedId}"
                data-parent="" >

                <div class="card-body" 
                    style="padding-bottom: 0px !important" >

                    <div class="price_wd_inner">
                        <div id="km_wd" style="margin-right:15px"></div>
                        
                        <input type="text" id="km_amount" readonly style="width:100%">
                    </div>
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoCategoria: function (htmlItems, collapseId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Categoria
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}" 
                data-parent="">

                <div class="card-body" 
                    style="padding-bottom: 0px !important" >

                    <div class="row car_body wd_scroll">
                        ${htmlItems}
                    </div>
                </div>
            </div>
        </div>`
    },

    HtmlAcordaoCarrosNovosUsados: function (htmlItems, collapseId) {
        return `<div class="card">
            <div class="card-header" id="heading${collapseId}">
                <button class="btn btn-link" type="button" data-toggle="collapse"
                    data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                    style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                    Carros
                    <i class="ti-plus"></i>
                    <i class="ti-minus"></i>
                </button>
            </div>
            <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}"
                data-parent="">
                
                <div class="row card-body"
                    style="padding-bottom: 0px !important height:150px;" >
                    ${htmlItems}
                </div>
            </div>
        </div>`;
    },

    HtmlAcordaoFinalDePlaca: function (htmlItems, collapseId) {
        return `<div class="card">
                    <div class="card-header" id="heading${collapseId}">
                        <button class="btn btn-link" type="button" data-toggle="collapse"
                            data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                            style="padding: 10px 0px !important; font-size: ${this.TamanhoTituloCategorias}px !important">
                            Final de Placa
                            <i class="ti-plus"></i>
                            <i class="ti-minus"></i>
                        </button>
                    </div>
                    <div id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}"
                        data-parent="">
                        
                        <div class="row card-body"
                            style="padding-bottom: 0px !important" >
                                ${htmlItems}
                        </div>
                    </div>
                </div>`;
    },
   
    HtmlAcordaoEstadoCidade : function(htmlItems, collapseId){
        return `<div class="card">
                    <div class="card-header" id="heading${collapseId}">
                        <button class="btn btn-link" type="button" data-toggle="collapse"
                            data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                            style="padding: 10px 0px !important; font-size: 15px !important">
                            Estado, Cidade
                            <i class="ti-plus"></i>
                            <i class="ti-minus"></i>
                        </button>
                    </div>
                    <div style="z-index:0;" id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}" 
                        data-parent="">

                        <div class="card-body" id="area_selecao_1" style="padding-bottom: 0px !important; height:250px; ">
                            
                            ${htmlItems}
                            
                        </div>
                    </div>
                </div>`
    },

    HtmlAcordaoMarcaModeloVersao : function(htmlItems, collapseId){
        return `<div class="card">
                    <div class="card-header" id="heading${collapseId}">
                        <button class="btn btn-link" type="button" data-toggle="collapse"
                            data-target="#collapse${collapseId}" aria-expanded="true" aria-controls="collapse${collapseId}" 
                            style="padding: 10px 0px !important; font-size: 15px !important">
                            Marca, Modelo, Versão
                            <i class="ti-plus"></i>
                            <i class="ti-minus"></i>
                        </button>
                    </div>
                    <div style="z-index:0;" id="collapse${collapseId}" class="collapse show" aria-labelledby="heading${collapseId}" 
                        data-parent="">

                        <div class="card-body" id="area_selecao_2" style="padding-bottom: 0px !important; height:285px; ">
                            
                            ${htmlItems}
                            
                        </div>
                    </div>
                </div>`
    },

    HtmlPagination: function (numPage, exibirPagina) {
        return `
            <li class="page-item ${exibirPagina ? "active" : ""}" numPage="${numPage}"><a class="page-link" href="#">${numPage}</a></li>
        `
    },

};

PesquisaCarro.Inicializar();
TelaCompartilhamento.Inicializar();
SegmentoCarros.Construtor('carros');