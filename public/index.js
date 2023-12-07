let correctAnswer;
let artistName;
let currentGuess = 0;
let isCorrect = false;
let albumNames = [];
let guesses = [];
let sample_size = window.sample_size;
let loadImage = window.loadImage;

$(window).on('load', function() {
    fetchPlaylistData();
    fetchCompletePlaylistData();
    $('#loading').fadeOut('slow', function() {
        window.scrollTo(0, 0);
    });
});

$(document).ready(function(){   
    checkWinLose();
    var savedState = getCookie("gameState");
    if (savedState !== null) {
        let gameState = JSON.parse(savedState);
        currentGuess = gameState.currentGuess;
        guesses = gameState.guesses;
        sample_size = gameState.sampleSize;
        correctAnswer = gameState.correctAnswer;
        isCorrect = gameState.isCorrect;
        artistName = gameState.artistName;

        createBoxes();

        $('.box').each(function(index) {
            if (index < guesses.length) {
                $(this).text(guesses[index].guess);
                if (guesses[index].isCorrect) {
                    $(this).addClass('correct');
                } else {
                    $(this).addClass('incorrect');
                }
            }
        });

        if (currentGuess < 5) {
            $('.box').eq(currentGuess).addClass('current');
        }
        updateCanvas();
    } else {
        createBoxes();
        resetGameState();
    }

    function createBoxes() {
        const container = $('.box-container').first();
        if ($('.box').length === 0) {
            for (let i = 0; i < 5; i++){
                const box = $('<div>').addClass('box').text('guess #' + (i+1));
                container.append(box);
            }
        }
        const firstBox = $('.box').first();
        firstBox.addClass('current');
    }
    function checkGuess(){
        const inputValue = $('#input').val();
        let guessCorrectness = inputValue.includes(correctAnswer);
        guesses[currentGuess] = { guess: inputValue, isCorrect: guessCorrectness };
        $('.box').eq(currentGuess).text(inputValue);
        if (guessCorrectness) {
            $('.box').eq(currentGuess).addClass('correct');
            isCorrect = true; 

        } else {
            $('.box').eq(currentGuess).addClass('incorrect');
        }  
        currentGuess++;
        saveGameState();
        if (currentGuess <= 5){
            $('.box').eq(currentGuess).addClass('current');
            updateCanvas();
        }
        checkWinLose()
    }
    

    function updateCanvas(){
        if (isCorrect){
            sample_size = 1;
        }
        if (!isCorrect){
        if (currentGuess === 0){
            sample_size = 71;
        } else if (currentGuess === 1){
            sample_size = 53;
        } else if (currentGuess === 2){
            sample_size = 31;
        } else if (currentGuess === 3){
            sample_size = 20;
        } else {
            sample_size = 10;
        }
        if (isCorrect || (!isCorrect && currentGuess === 5)){
            sample_size = 1;
        }
    }
        const imageElement = document.getElementById('image1');
        if (imageElement && imageElement.src) {
            let img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function () {
                $('canvas').remove(); // Remove the old canvas
                loadImage(img); // Pass the image to loadImage
            };
            img.src = imageElement.src; // This triggers the onload
        }
    }

    function autocomplete() {
        const input = $('#input').val().toLowerCase();
        const resultsBox = $('.results-box');
        const listItems = $('.results-box ul li'); 

        let hasVisibleResults = false;

        listItems.each(function() {
            const text = $(this).text().toLowerCase();
            if (text.includes(input)) {
                $(this).show();
                hasVisibleResults = true;
            } else {
                $(this).hide();
            }
        });

        if (input.length > 0 && hasVisibleResults) {
            resultsBox.show();
        } else {
            resultsBox.hide();
        }
    }

    function onListItemClick() {
        const text = $(this).text(); // Get the text of the clicked li
        $('#input').val(text); // Set the text to the input box
        $('.results-box').hide(); // Optionally hide the results box
    }

    function clearInput() {
        $('#input').val('');
    }

    
    $('#input').on('focus', function() {
        autocomplete();
        checkWinLose();
    });
    
    $('.results-box').on('click', 'li', onListItemClick);
    $('#input').on('input', autocomplete);

    $('#input').on('keypress', function(e) {
        const inputValue = $(this).val().toLowerCase();
        if (e.key === 'Enter' && $('#input').val().length > 0) {
            e.preventDefault();
            const isAlbumMatch = albumNames.some(albumNames => inputValue.includes(albumNames));
            if (isAlbumMatch){
            checkGuess();
            clearInput();
            } else {
                $('#input').css({
                    'animation': 'shake 0.5s',
                    'animation-iteration-count': '1',
                });
                setTimeout(() => {
                    $('#input').css('animation', '');
                }, 500);
            }
        }
    })

    $('#button-addon2').on('click', function() {
        const inputValue = $('#input').val().toLowerCase(); 
        if (inputValue.length > 0) {
            const isAlbumMatch = albumNames.some(albumName => inputValue.includes(albumName));
            if (isAlbumMatch) {
                checkGuess();
                clearInput();
            } else {
                $('#input').css({
                    'animation': 'shake 0.5s',
                    'animation-iteration-count': '1',
                });
                setTimeout(() => {
                    $('#input').css('animation', '');
                }, 500);
            }
        }
    });
});

//Vanilla JS
function fetchPlaylistData(){
    return db.collection('dailyAlbum').doc('current').get()
    .then(doc => {
        if (doc.exists){
            const albumData = doc.data();
            console.log("Got daily album data");
            correctAnswer = albumData.albumName;
            artistName = albumData.artistName;

            let previousAlbum = getCookie("todayAlbum");
            setCookie("todayAlbum", correctAnswer, 1);

            if (previousAlbum !== null) {
                setCookie("prevAlbum", previousAlbum, 1);
            }
            checkAndReset();
            const imageElement = document.getElementById('image1');
            if (imageElement && albumData.albumCover) {
                imageElement.src = albumData.albumCover;
            } else {
                console.log("Album cover undefined");
            }
            const imageSetEvent = new CustomEvent("imageSet");
            document.dispatchEvent(imageSetEvent);
            console.log("Got playlist data");
            return albumData;
        } else {
            console.log("No daily album data available");
            throw new Error("No daily album data available");
        }
    })
    .catch(error => {
        console.error('Error fetching playlist data:', error);
        throw error;
    });
}

function fetchCompletePlaylistData() {
    return db.collection('playlistData').doc('playlist').get()
    .then(doc => {
        if (doc.exists){
            const playlistData = doc.data().allTracks;
            console.log("Got complete playlist data");

            if (playlistData.length > 0){
                updateDatalistWithPlaylist(playlistData);
            } else {
                console.log("No complete playlist data available.");
            }
            return playlistData;
        } else {
            console.log("No complete playlist data available.");
            throw new Error("No complete playlist data available.");
        }
    })
    .catch(error => {
        console.error('Error fetching complete playlist data:', error);
        throw error;
    });
}

function updateDatalistWithPlaylist(tracksData) {
    const resultsBox = document.querySelector('.results-box ul');
    resultsBox.innerHTML = ''; 
    albumNames = [];

    tracksData.forEach(track => {
        const liElement = document.createElement('li');
        liElement.textContent = `${track.albumName} - ${track.artistName}`;
        resultsBox.appendChild(liElement);
        albumNames.push(track.albumName.toLowerCase());
    });
}

function setCookie(name, value, daysToExpire){
    var date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
}


function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
}

function getCookie(name){
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++){
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveGameState(){
    let gameState = {
        currentGuess: currentGuess,
        sampleSize: sample_size,
        guesses: guesses, 
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        artistName: artistName
    };
    setCookie("gameState", JSON.stringify(gameState), 1);
}

function checkAndReset(){
    var todayAlbum = getCookie("todayAlbum");
    var prevAlbum = getCookie("prevAlbum");
    
    if (todayAlbum !== prevAlbum || prevAlbum === null){
            console.log("Resetting game state");
            resetGameState();
            location.reload();
    } else {
        console.log("Game state is valid");
    }
}

function resetGameState(){
    let gameState = {
        currentGuess: 0,
        sampleSize: 71,
        guesses: [], 
        correctAnswer: '',
        isCorrect: false,
        artistName: ''
    };
    setCookie("gameState", JSON.stringify(gameState), 1);
    }


function checkWinLose(){
    var gameStateStr = getCookie("gameState");
    if (gameStateStr){
    var gameState = JSON.parse(gameStateStr);
    if (gameState.isCorrect){
        $('.alert-container').html('<h3>You Win</h3><p>' + gameState.correctAnswer + '</p><p>' + gameState.artistName + '</p>').fadeIn();
        $('#input').prop('disabled', true);
        setTimeout(function(){
            confetti({
                particleCount: 100,
                origin: { y: 0.6 },
                shapes: ['square'],
                colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff'],
                flat: true,
                scalar: 0.8,
            });
        }, 500);
    } else if (gameState.guesses.length === 5) {
        $('.alert-container').html('<h3>Game Over</h3><p>' + gameState.correctAnswer + '</p><p>' + gameState.artistName + '</p>').fadeIn();
        $('#input').prop('disabled', true);
    } else {
        $('.alert-container').fadeOut();
        $('#input').prop('disabled', false);
    }
}
    $('.alert-container').append('<button class="btn btn-outline shadow-none" id = "button-addon3" >X</button>');
    
    $('#button-addon3').click(function() {
        $('.alert-container').fadeOut();
    });
}