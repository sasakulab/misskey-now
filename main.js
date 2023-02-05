chrome.storage.local.get().then((res00) => {
    console.log(res00);
});

chrome.storage.local.get(["instance", "key"]).then((results) => {
    console.log("Restoring host:" + results.instance);
    document.getElementById("settings_host").value = results.instance
    console.log("Restoring API Key:" + results.key);
    document.getElementById("settings_api_key").value = results.key
});

function getUrl(){
    chrome.tabs.query({ active: true, currentWindow: true },
        function (tabs) {
            const url = tabs[0].url;
            const title = tabs[0].title;
            document.getElementById("popup_title").value = title;
            document.getElementById("popup_url").value = url;
        })
}

getUrl();

function generateText() {
    const title = document.getElementById("popup_title").value
    const url =  document.getElementById("popup_url").value
    const range = document.getElementById("popup_range").value;
    const hash = document.getElementById("popup_hash").value;
    const note = document.getElementById("popup_note").value;
    const host = "https://" + document.getElementById("settings_host").value + "/api/notes/create";
    const apiKey = document.getElementById("settings_api_key").value;
    strings = note + "\n\n" + "『" + title + "』 - " + url + " " + hash;
    console.log(strings);
    let data =
    {
        "i": apiKey,
        "visibility": range,
        "text": strings
    };
    str = JSON.stringify(data);
    console.log(str)
    fetch(host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: str
    }).then(response => response.text())
    .then(data => {
            console.log(data);
        });
}

function saveSetting() {
    settings = {
        instance: document.getElementById("settings_host").value,
        key: document.getElementById("settings_api_key").value
    };
    chrome.storage.local.set(settings, function() {
        console.log('Misskey-Now: Stored Settings.');
    });
    console.log(settings);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".btn-send").addEventListener("click", generateText);
    document.querySelector(".btn-save").addEventListener("click", saveSetting);
});

