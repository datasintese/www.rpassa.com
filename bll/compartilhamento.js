var TelaCompartilhamento = {
    elementId: "modal_tela_compartilhamento",
    elementClassBase: "base_tela_compartilhamento",

    Link: {
        whatsapp: "https://wa.me/?text={texto}",
        facebook: "http://www.facebook.com/sharer.php?s=100&p[title]={titulo}&p[summary]={sumario}&p[url]={url}&p[images][0]={imagens}", //http://www.facebook.com/sharer.php?s=100&p[title]={titulo}&p[summary]={sumario}&p[url]={url}&p[images][0]={imagens}
        // linkedIn: "https://www.linkedin.com/shareArticle?mini=true&url={url}&title={titulo}", // https://www.linkedin.com/shareArticle?mini=true&url=[URL]&title=[TITULO]&summary=[RESUMO]&source=[NOME-DA-FONTE]
        twitter: "https://twitter.com/intent/tweet?url={url}&text={titulo}",
        // reddit: "",
        // discord: "",
        // messenger: 'http://www.facebook.com/sharer.php?s=100&p[title]={titulo}&p[summary]={sumario}&p[url]={url}&p[images][0]={imagens}', //http://www.facebook.com/sharer.php?s=100&p[title]=YOUR_TITLE&p[summary]=YOUR_SUMMARY&p[url]=YOUR_URL&p[images][0]=YOUR_IMAGE_TO_SHARE_OBJECT
        // telegram: "",
        // weChat: ""
    },

    Inicializar() {
        this.InjectCssFiles(this.DependenciasCss());
        this.InjectJsFiles(this.DependenciasJs());

        this.InjectCssContent(this.Template.Css());
        this.InjectHtmlContent(this.Template.Html());

        $('body>.' + this.elementClassBase).on('shown.bs.modal', function () {
            // OnShow
            $(this).find('#cpyClipboard').tooltip('dispose');
        });

        $('body>.' + this.elementClassBase).on('hidden.bs.modal', function () {
            // OnClose
            $(this).find('#cpyClipboard').tooltip('dispose');
        });

        $('#cpyClipboard').on('click', function (event) {
            var url = $(this).parent().find('input').first().attr('placeholder');
            
            if (copiarTexto(url)) {
                $(this).attr('title', 'Copiado!')
                    .tooltip({ items: "input" }).tooltip("show");
            }
            else {
                $(this).attr('title', 'Falha ao copiar!')
                    .tooltip({ items: "input" }).tooltip("show");
            }
        });

        $(document.body).on('click', '.compartilhar', function (event) {
            event.preventDefault();
            TelaCompartilhamento.ExibirTela($(this).attr('data-url-compartilhar'));
        });

        // verificar se esta logado
        let area_autenticacao = $('#area-autenticacao');
        area_autenticacao.empty();
        if(Logado()){
            area_autenticacao.append(
            `
                <a class="btn btn-outline-secondary" href="usuario.html">Area do usuário</a>
            `);
            area_autenticacao.append(
            `
                <a class="btn btn-outline-secondary" id="logout">Sair</a>
            `);
        }else{
            area_autenticacao.append(
            `
                <a class="btn btn-outline-secondary" href="autenticacao.html">Entrar ou Cadastrar</a>
            `);
        }
    },

    DependenciasCss: function () {
        return [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
            'https://use.fontawesome.com/releases/v5.8.1/css/all.css'
        ]
    },

    DependenciasJs: function () {
        return [
            //'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.bundle.min.js',
            //'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'
        ]
    },

    ExibirTela(url, titulo = '', sumario = '', imagens = '') {
        titulo = encodeURIComponent(titulo);
        sumario = encodeURIComponent(sumario);
        imagens = encodeURIComponent(imagens);

        $('#urlCompartilhamento').attr('placeholder', url);
        $('#comp_whatsapp').attr('href', this.Link.whatsapp.replace('{texto}', url));
        $('#comp_facebook').attr('href', this.Link.facebook.replace('{url}', url)
            .replace('{titulo}', titulo)
            .replace('{sumario}', sumario)
            .replace('{imagens}', imagens));


        $('#comp_twitter').attr('href', this.Link.twitter.replace('{url}', url)
            .replace('{titulo}', titulo));

        // $('#comp_messenger').attr('href', this.CompartilhamentoRedeSocial.messenger.replace('{url}', url)
        //     .replace('{titulo}', titulo)
        //     .replace('{sumario}', sumario)
        //     .replace('{imagens}', imagens));

        //$('.' + this.elementClassBase).show();
        $('#' + this.elementId).modal('show');
    },

    InjectHtmlContent(html) {
        $('body').append(html);
    },

    InjectCssContent(css) {
        $('head').append("<style>" + css + "</style>");
    },

    InjectJsFiles: function (lista) {
        $.each(lista, function (key, value) {
            try {
                var head = document.getElementsByTagName("head")[0];
                var script = document.createElement("script");

                script.src = value;

                script.onload = function () {
                    // Carregado
                };

                head.appendChild(script);
            } catch (error) {

            }

        });
    },

    InjectCssFiles: function (lista) {
        $.each(lista, function (key, value) {
            $("head").append("<link rel='stylesheet' href='" + value + "' type='text/css'>");
        });
    },

    Template: {
        Html: function () {
            var root = TelaCompartilhamento;
            var idUrlCompartilhamento = 'urlCompartilhamento';

            return `
            <div class="` + root.elementClassBase + `">
                <div class="modal fade" id="` + root.elementId + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content col-12">
                            <div class="modal-header">
                                <h5 class="modal-title">Compartilhar</h5> <button type="button" class="close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span> </button>
                            </div>
                            <div class="modal-body">
                                <div class="icon-container1 d-flex">
                                    <div class="smd"><a id="comp_whatsapp" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-whatsapp fa-2x" style="color: #25D366;background-color: #cef5dc;"></i></a></a>
                                        <p>Whatsapp</p>
                                    </div>
                                    <div class="smd"><a id="comp_facebook" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-facebook fa-2x" style="color: #3b5998;background-color: #eceff5;"></i></a>
                                        <p>Facebook</p>
                                    </div>
                                    <div class="smd"><a id="comp_twitter" href="#" rel="nofollow" target="_blank"><i class=" img-thumbnail fab fa-twitter fa-2x" style="color:#4c6ef5;background-color: aliceblue"></i></a>
                                        <p>Twitter</p>
                                    </div>
                                    <!--<div class="smd"><a id="comp_messenger" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-facebook-messenger fa-2x" style="color: #3b5998;background-color: #eceff5;"></i></a>
                                        <p>Messenger</p>
                                    </div>-->
                                </div>
                                <!--<div class="icon-container2 d-flex">
                                    <div class="smd"><a id="comp_discord" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-discord fa-2x " style="color: #738ADB;background-color: #d8d8d8;"></i></a>
                                        <p>Discord</p>
                                    </div>
                                    <div class="smd"><a id="comp_telegram" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-telegram fa-2x" style="color: #4c6ef5;background-color: aliceblue"></i></a>
                                        <p>Telegram</p>
                                    </div>
                                    <div class="smd"><a id="comp_reddit" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-reddit-alien fa-2x" style="color: #FF5700;background-color: #fdd9ce;"></i></a>
                                        <p>Reddit</p>
                                    </div>
                                    <div class="smd"><a id="comp_wechat" href="#" rel="nofollow" target="_blank"><i class="img-thumbnail fab fa-weixin fa-2x" style="color: #7bb32e;background-color: #daf1bc;"></i></a>
                                        <p>WeChat</p>
                                    </div>
                                </div>-->
                            </div>
                            <div class="modal-footer"> <label style="font-weight: 600">Link da página <span class="message"></span></label><br />
                                <div class="row"> 
                                    <input readonly class="col-10 ur" type="url" placeholder="https://www.rpassa.com/" id="` + idUrlCompartilhamento + `" aria-describedby="inputGroup-sizing-default" style="height: 40px;"> 
                                    <button class="cpy" id="cpyClipboard"><i class="far fa-clone"></i></button> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        },

        Css: function () {
            var root = TelaCompartilhamento;

            return `
            .`+ root.elementClassBase + ` .mt-100 {
                margin-top: 100px
            }
            
            .`+ root.elementClassBase + ` .modal-title {
                font-weight: 900
            }
            
            .`+ root.elementClassBase + ` .modal-content {
                border-radius: 13px
            }
            
            .`+ root.elementClassBase + ` .modal-body {
                color: #3b3b3b
            }
            
            .`+ root.elementClassBase + ` .img-thumbnail {
                border-radius: 33px;
                width: 61px;
                height: 61px
            }
            
            .`+ root.elementClassBase + ` .fab:before {
                position: relative;
                top: 13px
            }
            
            .`+ root.elementClassBase + ` .smd {
                width: 200px;
                font-size: small;
                text-align: center
            }
            
            .`+ root.elementClassBase + ` .modal-footer {
                display: block
            }
            
            .`+ root.elementClassBase + ` .ur {
                border: none;
                background-color: #e6e2e2;
                border-bottom-left-radius: 4px;
                border-top-left-radius: 4px
            }
            
            .`+ root.elementClassBase + ` .cpy {
                border: none;
                background-color: #e6e2e2;
                border-bottom-right-radius: 4px;
                border-top-right-radius: 4px;
                cursor: pointer
            }
            
            .`+ root.elementClassBase + ` button.focus,
            .`+ root.elementClassBase + ` button:focus {
                outline: 0;
                box-shadow: none !important
            }
            
            .`+ root.elementClassBase + ` .ur.focus,
            .`+ root.elementClassBase + ` .ur:focus {
                outline: 0;
                box-shadow: none !important
            }
            
            .`+ root.elementClassBase + ` .message {
                font-size: 11px;
                color: #ee5535
            }`;
        }
    }
}