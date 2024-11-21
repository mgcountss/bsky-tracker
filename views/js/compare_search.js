function setError1(error) {
    document.getElementById('error1').innerText = error;
    document.getElementById('error1').style.display = 'block';
    document.getElementById('loading1').style.display = 'none';
}
function setError2(error) {
    document.getElementById('error2').innerText = error;
    document.getElementById('error2').style.display = 'block';
    document.getElementById('loading2').style.display = 'none';
}

function search1(force) {
    document.getElementById('results1').innerHTML = '';
    document.getElementById('loading1').style.display = 'block';
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search_text: document.getElementById('searchBar1').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if ((data.error) || (data.results == 0)) {
                setError1('No results found!');
            } else {
                for (let i = 0; i < data.results.length; i++) {
                    let channel = data.results[i];
                    let div = document.createElement('div');
                    div.className = 'result';
                    div.innerHTML = `<div class="result" onclick="selectChannel1('u1${channel.did}')" id="u1${channel.did}">
                    <div class="background-image" style="background: url('${channel.banner ? channel.banner : channel.avatar}') no-repeat center center; background-size: cover;"></div>
                    <div class="overlay">
                      <h1 class="overlay-label">${channel.displayName}</h1><hr>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="${channel.avatar}" class="pfp" alt="Avatar">
                        <h4 class="overlay-label" style="margin-bottom: 0px; margin-top: 0px;">@${channel.handle}</h4>
                    </div>
                      <h3 class="overlay-label" style="margin-top: 5px;">Joined: ${moment(channel.createdAt).format('MMMM Do, YYYY')}</h3>
                    </div>
                    </div>`;
                    document.getElementById('results1').appendChild(div);
                    if (channel.handle == force) {
                        selectChannel1('u1' + channel.did);
                    }
                }
                document.getElementById('loading1').style.display = 'none';
                document.getElementById('error1').style.display = 'none';
            }
        });
}

function search2() {
    document.getElementById('results2').innerHTML = '';
    document.getElementById('loading2').style.display = 'block';
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search_text: document.getElementById('searchBar2').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if ((data.error) || (data.results == 0)) {
                setError2('No results found!');
            } else {
                for (let i = 0; i < data.results.length; i++) {
                    let channel = data.results[i];
                    let div = document.createElement('div');
                    div.className = 'result';
                    div.innerHTML = `<div class="result" onclick="selectChannel2('u2${channel.did}')" id="u2${channel.did}">
                    <div class="background-image" style="background: url('${channel.banner ? channel.banner : channel.avatar}') no-repeat center center; background-size: cover;"></div>
                    <div class="overlay">
                      <h1 class="overlay-label">${channel.displayName}</h1><hr>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <img src="${channel.avatar}" class="pfp" alt="Avatar">
                        <h4 class="overlay-label" style="margin-bottom: 0px; margin-top: 0px;">@${channel.handle}</h4>
                    </div>
                      <h3 class="overlay-label" style="margin-top: 5px;">Joined: ${moment(channel.createdAt).format('MMMM Do, YYYY')}</h3>
                    </div>
                    </div>`;
                    document.getElementById('results2').appendChild(div);
                }
            }
        });
}

document.getElementById('searchBar1').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        search1();
    }
});

document.getElementById('searchButton1').addEventListener('click', function () {
    search1();
});

document.getElementById('searchBar2').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        search2();
    }
});

document.getElementById('searchButton2').addEventListener('click', function () {
    search2();
});

let selected = ["", ""];
function selectChannel1(id) {
    if (document.getElementById(id)) {
        if (selected[0] === id) {
            selected[0] = "";
            document.getElementById(id).style.border = 'none';
            return;
        }
        if (selected[0] !== "") {
            document.getElementById(selected[0]).style.border = 'none';
        }
        selected[0] = id;
        document.getElementById(id).style.border = '5px solid #46e4a2';
    } else {
        setError1('Invalid channel selected');
    }
}

function selectChannel2(id) {
    if (document.getElementById(id)) {
        if (selected[1] == id) {
            selected[1] = "";
            document.getElementById(id).style.border = 'none';
            return;
        }
        if (selected[1] !== "") {
            document.getElementById(selected[1]).style.border = 'none';
        }
        selected[1] = id;
        document.getElementById(id).style.border = '5px solid #46e4a2';
    } else {
        setError2('Invalid channel selected');
    }
}

document.getElementById('compareButton').addEventListener('click', function () {
    if (!selected[0]) {
        setError1('No channel selected');
        if (!selected[1]) {
            setError2('No channel selected');
        }
        return;
    }
    if (!selected[1]) {
        setError2('No channel selected');
        return;
    }
    window.location.href = `/compare/${selected[0].substring(2)}/${selected[1].substring(2)}`;
});

if (window.location.href.includes('start')) {
    document.getElementById('searchBar1').value = window.location.href.split('start=')[1]
    search1(window.location.href.split('start=')[1]);
}