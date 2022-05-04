var AvaliacaoVendedor = {
    spa: null,
    id_vendedor : null,

    RolamentoAvaliacoes : {
        offset : 0,
        lote : 10,
        next_offset : -1
    },

    Construtor(){
        var baseTela = '.spa.general_ques_area.p_100';
        this.spa = $(baseTela);
    },

    Inicializar(){
        const urlSearchParams = new URLSearchParams(window.location.search);
        const param_query = Object.fromEntries(urlSearchParams.entries());

        if('id_vendedor' in param_query){
            // Edição
            this.id_vendedor = param_query['id_vendedor'];

            this.ObterReputacaoVendedor(this.id_vendedor);
            this.ObterAvaliacoesVendedor(this.id_vendedor);
            this.EventClickCarregarAvaliacoes();
            this.EventClickAvaliarVendedor();
        }else{
            var err = new Error('Not found');
            err.status = 404;
            Redirecionar('notfound');
            return;
        }

        // Avaliar
        this.spa.find('.avaliar').css('font-size',30);
        this.spa.find('.avaliar').rate({
            max_value: 5, 
            step_size: 0.5, 
            initial_value: 1, 
            selected_symbol_type: 'utf8_star', 
            cursor: 'default', 
            readonly: false
        });
        this.spa.find('.avaliar>.rate-hover-layer').css('color', 'orange');
        this.spa.find('.avaliar>.rate-select-layer').css('color', 'orange');
       
        // Avaliador
        this.spa.find('.avaliador').css('font-size',20);
        this.spa.find('.avaliador').rate({
            max_value: 5, 
            step_size: 0.5, 
            initial_value: 3, 
            selected_symbol_type: 'utf8_star', 
            cursor: 'default', 
            readonly: true
        });
        this.spa.find('.avaliador>.rate-hover-layer').css('color', 'orange');
        this.spa.find('.avaliador>.rate-select-layer').css('color', 'orange');

        this.spa.find('.avaliador>.rate-base-layer').css('margin-top', '8px');
        this.spa.find('.avaliador>.rate-hover-layer').css('margin-top', '8px');
        this.spa.find('.avaliador>.rate-select-layer').css('margin-top', '8px');
    },

    ObterReputacaoVendedor : function(id_usuario){
        let this_ = this;
        $.ajax({
            url: StorageGetItem('api') + '/v1/mobile/analitico/usuarios/' + id_usuario + '?reputacao=1',
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function (result) {
                this_.HtmlAvaliacoesQuantitativas(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    ObterAvaliacoesVendedor : function(id_vendedor){
        let this_ = this;
        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/' + id_vendedor + '/feedback?offset=' + this_.RolamentoAvaliacoes.offset + '&lote=' + this_.RolamentoAvaliacoes.lote,
            type: 'GET', cache: false, async: true, dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            beforeSend: function () {
            },
            success: function (result) {

                this_.RolamentoAvaliacoes.offset = result.next_offset;
                this_.RolamentoAvaliacoes.next_offset = result.next_offset;
                if(result.next_offset < 0){
                    this_.spa.find("#carregar_mais_avaliacoes").hide();
                }
                this_.HtmlAvaliacoes(result);
            },
            error: function (err) {
                reject(err) // Reject the promise and go to catch()
            }
        });
    },

    AvaliarVendedor : function(id_vendedor){
        let this_ = this;
        let estrelas = this.spa.find('.avaliar').rate("getValue");
        let comentario = this.spa.find("#mensagem_avaliacao").val();

        this.spa.find('.avaliar').rate("setValue", 1);
        this.spa.find("#mensagem_avaliacao").val('');

        if(comentario.trim() == ''){
            comentario = undefined;
        }

        $.ajax({
            url: StorageGetItem('api') + '/v1/usuarios/' + id_vendedor + '/feedback',
            type: 'post', cache: false, async: true, dataType: 'json',
            data:{
                estrelas : estrelas,
                comentario : comentario
            },
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            success: function (result) {
                Mensagem('Vendedor avaliado com êxito!', 'success');
                this_.spa.find(".avaliacoes").rate('destroy');
                this_.spa.find(".avaliacoes").empty();
                this_.spa.find(".area_comentario").empty();

                this_.RolamentoAvaliacoes.offset = 0;
                this_.RolamentoAvaliacoes.lote = 10;
                this_.RolamentoAvaliacoes.next_offset = -1;

                this_.ObterReputacaoVendedor(id_vendedor);
                this_.ObterAvaliacoesVendedor(id_vendedor);
            },
            error: function (request, errorThrown) {
                if (!MensagemErroAjax(request, errorThrown)) {
                    try {
                        var obj = $.parseJSON(request.responseText)
                        Mensagem(obj.mensagem, 'warning');
                    } catch (error) {
                        Mensagem(request.responseText, 'error');
                    }
                }
            }
        });
    },


    HtmlAvaliacoesQuantitativas(result){
        let total_estrelas = parseFloat(result.total_estrelas);
        let total_avaliacoes = parseFloat(result.total_avaliacoes);

        let avaliacoes = this.spa.find('.avaliacoes');

        // Total avaliacoes
        avaliacoes.css('font-size',30);
        avaliacoes.rate({
            max_value: 5, 
            step_size: 0.5, 
            initial_value: (total_estrelas / total_avaliacoes), 
            selected_symbol_type: 'utf8_star', 
            cursor: 'default', 
            readonly: true
        });
        avaliacoes.find('.rate-hover-layer').css('color', 'orange');
        avaliacoes.find('.rate-select-layer').css('color', 'orange');
        avaliacoes.append(`<br><div style="font-size: 14px;"> <span>Avaliações: (${(total_avaliacoes)})</span> </div>`)
    },

    HtmlAvaliacoes : function(result){
        let this_ = this;
        let area_comentario = this.spa.find('.area_comentario');

        $.each(result.registros, function (i, avaliacao) {
            area_comentario.append(
                `<div style="margin-top: 10px;" class="product_overview_text">
                    <h7>${avaliacao.data_hora} </h7>
                    <h6 style="display: inline-block;">${avaliacao.nome} </h6>
                    <div id="usuario_avaliou_${i}" style="display: inline-block;"></div>
                    <div style="border-bottom: 1px solid rgba(13, 13, 13, 0.1);">
                        <p >
                            ${avaliacao.comentario}
                        </p>
                    </div>
                </div>`
            );
            let avaliador = area_comentario.find(`#usuario_avaliou_${i}`);        
            // Avaliador
            avaliador.css('font-size',20);
            avaliador.rate({
                max_value: 5, 
                step_size: 0.5, 
                initial_value: avaliacao.estrelas, 
                selected_symbol_type: 'utf8_star', 
                cursor: 'default', 
                readonly: true
            });
            avaliador.find('.rate-hover-layer').css('color', 'orange');
            avaliador.find('.rate-select-layer').css('color', 'orange');
            avaliador.find('.rate-base-layer').css('margin-top', '8px');
            avaliador.find('.rate-hover-layer').css('margin-top', '8px');
            avaliador.find('.rate-select-layer').css('margin-top', '8px');
    
        });
    },

    EventClickCarregarAvaliacoes : function(){
        let this_ = this;
        $(document).on('click', '#carregar_mais_avaliacoes', function(event) {
            event.preventDefault();
            if(this_.RolamentoAvaliacoes.next_offset > - 1){
                this_.ObterAvaliacoesVendedor(this_.id_vendedor);
            }
        });
    },

    EventClickAvaliarVendedor : function(){
        let this_ = this;
        $(document).on('click', '#avaliar_vendedor', function(event) {
            event.preventDefault();
            this_.AvaliarVendedor(this_.id_vendedor);
        });
    }
};

(function(){
    "use strict"
    AvaliacaoVendedor.Construtor();
    AvaliacaoVendedor.Inicializar();
})(jQuery)