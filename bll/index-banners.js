var SegmentoCarrosBanners = {
    spa : null,

    Construtor(){
        this.spa = $('.spa>.segmento#carros');
    },

    Inicializar(){
        this.CarregarBanners();
    },

    CarregarBanners(){
        let this_ = this;
        $.ajax({
            url: localStorage.getItem('api') + '/v1/site/banners/propaganda',
            type: 'get', cache: false, async: true, dataType: 'json',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            headers: {
                Authorization: 'Bearer ' + StorageGetItem("token")
            },
            success: function (result) {
                this_.HtmlBanners(result);
            },
            error: function (request, textStatus, errorThrown) {
                alert(request.responseText);
                var mensagem = undefined;
                try {
                    var obj = $.parseJSON(request.responseText)
                    mensagem = obj.mensagem;
                } catch (error) {
                    mensagem = request.responseText;
                }
            }
        });
    },

    HtmlBanners(result){
        let area_slider = this.spa.find('.main_slider.budget_slider')
        area_slider.empty();

        $.each(result, function (key, item) {
            area_slider.append(
                `<div class="slider_item">
                    <div class="image_overlay" style="background: url(${localStorage.getItem('api') + '/v1/site/banners/propaganda/' + item.hash}) no-repeat;"></div>
                 </div>`);
        });

        $(area_slider).slick('unslick');
        
        $(area_slider).slick({
                speed: 600, 
                dots: false,
                fade: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                prevArrow: ".arrow_left",
		        nextArrow: ".arrow_right",
                draggable: true,
                lazyLoad: 'ondemand'
            });
    }
}

SegmentoCarrosBanners.Construtor();
SegmentoCarrosBanners.Inicializar();