function MensagemErroAjax(request, errorThrown) {
    if (request.responseText == '') {
        if (request.status == 403 || errorThrown == 'Forbidden') {
            Mensagem('Acesso negado!', 'warning')
            return true;
        } else if (request.responseText == '' && (request.status == 401 || errorThrown == 'Unauthorized')) {
            Mensagem('Acesso não autorizado!', 'warning', function () {
                if (Logado()) LogOut();
            });
            if (!Logado()) {
                return true;
            }
        } else {
            Mensagem(request.statusText, 'error')
            return true;
        }
    } else if (errorThrown.name != undefined) {
        switch (errorThrown.name) {
            case 'NetworkError':
                Mensagem('Verifique sua conexão com a internet!', 'error');
                break;
            default:
                Mensagem(errorThrown.name + ':\n' + errorThrown.message, 'error');
                break;
        }
        return true;
    } else
        return false;
}

function Mensagem(text, icon, then_func, target) {
    const swalCustom = Swal.mixin({
        target: target,
        heightAuto: true,
        customClass: {
            content: 'text-muted',
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger',
            closeButton: 'btn btn-primary',
            denyButton: 'btn btn-primary',
        },
        buttonsStyling: false
    });

    swalCustom.fire({
        text: text,
        icon: icon,
        showCancelButton: icon === 'question' ? true : false,
        confirmButtonText: icon === 'question' ? 'Sim' : 'OK',
        cancelButtonText: icon === 'question' ? 'Não' : ''
    }).then(function (isConfirm) {
        if (isConfirm.value === true) {
            setTimeout(then_func, 300); // Aguarda o tempo 'Hide Out' do bootstrap    
        }
    });
}

function Logado() {
    return StorageGetItem('token') !== null;
}

function LogOut(func_exec) {
    StorageRemoveItem('Notificacoes');
    $.ajax({
        url: sessionStorage.getItem("auth"),
        type: "POST", cache: false, async: false, dataType: "json",
        headers: {
            Authorization: 'Bearer ' + StorageGetItem("token")
        },
        data: {
            refresh_token: StorageGetItem('refresh'),
            grant_type: 'revoke_token'
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        complete: function (data) {
            StorageClear();
            func_exec();
        }
    });
}

function StorageSetItem(key, value) {
    // if (PermanecerConectado())
    localStorage.setItem(key, value);
    return value;
    // else
    //     return sessionStorage.setItem(key, value);
}

function StorageGetItem(key) {
    // if (PermanecerConectado())
    return localStorage.getItem(key);
    // else
    //     return sessionStorage.getItem(key);
}

function StorageRemoveItem(key) {
    // if (PermanecerConectado())
    return localStorage.removeItem(key);
    // else
    //     return sessionStorage.removeItem(key);
}

function RedirecionarHref() {
    var href = StorageGetItem('href');

    if (StorageGetItem('href') != null && StorageGetItem('href') != 'null') {
        StorageRemoveItem('href');
        $(location).attr('href', href);
        return true;
    } else return false;
}

function PermanecerConectado() {
    return localStorage.getItem('permanecer') === 'true';
}

function StorageClear() {
    var permanecer = localStorage.getItem('permanecer');
    var href = StorageGetItem('href');
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('permanecer', permanecer);
    StorageSetItem('href', href);
};

function hexToBase64(str) {
    var bString = "";
    for (var i = 0; i < str.length; i += 2) {
        bString += String.fromCharCode(parseInt(str.substr(i, 2), 16));
    }
    return btoa(bString);
}

var qs = (function (a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// requires jQuery
// no support for javascript-minification
// returns the minified HTML markup
function minifyHTML(targetElSelector = 'html', removableElSelector = '', imgSourcePrefix = '') {
    // make sure that targetElSelector represents a "single" DOM element
    let fullHtml = $('<div>').append($(targetElSelector).clone());
    fullHtml.find(removableElSelector).remove();
    $.each(fullHtml.find('style'), function (index, obj) {
        let newCSS = $(obj)
            .html()
            .replace(/\:\s*/g, ':')
            .replace(/\n/g, '')
            .replace(/\s\s/g, '')
            .replace(/\;\}/g, '}');
        $(obj).html(newCSS);
    });
    $.each(fullHtml.find('[style]'), function (index, obj) {
        if ($(obj).attr('style').trim().length <= 0) {
            $(obj).removeAttr('style');
        }
    });
    let asdd = fullHtml
        .html()
        .replace(/\n/g, '')
        .replace(/\s\s/g, '')
        .replace(/(\s\>\s)|(\s\>)|(\>\s)/g, '>')
        .replace(/(\s\<\s)|(\s\<)|(\<\s)/g, '<')
        .replace(/(\s\{\s)|(\s\{)|(\{\s)/g, '{')
        .replace(/(\s\}\s)|(\s\})|(\}\s)/g, '}');

    return asdd.replace(/src\=\"/g, 'src="' + imgSourcePrefix);
}