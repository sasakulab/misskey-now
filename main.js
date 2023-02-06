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

function generateNote() {
    var statusCode = 000
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
        statusCode = response.status
        console.log(statusCode)
        response.text()
    })
    .then(data => {
            console.log(data);
    });
    
    if (statusCode == 200){
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-success";
        document.querySelector(".btn-send").textContent = "Success";  
        setTimeout(function(){},2000); // 一瞬待たせる関数の吟味
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-primary";
        document.querySelector(".btn-send").textContent = "Misskey Now!";
    } else {
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-danger";
        document.querySelector(".btn-send").textContent = "Abort";
        setTimeout(function(){},2000); // 一瞬待たせる関数の吟味
        document.querySelector(".btn-send").className = "btn-sm w-100 btn-send btn-primary";
        document.querySelector(".btn-send").textContent = "Misskey Now!";
    }
    
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

