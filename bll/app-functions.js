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
        target: target ?? 'body',
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
    return localStorage.getItem('token') !== null;
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

$(document.body).on('click', '#logout', function (event) {
    LogOut(function () { Redirecionar('autenticacao.html'); })
});

function Redirecionar(paginaHtml) {
    if (!RedirecionarHref()) {
        $(location).attr('href', paginaHtml);
    }
}

function StorageSetItem(key, value) {
    // if (PermanecerConectado())
    localStorage.setItem(key, value);
    return value;
    // else
    //     return localStorage.setItem(key, value);
}

function StorageGetItem(key) {
    // if (PermanecerConectado())
    return localStorage.getItem(key);
    // else
    //     return localStorage.getItem(key);
}

function StorageRemoveItem(key) {
    // if (PermanecerConectado())
    return localStorage.removeItem(key);
    // else
    //     return localStorage.removeItem(key);
}

function RedirecionarHref() {
    var href = StorageGetItem('href');

    if (StorageGetItem('href') != null && StorageGetItem('href') != 'null') {
        StorageRemoveItem('href');
        $(location).attr('href', href);
        return true;
    } else return false;
}


function StorageClear() {
    var href = StorageGetItem('href');
    localStorage.clear();
    StorageSetItem('href', href);
};

function hexToBase64(str) {
    var bString = "";
    for (var i = 0; i < str.length; i += 2) {
        bString += String.fromCharCode(parseInt(str.substr(i, 2), 16));
    }
    return btoa(bString);
}

var QueryString = (function (value) {
    if (value == "") return {};
    var b = {};
    for (var i = 0; i < value.length; ++i) {
        var p = value[i].split('=', 2);
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

function insertUrlParam(key, value) {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
        window.history.pushState({ path: newurl }, '', newurl);
    }
}

function maxHeight(className) {
    return Math.max.apply(null, $(className).map(function () {
        return $(this).height();
    }).get());
}

function copiarTexto(text) {
    try {
        navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy!', err)
        return false;
    }
}

function dateToMysql(datain) {
    let data = moment(datain, "DD/MM/YYYY").toDate();

    let isValido = data instanceof Date && !isNaN(data)

    if (!isValido) {
        return '1999' + '-' + '01' + '-' + '01'
    }
    let dataFormatada = data.toISOString().split('T')[0]; // data.toISOString().slice(0, 10);
    return dataFormatada;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function SolicitarDadosServidorAjax(url_req, type_req, data_req, contentType_req, exibirMensagem = false, redirecionar, func_exec) {
    $.ajax({
        url: StorageGetItem("api") + url_req,
        type: type_req, cache: false, async: true, dataType: 'json',
        headers: {
            Authorization: 'Bearer ' + StorageGetItem("token")
        },
        data: data_req,
        contentType: contentType_req,
        success: function (result, textStatus, request) {
            let mensagem = "";
            try {
                mensagem = result.mensagem;
                func_exec;
                if (redirecionar != "") {
                    Redirecionar(redirecionar);
                }
            } catch (error) {
                mensagem = result.mensagem;
            }
            if (exibirMensagem) {
                Mensagem(mensagem, 'success');
            }
        },
        error: function (request, textStatus, errorThrown) {
            if (!MensagemErroAjax(request, errorThrown)) {
                try {
                    var obj = $.parseJSON(request.responseText)
                    if (exibirMensagem) {
                        Mensagem(obj.mensagem, 'warning', function () { $("#cpf").select(); });
                    }

                } catch (error) {
                    if (exibirMensagem) {
                        Mensagem(request.responseText, 'error', function () { $("#cpf").select(); });
                    }
                }
            }
        }
    })
}

function DeletarTagQueryStringURL(tag_chave, tag_legenda) {
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
}

function AdicionarTagQueryStringURL(tag_chave, useParamValor) {
    var values = [];
    values.push(useParamValor);

    var url = new URL(window.location.href);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const searchParams = new URLSearchParams(urlSearchParams);
    searchParams.set(tag_chave.toLowerCase(), values.join(','));
    url.search = searchParams.toString();
    url = url.toString();
    window.history.replaceState({ url: url }, null, url);
}

