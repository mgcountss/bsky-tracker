var c = 1;
var counts = Array(50).fill(0);
var ids = [];
var first = true;

for (var l = 1; l <= 5; l++) {
    var htmlrow = `<div class="row_${l} row"></div>`;
    $('.counters').append(htmlrow);
    for (var t = 1; t <= 10; t++) {
        var cc = ""
        if (c < 10) { cc = "0" + c; } else { cc = c; }
        var htmlcard = `<div class="channel_${c} card" id="card_thing_${c}" onclick="goToProfile(${c - 1})">
      <img src="./images/favicon.ico" class="image" id="img_${c}">
      <div class="name">Loading...</div>
      <div class="count odometer" id="count_${c}">0</div>
      <div class="rank">${cc}</div>
      </div>`;
        $('.row_' + l).append(htmlcard);
        c += 1;
    }
}

const goToProfile = (index) => {
    window.open("./user/" + ids[index], "_blank");
}

function updateData(q, data) {
    return setTimeout(function () {
        var cnb = q + 1;
        if (document.getElementById("img_" + cnb + "").src != data.avatar) {
            document.getElementById("img_" + cnb + "").src = data.avatar;
        }
        $(".channel_" + cnb + " .name").html(data.displayName || data.handle);
        $(".channel_" + cnb + " .count").html(Math.floor(data.followersCount));
        console.log(data.followersCount, counts[q]);
        if (!(counts[q] == data.followersCount)) {
            if (counts[q] > data.followersCount) {
                colorSwap(cnb, "#f8d7da");
                console.log("red");
            };
            if (counts[q] < data.followersCount) {
                colorSwap(cnb, "#c9e8d0")
                console.log("green");
            };
            setTimeout(function () { colorSwap(cnb, ""); }, 1000);
        }
        counts[q] = data.followersCount;
    }, q * 500);
}

function updateChannels() {
    fetch("/api/top50", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(data => data.json()).then(data => {
        ids = [];
        for (var q = 0; q < 50; q++) {
            ids.push(data[q][0]);
            updateData(q, data[q][1]);
        }
        if (first) {
            setTimeout(function () { $('.loader').fadeOut(); $('.counters').fadeIn(1); }, 1)
            first = false;
            setInterval(updateChannels, 5000);
        }
    });
};
updateChannels();

function colorSwap(cnb, color) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = color;
}