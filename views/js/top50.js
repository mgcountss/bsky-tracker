var c = 1;
var counts = [];
var ids = [];
let interval;

for (var l = 1; l <= 5; l++) {
    var htmlrow = `<div class="row_${l} row"></div>`;
    $('.counters').append(htmlrow);
    for (var t = 1; t <= 10; t++) {
        var cc = ""
        if (c < 10) { cc = "0" + c; } else { cc = c; }
        var htmlcard = `<div class="channel_${c} card" id="card_thing_${c}">
      <div class="rank">${cc}</div>
      <img src="./default.png" class="image">
      <div class="name">Loading...</div>
      <div class="count odometer">0</div>
      </div>`;
        $('.row_' + l).append(htmlcard);
        c += 1;
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function updateData(q, data) {
    return setTimeout(function () {
        data = data[q];
        var cnb = q + 1;
        $(".channel_" + cnb + " .image").attr("src", data.avatar);
        $(".channel_" + cnb + " .name").html(data.displayName);
        $(".channel_" + cnb + " .count").html(Math.floor(data.followersCount));
        if ((counts[q] == data.followersCount) == false) {
            colorSwap(cnb)
            setTimeout(function () { colorSwap2(cnb) }, 1500);
        }
        counts[q] = data.followersCount;
    }, random(0, 10000));
}

function initialLoad() {
    fetch("/api/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "type": "users",
            "start": 0,
            "end": 50,
            "sort": "followersCount",
            "order": "desc"
        })
    }).then(data => data.json()).then(data => {
        data = data.data;
        ids = [];
        for (var q = 0; q < 50; q++) {
            ids.push(data[q][0]);
        };
        clearInterval(interval);
        updateChannels();
        interval = setInterval(updateChannels, 10000);
    });
};

async function updateChannels() {
    let results = [];
    for (var q = 0; q < 2; q++) {
        let currentIds = [];
        if (q == 0) {
            currentIds = ids.slice(0, 25);
        } else {
            currentIds = ids.slice(25, 50);
        }
        const data = await fetch("/api/users", {
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({
                "ids": currentIds
            }),
            "method": "POST"
        });
        const json = await data.json();
        json.users.forEach(data => {
            results.push(data);
        });
    }
    results = results.sort(function (a, b) {
        return b.followersCount - a.followersCount
    });
    for (var q = 0; q < 50; q++) {
        updateData(q, results, true);
    }
}

function colorSwap(cnb) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = "#d9e3f2";
}
function colorSwap2(cnb) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = "#f4f4f8";
}

initialLoad();

setTimeout(function () { $('.loader').fadeOut(); $('.counters').fadeIn(1); }, 1)