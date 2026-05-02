
let currentSong = new Audio();
let Source = new Audio();
let songs;
let currFolder;
function goToPage() {
    window.location.href = "html/signup.html";
}

function logIn() {
    window.location.href = "html/login.html";
}
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    // ✅ SAFE: use songs.json instead of scraping folder
    let res = await fetch(`/${folder}/songs.json`);
    songs = await res.json();

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li data-song="${song}">
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song.replace(".mp3", "")}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }
        // click listener (clean, no duplicates)
    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.dataset.song);
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/${track}`;

    if (!pause) currentSong.play();

    document.querySelector(".songinfo").innerText =
        track.replace(".mp3", "");

    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    document.getElementById("play").src =
        pause ? "img/play.svg" : "img/pause.svg";
}

async function displayAlbums() {
    console.log("displaying albums")

    // ✅ FIX: directly read JSON (no HTML parsing)
    let a = await fetch(`/songs/albums.json`)
    let albums = await a.json();

    const cardContainer = document.querySelector('.cardContainer');
    cardContainer.style.display = 'flex';
    cardContainer.innerHTML = '';

    for (let index = 0; index < albums.length; index++) {
        const e = albums[index];

        let folder = e.folder;

        // metadata
        let meta = await fetch(`/songs/${folder}/info.json`)
        let response = await meta.json();

        cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
    }

    // Load playlist click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")

            let fldr = item.currentTarget.dataset.folder
            songs = await getSongs(`songs/${fldr}`)
            playMusic(songs[0])

            loadAlbum(fldr)
        })
    })
}

async function loadAlbum(folder){
    const cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = "";
    cardContainer.style.display = 'none';

    document.querySelector('.cardContainer2').style.display = 'block';

    let cardContainer2 = document.querySelector(".cardContainer2");

    let a = await fetch(`/songs/${folder}/info.json`);
    let response = await a.json();

    cardContainer2.innerHTML = `
    <div class="album-main">
        <div class="album-cover">
            <img src="songs/${folder}/cover.jpg">
        </div>

        <div class="album-info">
            <span>Playlist</span>
            <span class="album-tile">
                <h2>${response.title}</h2>
            </span>
            <span>
                <div class="album-desc">${response.description}</div>
            </span>

            <div class="album-others">
                <img src="img/spotify.jpg" alt="Spotify">
                <span><a href="index.html">Spotify</a></span>
                . <span>5,270,527 likes</span>
                . <span>${songs ? songs.length : 0} songs</span>
            </div>
        </div>
    </div>

    <div class="album-list">
        <div class="list-header">
            <div class="sng-num">#</div>
            <div class="sng-title">Title</div>
            <div class="sng-ablum">Album</div>
            <div class="date-added">Date Added</div>
            <div class="sng-duration invert"><img src="img/clock.svg"></div>
        </div>
    </div>`;

    // ❗ SAFE: use JSON instead of directory scraping
    let albumlist = await fetch(`/songs/${folder}/songs.json`);
    songs = await albumlist.json();

    let al = document.querySelector(".album-list");

    let cnt = 1;

    songs.forEach((song) => {

        let audio = new Audio(`songs/${folder}/${song}`);

        audio.addEventListener('loadedmetadata', function() {

            const durationMinutes = Math.floor(audio.duration / 60);
            const durationSeconds = Math.floor(audio.duration % 60);

            const formattedDuration =
                `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;

            al.innerHTML += `
            <div class="list-items" data-song="${song}">
                <div class="sng-num">${cnt}</div>

                <div class="sng-title">
                    <img src="songs/${folder}/cover.jpg">
                    <span class="tl">${decodeURIComponent(song.replace(".mp3", ""))}</span>
                </div>

                <div class="sng-ablum">${response.title}</div>
                <div class="date-added">1 month ago</div>

                <div class="icon invert">
                    <img src="img/wishlist.svg">
                </div>

                <div class="sng-duration">${formattedDuration}</div>

                <div class="icon invert">
                    <img src="img/dots.svg">
                </div>
            </div>`;

            cnt++;
        });
    });

    // ✅ FIX: event listener ONCE (not inside loop)
    setTimeout(() => {
        document.querySelectorAll(".list-items").forEach(e => {
            e.addEventListener("click", () => {
                let sng = e.querySelector(".tl").innerHTML.trim();
                playMusic(sng + ".mp3");
            });
        });
    }, 500);
}

async function main() {
    // Get the list of all the songs
     await getSongs("songs/ncs");

    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }
     // Display albums
    await displayAlbums();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
    document.querySelector(".back").addEventListener("click", e=>{
        document.querySelector('.cardContainer2').innerHTML=''
        const element = document.querySelector('.cardContainer2').style.display = 'none';
        displayAlbums()
     })


}

main() 