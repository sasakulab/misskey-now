// 初期化
var manifestData = chrome.runtime.getManifest();
var saveSettings = {};

// 移行処理（移行チェック）
async function ConvertVariableCheck() {
    const results = await chrome.storage.local.get([
        'version',
        'instance',
        'key',
    ]);
    const { version, instance, key } = results;

    if (version == '0.2.0') {
        console.log('Misskey Now: Settings have Already Updated!');
        displayProfiles();
    } else if (typeof instance === 'undefined' && typeof key === 'undefined') {
        console.log(
            'Misskey Now: Thank you for installing Misskey Now! Initialize Configuration.'
        );
        const init = {
            version: manifestData.version,
            profiles: {},
        };
        await chrome.storage.local.set(init);
        console.log('Misskey Now: Saving Settings (First Startup).');
    } else {
        console.log(
            'Misskey Now: Thank you for Updating Misskey Now! Replace your Configuration.'
        );
        const results = await chrome.storage.local.get(['instance', 'key']);
        saveSettings = {};
        saveSettings['PreviousVersionData'] = {
            instance: results.instance,
            key: results.key,
        };
        const settings = {
            version: manifestData.version,
            profiles: saveSettings,
        };
        await chrome.storage.local.set(settings);
        console.log('Misskey Now: Saving Settings (Replaced).');
    }
}

// 動作変数設定
async function reloadSaveData() {
    const results = await chrome.storage.local.get(['profiles']);
    saveSettings = results.profiles;
    console.log('Misskey Now: Read Profiles Successfully');
}

// タブから URL, タイトルの取得
async function getUrl() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0].url;
    const title = tabs[0].title;
    popup_title.value = title;
    popup_url.value = url;
}

// ボタンのステータス変更 (@KusaReMKN さんのコードに統一予定（関数化）)
function buttonstatus(mode) {
    // default, success, abort
    if (mode == 'default') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-primary';
        document.querySelector('.btn-send').textContent = 'Misskey Now!';
        document.querySelector('.btn-send').disabled = false;
    } else if (mode == 'success') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-success';
        document.querySelector('.btn-send').textContent = 'Success';
        document.querySelector('.btn-send').disabled = true;
    } else if (mode == 'abort') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-danger';
        document.querySelector('.btn-send').textContent = 'Error';
        document.querySelector('.btn-send').disabled = true;
    } else if (mode == 'sending') {
        document.querySelector('.btn-send').className =
            'btn-sm w-100 btn-send btn-secondary';
        document.querySelector('.btn-send').textContent = 'Sending...';
        document.querySelector('.btn-send').disabled = true;
    }
}

// ノートの作成・送信
async function generateNote() {
    const title = popup_title.value;
    const url = popup_url.value;
    const range = popup_range.value;
    const hash = popup_hash.value;
    const note = popup_note.value;
    const host = 'https://' + settings_host.value + '/api/notes/create';
    const apiKey = settings_api_key.value;
    strings = note + '\n\n' + '『' + title + '』 - ' + url + ' ' + hash;
    let data = {
        i: apiKey,
        visibility: range,
        text: strings,
    };
    str = JSON.stringify(data);
    buttonstatus('sending');
    try {
        const response = await fetch(host, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: str,
        });
        if (!response.ok) {
            console.error('Misskey-now: Response Error!');
            buttonstatus('abort');
        } else {
            console.log('Misskey-now: Send');
            buttonstatus('success');
        }
        response.text();
    } catch (e) {
        console.error('Misskey-now: Internal Error! : ' + e);
        buttonstatus('abort');
    }
    // 一定時間経ったら再送信可能
    setTimeout(() => buttonstatus('default'), 1500);
}

// 設定の保存
async function saveSetting() {
    profileName = settings_profile_name.value;
    if (popup_profile.value !== 'new') {
        delete saveSettings[[popup_profile.value]];
    }
    instance = settings_host.value;
    key = settings_api_key.value;
    saveSettings[[profileName]] = {
        instance: instance,
        key: key,
    };
    settings = {
        version: manifestData.version,
        profiles: saveSettings,
    };
    await chrome.storage.local.set(settings);
    console.log('Misskey-Now: Stored New Settings.');
    const prevText = save_settings.textContent;
    const prevClass = save_settings.className;
    save_settings.textContent = '✓';
    save_settings.className = prevClass.replace('btn-primary', 'btn-success');
    setTimeout(() => {
        save_settings.textContent = prevText;
        save_settings.className = prevClass;
    }, 1500);
    displayProfiles();
}

// プロファイルの選択肢を変更したときに、下部（設定）の表示を更新
function changeProfile() {
    var selected = popup_profile.value;
    if (selected !== 'new') {
        settings_profile_name.value = selected;
        settings_host.value = saveSettings[[selected]].instance;
        settings_api_key.value = saveSettings[[selected]].key;
    } else {
        settings_profile_name.value = '';
        settings_host.value = '';
        settings_api_key.value = '';
    }
}

// プロファイルの選択肢の更新
function displayProfiles() {
    const popup_profile = document.getElementById('popup_profile');
    removeChildren(popup_profile);
    const option = document.createElement('option');
    option.textContent = 'New Profile';
    option.value = 'new';
    popup_profile.appendChild(option);
    Object.keys(saveSettings).forEach((profile) => {
        const option = document.createElement('option');
        option.textContent = profile;
        option.value = profile;
        popup_profile.appendChild(option);
    });
    if (typeof popup_profile.options[1] !== 'undefined') {
        popup_profile.options[1].setAttribute('selected', 'selected');
        changeProfile()
    }
}

// プロファイルの削除
async function removeProfile() {
    if (popup_profile.value !== 'new') {
        delete saveSettings[[popup_profile.value]];
    }
    settings = {
        version: manifestData.version,
        profiles: saveSettings,
    };
    await chrome.storage.local.set(settings);
    displayProfiles();
    console.log('Misskey-Now: Stored Removed Settings.');
    settings_profile_name.value = '';
    settings_host.value = '';
    settings_api_key.value = '';
    const prevText = delete_settings.textContent;
    delete_settings.textContent = '✓';
    setTimeout(() => {
        delete_settings.textContent = prevText;
    }, 1500);
}

// 子要素の削除
function removeChildren(x) {
    if (x.hasChildNodes()) {
        while (x.childNodes.length > 0) {
            x.removeChild(x.firstChild);
        }
    }
}

// Ctrl + Enter で送信
function handleCtrlEnter(e) {
    if (e.ctrlKey && e.code === 'Enter')
        document.querySelector('.btn-send')?.click();
}

async function reloadInternalProfiles() {
    await ConvertVariableCheck();
    await reloadSaveData();
    displayProfiles();
}

// イベントリスナーの動作
document.addEventListener('DOMContentLoaded', async function () {
    version_footer.textContent = manifestData.version;
    await reloadInternalProfiles();
    await getUrl();
    document.querySelector('.btn-send').addEventListener('click', generateNote);
    document.querySelector('.btn-save').addEventListener('click', saveSetting);
    document
        .querySelector('.btn-delete')
        .addEventListener('click', removeProfile);
    popup_profile.addEventListener('change', changeProfile);
    popup_note.addEventListener('keydown', handleCtrlEnter);
});
