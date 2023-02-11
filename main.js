// 初期化
var manifestData = chrome.runtime.getManifest();
var saveSettings = {};

// 起動（設定データのアップデート → UI 初期化）
chrome.storage.local.get(['version', 'profiles', 'instance', 'key']).then((results) => {
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
            console.log('Misskey Now: Now Saving Settings (First Startup).');
        });
    } else if (
        (typeof results.version == 'undefined') |
        (typeof results.instance !== 'undefined')
    ) {
        // バージョン情報がない -> データ構造更新（アップデート）
        console.log('Misskey Now: Thank you for Updating! Update Settings.');
        saveSettings["Updated Settings"] = {
            instance: results.instance,
            key: results.key,
        };
        settings = {
            version: manifestData.version,
            profiles: saveSettings
        }
        chrome.storage.local.set(settings, function () {
            console.log('Misskey-Now: Stored New Settings.');
        });
    } else {
        // version も登録され、profiles も保存済み -> 通常起動
        console.log('Misskey Now: Restore Settings.');
    }
    saveSettings = results.profiles;
    displayProfiles();
    changeProfile();
    console.log(results);
});

function getUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const url = tabs[0].url;
        const title = tabs[0].title;
        popup_title.value = title;
        popup_url.value = url;
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
    profileName = settings_profile_name.value;
    if (popup_profile.value !== 'new') {
        delete saveSettings[[popup_profile.value]]
    }
    instance = settings_host.value;
    key = settings_api_key.value;
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
    var selected = popup_profile.value
    if(selected !== 'new'){
        settings_profile_name.value = selected;
        settings_host.value = saveSettings[[selected]].instance;
        settings_api_key.value = saveSettings[[selected]].key;
    } else {
        settings_profile_name.value = '';
        settings_host.value = '';
        settings_api_key.value = '';
    }
}

function displayProfiles() {
    removeChildren(popup_profile)
    const option = document.createElement('option');
    option.textContent = "New Profile"
    option.value = "new"
    popup_profile.appendChild(option)
    Object.keys(saveSettings).forEach(profile => {
        const option = document.createElement('option');
        option.textContent = profile;
        option.value = profile;
        popup_profile.appendChild(option);
    })
}

function removeProfile() {
    if (popup_profile.value !== 'new') {
        console.log('debug')
        delete saveSettings[[popup_profile.value]]
    }
    settings = {
        version: manifestData.version,
        profiles: saveSettings
    }
    chrome.storage.local.set(settings, function () {
        console.log('Misskey-Now: Stored New Settings.');
        settings_profile_name.value = '';
        settings_host.value = '';
        settings_api_key.value = '';
        displayProfiles()
    });
}

function removeChildren(x) {
    if (x.hasChildNodes()) {
        while (x.childNodes.length > 0) {
            x.removeChild(x.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getUrl();
    document.querySelector('.btn-send').addEventListener('click', generateNote);
    document.querySelector('.btn-save').addEventListener('click', saveSetting);
    document.querySelector('.btn-delete').addEventListener('click', removeProfile);
    popup_profile.addEventListener('change', changeProfile);
});
