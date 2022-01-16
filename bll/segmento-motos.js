var SegmentoMotos = {
    spa: null,

    Construtor() {
        var baseTela = '.spa>.segmento#motos';
        this.spa = $(baseTela);

        this.spa.find('.nice_select#marca').on('change', function (event) {
            event.preventDefault();
            SegmentoMotos.CarregarComboModelo(this.value);
        });
    },

    InicializarSegmento: function () {
        SegmentoMotos.LimparTodasAsCombosMoto();
        SegmentoMotos.CarregarComboMotoCategoria();
        SegmentoMotos.CarregarComboMotoMarca();
        SegmentoMotos.CarregarComboMotoQuilometragem();
    },

    LimparTodasAsCombosMoto: function () {
        this.spa.find('.nice_select#categoria').empty().append('<option selected="selected" value="0">Categoria</option>');
        this.spa.find('.nice_select#categoria').niceSelect('update');

        this.spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');
        this.spa.find('.nice_select#modelo').niceSelect('update');

        this.spa.find('.nice_select#quilometragem').empty().append('<option selected="selected" value="0">Quilometragem</option>');
        this.spa.find('.nice_select#quilometragem').niceSelect('update');

        this.spa.find('.nice_select#marca').empty().append('<option selected="selected" value="0">Marca</option>');
        this.spa.find('.nice_select#marca').niceSelect('update');
    },

    CarregarComboMotoCategoria: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/categorias',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#categoria').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#categoria').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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
        })
    },

    CarregarComboMotoMarca: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/motos/marcas',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#marca').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#marca').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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

    CarregarComboModelo: function (marca_id) {
        let spa = this.spa;

        spa.find('.nice_select#modelo').empty().append('<option selected="selected" value="0">Modelo</option>');

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/motos/modelos?marca_id=' + marca_id,
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#modelo').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#modelo').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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

    CarregarComboMotoQuilometragem: function () {
        let spa = this.spa;

        $.ajax({
            url: sessionStorage.getItem('api') + '/v1/mobile/motos/quilometragem',
            type: "GET", cache: false, async: true, contentData: 'json',
            success: function (result, textStatus, request) {

                $.each(result, function (i, obj) {
                    spa.find('.nice_select#quilometragem').last()
                        .append('<option value="' + obj.id + '">' + obj.nome + '</option>');
                });
                spa.find('.nice_select#quilometragem').niceSelect('update');
            },
            error: function (request, textStatus, errorThrown) {
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
    }
};