let correctAnswer;
let artistName;
let currentGuess = 0;
let isCorrect = false;
let albumNames = [];
let guesses = [];
let sample_size = window.sample_size;
let loadImage = window.loadImage;
let currentAlbumCoverUrl;
let usedAlbums = 0;
let originalInputValue = '';

$(window).on('load', function() {
    fetchUsedAlbumsCount();
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
                var span = $('<span>').text(guesses[index].guess);
                $(this).empty().append(span);
                if (guesses[index].isCorrect) {
                    $(this).addClass('correct');
                } else if (guesses[index].hasHint) {
                    $(this).addClass('hint');
                } else {
                    $(this).addClass('incorrect');
                }
            }
        });

        if (currentGuess <= 6 && !isCorrect){
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
            for (let i = 0; i < 6; i++){
                const box = $('<div>').addClass('box').text('guess #' + (i+1));
                container.append(box);
            }
        }
        const firstBox = $('.box').first();
        firstBox.addClass('current');
    }
    function checkGuess(){
        const inputValue = $('#input').val().trim();
        originalInputValue = inputValue;
        const inputValueLowerCase = inputValue.toLowerCase(); 
        const correctAnswerLowerCase = correctAnswer.toLowerCase();
        let guessCorrectness = inputValueLowerCase === correctAnswerLowerCase;
        let guessHasHint = inputValueLowerCase.includes(artistName.toLowerCase());

        guesses[currentGuess] = { guess: inputValue, isCorrect: guessCorrectness, hasHint: guessHasHint };
        var span = $('<span>').text(originalInputValue);
        var $currentBox = $('.box').eq(currentGuess);
        $currentBox.empty().append(span);

        if (guessCorrectness) {
            $currentBox.addClass('correct');
            isCorrect = true; 
        } else if (guessHasHint){
            $currentBox.addClass('hint');
        } else {
            $currentBox.addClass('incorrect');
        }

        currentGuess++;
        saveGameState();
        if (currentGuess <= 6){
            $('.box').eq(currentGuess).addClass('current');
            updateCanvas();
        }
        checkWinLose()
    }
    

    function updateCanvas(){
        if (isCorrect){
            sample_size = 1;
        } else {
            const sampleSizes = [71, 63, 53, 31, 20, 10];
            sample_size = currentGuess < sampleSizes.length ? sampleSizes[currentGuess] : 1;
        }
    
        if (currentAlbumCoverUrl) {
            let img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function () {
                $('canvas').remove();
                loadImage(img); 
            };
            img.src = currentAlbumCoverUrl;
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
        const text = $(this).text();
        $('#input').val(text); 
        $('.results-box').hide(); 
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
            $('.results-box').hide(); 
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
            $('.results-box').hide(); 
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
    $(document).on('click', '#copyButton', function() {
        var copyText = "albumle " + usedAlbums + " " + currentGuess + "/6\n" + document.getElementById("shareableText").value + "\nhttps://albumle.app";
    
        navigator.clipboard.writeText(copyText)
            .then(() => {
                $(this).text("Copied!");
    
                setTimeout(() => $(this).text("Copy"), 800);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });
    
    var interval;
    $('.help-button').on('click', function (event) {
        event.stopPropagation();
     
        var button = $(this);
        var helpText = $('.helpText');
     
        if (button.text() == '[how to play]') {
            button.text('[close]');
     
            var text = 'Like Wordle but for Albums. Each guess decreases the pixelation a bit less.<span class="hlRed"> Red</span> = incorrect, <span class="hlYel">Yellow</span> = right artist, <span class="hlGrn">Green</span> = correct. Check back every day for a new album.';
            var index = 0;
     
            clearInterval(interval);
            interval = setInterval(function () {
                var currentText = text.slice(0, ++index);
                helpText.html(currentText);
                index++;
     
                if (index > text.length) {
                    clearInterval(interval);
                }
            }, 45); 
     
        } else {
            button.text('[how to play]');
            var index = helpText.text().length;
     
            clearInterval(interval);
            interval = setInterval(function () {
                var currentText = helpText.text().slice(0, --index);
                helpText.html(currentText);
     
                if (index <= 0) {
                    clearInterval(interval);
                }
            }, 3);
        }
    });
    
    
    $(document).on('click', function () {
        var button = $('.help-button');
        var helpText = $('.helpText');
    
        if (button.text() == '[close]') {
            button.text('[how to play]');
            var index = helpText.text().length;
    
            clearInterval(interval); // Clear the previous interval
            interval = setInterval(function() {
                helpText.text(helpText.text().slice(0, --index));
                if (index <= 0){
                    clearInterval(interval);
                }
            }, 5); // Adjust the speed of deleting here
        }
    });


    //Scroll Animation
    var $boxes = $('.box');

    $boxes.hover(function() {
        var $box = $(this);
        var $span = $box.find('span');
        var speed = 200;

        var boxWidth = $box.width();
        var spanWidth = $span.width();
        var duration = spanWidth / speed; 

        if (spanWidth > boxWidth) {
            var keyframes = `
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-100% + ${boxWidth}px)); }
                }
            `;

            var styleSheet = document.createElement('style');
            styleSheet.textContent = keyframes;
            document.head.appendChild(styleSheet);

            $span.css('animation', `scroll ${duration}s cubic-bezier(.21,.01,.75,1.01) forwards`);
        }
    }, function() {
        var $box = $(this);
        var $span = $box.find('span');
        $span.css('animation', '');
    });
});

//Logic
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
            if (albumData.albumCover){
                processAlbumCoverImage(albumData.albumCover);
                currentAlbumCoverUrl = albumData.albumCover;
            } else {
                console.error("Album cover URL is undefined");
            }
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
            if (playlistData && playlistData.length > 0){
                updateDatalistWithPlaylist(playlistData);
            } else {
                console.log("No complete playlist data available.");
            }
            return playlistData;
        } else {
            console.log("No complete playlist data available.");
            return []; 
        }
    })
    .catch(error => {
        console.error('Error fetching complete playlist data:', error);
        throw error;
    });
}

function fetchUsedAlbumsCount() {
    return db.collection('usedAlbums').get()
        .then(querySnapshot => {
            const count = querySnapshot.size; 
            usedAlbums = count; 
            return count;
        })
        .catch(error => {
            console.error('Error fetching used albums count:', error);
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
                var shareableText = generateShareableText(gameState);
                $('.alert-container').css('text-align', 'center').html('<h3>You Win!</h3><p>' + gameState.correctAnswer + '</p><p>' + gameState.artistName + '</p><br><p>New album: <span id="time-until-midnight"></span></p><p>Share your results: <br>' + shareableText + '</p><input type="text" value="' + shareableText + '" id="shareableText" style="display: none;"><button id="copyButton">Copy</button>').fadeIn();
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
                }, 500 );
            } else if (gameState.guesses.length === 6) {
                var shareableText = generateShareableText(gameState);
                $('.alert-container').css('text-align', 'center').html('<h3>Game Over.</h3><p>' + gameState.correctAnswer + '</p><p>' + gameState.artistName + '</p><br><p>New album: <span id="time-until-midnight"></span></p><p>Share your results: <br>' + shareableText + '</p><input type="text" value="' + shareableText + '" id="shareableText" style="display: none;"><button id="copyButton">Copy</button>').fadeIn();
                $('#input').prop('disabled', true);
            } else {
                $('.alert-container').fadeOut();
                $('#input').prop('disabled', false);
            }
        }
        $('.alert-container').append('<button id = "button-addon3" >Close</button>');
        
        $('#button-addon3').click(function() {
            $('.alert-container').fadeOut();
        });
    
        // Update the time until midnight every second
        setInterval(updateTimeUntilMidnight, 1000);
    }

    function updateTimeUntilMidnight() {
        var now = moment().tz("America/New_York");
        var midnight = moment().tz("America/New_York").endOf('day');
    
        var hours = midnight.diff(now, 'hours');
        var minutes = midnight.diff(now, 'minutes') % 60;
        var seconds = midnight.diff(now, 'seconds') % 60;
    
        var timeUntilMidnight = hours + 'h, ' + minutes + 'm, ' + seconds + 's';
    
        // Display the time until midnight
        $('#time-until-midnight').text(timeUntilMidnight);
    }

    function generateShareableText(gameState){
        let shareableText = '';
        for (let i = 0; i < 6; i++){
            if (i < gameState.guesses.length){
                if (gameState.guesses[i].isCorrect){
                    shareableText += '🟩';
                } else if (gameState.guesses[i].hasHint){
                    shareableText += '🟨';
                } else {
                    shareableText += '🟥';
                }
            } else {
                shareableText += '⬛';
            }
        }
        return shareableText;
    }