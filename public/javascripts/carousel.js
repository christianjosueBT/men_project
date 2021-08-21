// checks if element passed to it is "active" or not. Returns a boolean value
const active = element => element.classList.contains('active');

// function to change which image is "active" to the left
function changeIndexLeft(images) {
    let index = 0;
    for(let i = 0; i < images.length; i++) {
        if(active(images[i])) index = i;
    }
    for(let i = 0; i < images.length; i++) {
        if(index === 0 && i === index) {
            images[i].classList.toggle('active');
            images[images.length-1].classList.toggle('active');
        }
        else if(i === index && index !== 0) {
            images[i].classList.toggle('active');
            images[i-1].classList.toggle('active');
        }
    }
    setupBlocks();
};

// function to change which image is "active" to the right
function changeIndexRight(images) {
    let index = 0;
    for(let i = 0; i < images.length; i++) {
        if(active(images[i])) index = i;
    }
    for(let i = 0; i < images.length; i++) {
        if(index === (images.length - 1) && i === index) {
            images[i].classList.toggle('active');
            images[0].classList.toggle('active');
        }
        else if(i === index && index !== (images.length - 1)) {
            images[i].classList.toggle('active');
            images[i+1].classList.toggle('active');
        }
    }
    setupBlocks();
};

function display(nodelist) {
    for (let i = 0; i < nodelist.length; i++){
        nodelist[i].classList.remove('hide');
    }
}

// finds all carousel_images and calls the changeIndex functions where and if appropriate
function carousel(t) {
    const carousels = document.querySelectorAll('.carousel');
    for(let i = 0; i < carousels.length; i++) {
        const images = carousels[i].querySelectorAll('.carousel__image');
        if(images.length > 1){
            let timerId = setTimeout(function change() {
                changeIndexRight(images);
                timerId = setTimeout(change, t * 1000);
            }, t * 1000);
            changePicture(carousels[i], images);
            const svgs = carousels[i].querySelectorAll('.button--svg');
            display(svgs);
        }
    }
};

// adds event listeneres to the left and right buttons on images so the user can click on them and
// change the picture being displayed
function changePicture(carousel, images) {
    const rightButton = carousel.querySelector('.button--right');
    rightButton.addEventListener('click', function(){
        changeIndexRight(images);
    });
    const leftButton = carousel.querySelector('.button--left');
    leftButton.addEventListener('click', function(){
        changeIndexLeft(images);
    });
}

carousel(50000);