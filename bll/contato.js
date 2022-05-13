var Contato = {
    spa : null,

    Construtor(){
        this.spa = $('.spa.main_contact_area.p_100.fale-conosco')
    },

    Inicializar(){  
        let this_ = this;

        $('#telefone').inputmask('(99) 9 9999-9999');

        $(document.body).on('submit', '#fale-conosco-formulario', function(event){
            event.preventDefault();
            let params = {};

            params['nome'] = this_.spa.find('#nome').val();
            params['celular'] = this_.spa.find('#telefone').val();
            params['email'] = this_.spa.find('#email').val();
            params['mensagem'] = this_.spa.find('#mensagem').val();

            let formulario = $(this);

            $.ajax({
                url: StorageGetItem("api") + '/v1/usuarios/fale-conosco',
                type: "POST", cache:false, async:true, dataType:'json',
                data: params,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (result, textStatus, request) {
                    try {
                        Mensagem(result.mensagem, 'success');
                    } catch (error) {
                        Mensagem(JSON.stringify(result), 'success');
                    }
                    formulario.find('input,textarea').val('');
                },
                error: function (request, textStatus, errorThrown) {
                    if (!MensagemErroAjax(request, errorThrown)) {
                        try {
                            var obj = $.parseJSON(request.responseText)
                            Mensagem(obj.mensagem, 'warning', function () { $("#" + obj.campo).select(); });
                        } catch (error) {
                            Mensagem(request.responseText, 'error', function () { $("#nome").select(); });
                        }
                    }
                }
            })
        });
    },
}

Contato.Construtor();
Contato.Inicializar();


