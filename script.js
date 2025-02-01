const messages = [
    "Are you sure?",
    "Really sure??",
    "It's gonna be so fun!",
    "Please 🥺",
    "Are you positive?",
    "Love please...",
    "Just think about it!",
    "If you say no, I will be really sad...",
    "I will be very sad...",
    "I will be very very very sad...",
    "Ok fine, I will stop asking...",
    "Just kidding, say yes please! ❤️",
    "Oh well, if you clicked 'no' that many times i think it means 'no'",
    "Just kidding, say yes plese :D ",
    "I love you so much maha, please say yes 😭"
];

let messageIndex = 0;

function handleNoClick() {
    const noButton = document.querySelector('.no-button');
    const yesButton = document.querySelector('.yes-button');
    noButton.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;
    const currentSize = parseFloat(window.getComputedStyle(yesButton).fontSize);
    yesButton.style.fontSize = `${currentSize * 1.1}px`;
}

function handleYesClick() {
    window.location.href = "yes_page.html";
}