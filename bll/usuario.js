(function(){
    "use strict"
    UsuarioPerfil.Construtor();
    UsuarioPerfil.Inicializar();

    UsuarioAlterarSenha.Construtor();
    UsuarioAlterarSenha.Inicializar();

    UsuarioFavorito.Construtor();
    UsuarioFavorito.Inicializar();

    
    UsuarioMeusCarros.Construtor();
    UsuarioMeusCarros.Inicializar();

    TelaCompartilhamento.Inicializar();

    UsuarioProposta.Construtor();
    UsuarioProposta.Inicializar();


    $(document.body).on('click', '#perfil-tab', function(){

    });

    $(document.body).on('click', '#profile-tab', function(){

    });

    $(document.body).on('click', '#nav_favorito', function(){

    });

    $(document.body).on('click', '#nav_meus_carros', function(){

    });

    $(document.body).on('click', '#nav_propostas', function(){

    });

})(jQuery)
