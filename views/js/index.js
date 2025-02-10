function setError(error) {
    document.getElementById('error').innerText = error;
    document.getElementById('error').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

function search() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('loading').style.display = 'block';
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search_text: document.getElementById('searchBar').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if ((data.error) || (data.results == 0)) {
                setError('No results found!');
            } else {
                for (let i = 0; i < data.results.length; i++) {
                    let channel = data.results[i];
                    let div = document.createElement('div');
                    div.className = 'result2';
                    div.innerHTML = `<a href="/user/${channel.did}'"><div class="result2">
                    <div class="background-image2" style="background: url('${channel.avatar}') no-repeat center center; background-size: cover;"></div>
                    <div class="overlay2">
                      <h1 class="overlay-label2">${channel.displayName}</h1><hr>
                      <h3 class="overlay-label2" style="margin-top: 5px;">Joined: ${moment(channel.createdAt).format('MMMM Do, YYYY') }</h3>
                      <h4 class="overlay-label2">@${channel.handle}</h4>
                    </div>
                  </div></a>`;
                    div.onclick = function () {
                        window.location.href = '/user/' + data.results[i].did;
                    }
                    document.getElementById('results').appendChild(div);
                }
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'none';
            }
        });
}

function getUserId() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('loading').style.display = 'block';
    fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: document.getElementById('searchBar').value.substring(1)
        })
    }).then(response => response.json())
        .then(data => {
            if (data.error) {
                setError('User not found!');
            } else {
                window.location.href = '/user/' + data.user.id;
                document.getElementById('loading').style.display = 'none';
            }
        });

}

document.getElementById('searchBar').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        if (document.getElementById('searchBar').value.startsWith('@')) {
            getUserId();
        } else {
            search();
        }
    }
});

document.getElementById('searchButton').addEventListener('click', function () {
    if (document.getElementById('searchBar').value.startsWith('@')) {
        getUserId();
    } else {
        search();
    }
});

document.getElementById('holder').addEventListener('click', function () {
    document.getElementById('searchBar').focus();
});

document.getElementById('searchBar').addEventListener('focus', function () {
    document.getElementById('holder').style.display = 'none';
});

document.getElementById('searchBar').addEventListener('blur', function () {
    if (document.getElementById('searchBar').value === '') {
        document.getElementById('holder').style.display = 'block';
    }
});