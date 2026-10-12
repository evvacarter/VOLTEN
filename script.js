const menuBtn = document.getElementById('menuBtn');
const menuIcon = document.getElementById('menuIcon');
const mobileOverlay = document.getElementById('mobileOverlay');

menuBtn.addEventListener('click', () => {
    // Overlay ko toggle karna
    mobileOverlay.classList.toggle('active');

    // Icon change logic
    if (mobileOverlay.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark'); // Cross icon
    } else {
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');  // Wapas 3 lines
    }
});
const quizSection = document.getElementById('quizSection');
const observer =  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-on-scroll');
        }
    });
},{ threshold: 0.3});
observer.observe(quizSection);