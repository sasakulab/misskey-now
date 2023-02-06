chrome.storage.local.get(["instance", "key"]).then((results) => {
    document.getElementById("settings_host").value = results.instance
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

function buttonstatus(mode){ // default, success, abort
    if(mode == "default"){
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-primary";
        document.querySelector(".btn-send").textContent = "Misskey Now!";
    } else if (mode == "success") {
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-success";
        document.querySelector(".btn-send").textContent = "Success";  
    } else if (mode == "abort") {
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-danger";
        document.querySelector(".btn-send").textContent = "Error";
    }
}

function generateNote() {
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
        }).then(response =>{
            if (!response.ok) {
                console.error('Misskey-now: Response Error!');
                buttonstatus("abort")
            } else {
                console.error('Misskey-now: Send');
                buttonstatus("success");
            }
            response.text()
        })
        .then(data => {
                console.log(data);
        })
        .catch((error) => {
            console.error('Misskey-now: Internal Error! : ' + error);
            buttonstatus("abort");
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
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".btn-send").addEventListener("click", generateNote);
    document.querySelector(".btn-save").addEventListener("click", saveSetting);
});

