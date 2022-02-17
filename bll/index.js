const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

TelaCompartilhamento.Inicializar();

if (params.hasOwnProperty('segmento')) {
    let segmento = params.segmento;

    switch (segmento) {
        case 'carros':
            SegmentoCarros.Construtor(params);
            SegmentoCarros.Inicializar();
            break;
        case 'motos':
            break;
        case 'aeronaves':
            break;
        case 'embarcacoes':
            break;
        case 'imoveis':
            break;
        default:
            break;
    }
}
else {
    SegmentoCarros.Construtor(params);
    SegmentoCarros.Inicializar();
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
            window.location.search = 'segmento=carros';
            SegmentoCarros.Inicializar();
        }
        else if (segmento == 'motos') {
            window.location.search = 'segmento=motos';
        }
        else if (segmento == 'aeronaves') {
            window.location.search = 'segmento=aeronaves';
        }
        else if (segmento == 'embarcacoes') {
            window.location.search = 'segmento=embarcacoes';
        }
        else if (segmento == 'imoveis') {
            window.location.search = 'segmento=imoveis';

        }
    } catch (error) {
    }
});

var Index = {
    Inicializar() {
        this.CarregarDepoimentosClientes();
    },

    CarregarDepoimentosClientes() {
        var this_ = this;
        var carousel = $('.client_feedback_area').find('.client_slider.owl-carousel');

        $.ajax({
            url: localStorage.getItem('api') + '/v1/site/depoimentos',
            type: "GET", cache: false, async: true, contentData: 'json',
            contentType: 'application/json;charset=utf-8',
            beforeSend: function () {
                this_.ResetarOwlCarouselDepoimentosClientes(carousel);
            },
            success: function (result, textStatus, request) {
                $.each(result, function (key, item) {
                    carousel.owlCarousel('add', this_.HtmlItemDepoimentoCliente(item)).owlCarousel('update');
                });
                carousel.owlCarousel('show');
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

    HtmlItemDepoimentoCliente: function (item) {
        return `<div class="item">
            <div class="client_item">
                <p>${item.texto}</p>
                <h4>${item.nome}</h4>
                <h5>${item.cargo}</h5>
            </div>
        </div>`;
    },

    ResetarOwlCarouselDepoimentosClientes(carousel) {
        carousel.trigger('destroy.owl.carousel');
        carousel.html(carousel.find('.owl-stage-outer').html()).removeClass('owl-loaded');

        carousel.empty();

        $('.client_slider').owlCarousel({
            loop: true,
            margin: 30,
            items: 1,
            nav: false,
            autoplay: true,
            smartSpeed: 1500,
            dots: true,
        })
    }
};

Index.Inicializar();