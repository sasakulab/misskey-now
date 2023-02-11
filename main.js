var manifestData = chrome.runtime.getManifest();
var saveSettings = {};

chrome.storage.local.get(['version', 'profiles']).then((results) => {
    if (
        (typeof results.version === 'undefined') |
        (typeof results.profiles === 'undefined')
    ) {
        // 初回起動
        console.log(
            'Misskey Now: Thank you for installing! Initialize Settings.'
        );
        init = {
            version: manifestData.version,
            profiles: {},
        };
        chrome.storage.local.set(init, function () {
            console.log('Misskey-Now: Now Saving Settings (First Startup).');
        });
    } else if (
        (typeof results.version == 'undefined') |
        (typeof results.instance !== 'undefined')
    ) {
        // バージョン情報がない -> データ構造更新
        console.log('Misskey Now: Thank you for Updating! Update Settings.');
        document.getElementById('settings_host').value = results.instance;
        document.getElementById('settings_api_key').value = results.key;
    } else {
        // version も登録され、profiles も保存済み -> 通常起動
        console.log('Misskey Now: Restore Settings.');
    }
    saveSettings = results.profiles;
    console.log('Misskey Now (Debug):' + results);
});

function getUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const url = tabs[0].url;
        const title = tabs[0].title;
        document.getElementById('popup_title').value = title;
        document.getElementById('popup_url').value = url;
    });
}

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
    const title = document.getElementById('popup_title').value;
    const url = document.getElementById('popup_url').value;
    const range = document.getElementById('popup_range').value;
    const hash = document.getElementById('popup_hash').value;
    const note = document.getElementById('popup_note').value;
    const host =
        'https://' +
        document.getElementById('settings_host').value +
        '/api/notes/create';
    const apiKey = document.getElementById('settings_api_key').value;
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

function saveSetting(select) {
    profileName = document.getElementById("settings_profile_name").value;
    instance = document.getElementById("settings_host").value;
    key = document.getElementById("settings_api_key").value;
    saveSettings[[profileName]] = {
        instance: instance,
        key: key,
    };
    settings = {
        version: manifestData.version,
        profiles: saveSettings
    }
    chrome.storage.local.set(settings, function () {
        console.log('Misskey-Now: Stored New Settings.');
    });
}

function changeProfile() {
    var selected = document.getElementById('popup_profile').value
    if(selected !== 'new'){
        document.getElementById('settings_profile_name').value = selected;
        document.getElementById('settings_host').value = saveSettings[[selected]].instance;
        document.getElementById('settings_api_key').value = saveSettings[[selected]].key;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getUrl();
    document.querySelector('.btn-send').addEventListener('click', generateNote);
    document.querySelector('.btn-save').addEventListener('click', saveSetting);
    document.getElementById('popup_profile').addEventListener('change', changeProfile);
});
