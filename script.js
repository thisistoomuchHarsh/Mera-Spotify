console.log("Harsh Chauhan");

let songs;
let currentSong = new Audio();
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Show all he songs in the playlist
  let songUL = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                              <div> ${song.replaceAll("%20", " ")}</div>
                          
                          <div class="playnow">
                              <img class="invert" src="/Images/play.svg" alt="">
                          </div> </li>`;
  }

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/Images/pause.svg";
  }

  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".your-albums");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      //Getting metadata from the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="cards">
        <div class="img">
          <img src="/songs/${folder}/cover.jpeg" alt="" />
        </div>
        <h4>${response.title}</h4>
        <p>${response.description}</p>
      </div>`;
    }

    //Load the playlist when the card is clicked

    Array.from(document.getElementsByClassName("cards")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        document.querySelector(".left").style.left = "0%";
      });
    });

    
  }
}


const autoPlayNext = () => {
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      // Optionally, loop to the first song
      playMusic(songs[0]);
    }
  });
};

async function main() {
  //Get all the songs
  await getSongs("songs/Haryanavi");
  playMusic(songs[0], true);

  displayAlbums();

  //Attach an event listener to play button

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/Images/play.svg";
    }
  });

  //Attach an event listener to previous button

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Attach an event listener to next button

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  autoPlayNext();

  

  //Listener for song time update

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Adding event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Adding hamburger function

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  //adding close function
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  
}

main();
