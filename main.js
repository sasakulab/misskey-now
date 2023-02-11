chrome.storage.local.get(['instance', 'key']).then((results) => {
    if (typeof results.instance !== 'undefined') {
        settings_host.value = results.instance;
        settings_api_key.value = results.key;
    }
});

function getUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        const title = tabs[0].title;
        popup_title.value = title;
        popup_url.value = url;
    });
}

getUrl();

function buttonstatus(mode) {
    // default, success, abort
    if (mode == 'default') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-primary';
        document.querySelector('.btn-send').textContent = 'Misskey Now!';
    } else if (mode == 'success') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-success';
        document.querySelector('.btn-send').textContent = 'Success';
    } else if (mode == 'abort') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-danger';
        document.querySelector('.btn-send').textContent = 'Error';
    }
}

function generateNote() {
    const title = popup_title.value;
    const url = popup_url.value;
    const range = popup_range.value;
    const hash = popup_hash.value;
    const note = popup_note.value;
    const host =
        'https://' +
        settings_host.value +
        '/api/notes/create';
    const apiKey = settings_api_key.value;
    strings = note + '\n\n' + '『' + title + '』 - ' + url + ' ' + hash;
    console.log(strings);
    let data = {
        i: apiKey,
        visibility: range,
        text: strings,
    };
    str = JSON.stringify(data);
    console.log(str);

    fetch(host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: str,
    })
        .then((response) => {
            if (!response.ok) {
                console.error('Misskey-now: Response Error!');
                buttonstatus('abort');
            } else {
                console.error('Misskey-now: Send');
                buttonstatus('success');
            }
            response.text();
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error('Misskey-now: Internal Error! : ' + error);
            buttonstatus('abort');
        });
}

function saveSetting() {
    settings = {
        instance: settings_host.value,
        key: settings_api_key.value,
    };
    chrome.storage.local.set(settings, function () {
        console.log('Misskey-Now: Stored Settings.');
        const prevText = save_settings.textContent;
        const prevClass = save_settings.className;
        save_settings.textContent = '✓';
        save_settings.className = prevClass.replace(
            'btn-primary',
            'btn-success'
        );
        setTimeout(() => {
            save_settings.textContent = prevText;
            save_settings.className = prevClass;
        }, 1500);
    });
}

function handleCtrlEnter(e) {
    if (e.ctrlKey && e.code === 'Enter')
        document.querySelector('.btn-send')?.click();
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.btn-send').addEventListener('click', generateNote);
    document.querySelector('.btn-save').addEventListener('click', saveSetting);
    popup_note.addEventListener('keydown', handleCtrlEnter);
});
