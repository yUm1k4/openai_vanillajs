import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// loader untuk menampilkan loading ...
function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if(element.textContent.length === 4) {
            element.textContent = '';
        }
    }, 300);
}

// animasi ketika sedang typing
function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if(index < text.length) {
            element.innerHTML += text.charAt(index); // menambahkan text per huruf
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// generate unique id untuk setiap chat
function generateUniqueId() {
    const timestamp = new Date().getTime();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

// chat strip
function chatStrip(isAi, value, uniqueId) {
    return (
        `
            <div class="wrapper ${isAi && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
                    </div>
                    <div class="message" id="${uniqueId}">${value}</div>
                </div>
            </div>
        `
    );
}

const handleSubmit = async (e) => {
    e.preventDefault();

    // jika kosong tidak akan mengirim
    if(form.querySelector('textarea[name="prompt"]').value.trim().length == 0) {
        return;
    }

    // disabled submit
    form.querySelector('button').disabled = true;

    const data = new FormData(form);

    // generate user chatstripe
    chatContainer.innerHTML += chatStrip(false, data.get('prompt'));

    form.reset();

    // generate bot chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStrip(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    // mengirim data ke server -> bot's response
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
        })
    });

    clearInterval(loadInterval);

    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        console.log(parsedData);
        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong!";

        alert(err);
    }

    // emabled submit
    form.querySelector('button').disabled = false;
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) { // ketika enter
        handleSubmit(e);
    }
})