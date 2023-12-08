// In pixelator.js
function processAlbumCoverImage(imageUrl) {
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        loadImage(img);
    };
    img.src = imageUrl;
}

window.sample_size = 71;
window.loadImage = function(img){
    let c = document.createElement('canvas');
    c.className = "img-fluid rounded mx-auto d-block";
    let ctx = c.getContext('2d');
    sample_size = sample_size;
    w = 636;
    h = 636;

    c.width = w;
    c.height = h;

    ctx.drawImage(img, 0, 0);

    let pixelArr = ctx.getImageData(0, 0, w, h).data;

    for (let y = 0; y < h; y += sample_size){
        for (let x = 0; x < w; x += sample_size){
            let p = (x + (y*w))*4;
            ctx.fillStyle = "rgba(" + pixelArr[p] + "," + pixelArr[p+1] + "," + pixelArr[p+2] + "," + pixelArr[p+3] + ")";
            ctx.fillRect(x, y, sample_size, sample_size);
        }
    }
    document.querySelector(".img-container").appendChild(c);
};

