let openedSettings = false;

let userSettings = {
    'amount-of-images': 4,
    'rem-back': true
}

let settingsHTML;
const settingTextSelector = 'p.setting-p-box > input[type="text"]';
const settingToggleSelector = 'button.toggle-switch';
const promptInputSelector = '#prompt-input';
const settingsDivSelector = 'div#settings-js';
const generationShowResultsSelector = 'div#gen-results > div#show-images-js';
const generationResultsInfoSelector = 'div#gen-results > p#gen-results-info-js';

fetch('/Main Page/settings.html')
    .then(response => response.text())
    .then(html => {
        settingsHTML = new DOMParser().parseFromString(html, 'text/html');
    })

function handleSettingsIconClick() {
    openedSettings ? hideSettings() : showSettings()
    openedSettings = !openedSettings
}

function showSettings() {
    const settingsDiv = document.querySelector(settingsDivSelector);
    settingsHTML.querySelectorAll(settingTextSelector).forEach(setting => {
        setting.placeholder = userSettings[setting.id];
    })
    settingsHTML.querySelectorAll(settingToggleSelector).forEach(setting => {
        if (userSettings[setting.id]) {
            setting.innerText = 'ON';
            // setting.classList = ['toggle-switch', 'on-state']; // need to research why it doesnt work like this
            setting.classList = 'toggle-switch on-state';
            // setting.classList.remove('off-state');  // need to research why it doesnt work without this
            // setting.classList.add('on-state');
        } else {
            setting.innerText = 'OFF';
            // setting.classList = ['toggle-switch', 'off-state'];
            setting.classList = 'toggle-switch off-state';
            // setting.classList.remove('on-state');  // need to research why it didnt work without this
            // setting.classList.add('off-state');
        }
    })
    settingsDiv.innerHTML = settingsHTML.documentElement.innerHTML;
}


function hideSettings() {
    const settingsDiv = document.querySelector(settingsDivSelector);
    settingsDiv.querySelectorAll(settingTextSelector).forEach(setting => {
        if (setting.value) userSettings[setting.id] = setting.value;
    });
    settingsDiv.querySelectorAll(settingToggleSelector).forEach(setting => {
        setting.innerHTML === 'ON' ? userSettings[setting.id] = true : userSettings[setting.id] = false;
    })
    settingsDiv.innerHTML = null;
}

async function query(data) {
    const response = await fetch(
        'https://api-inference.huggingface.co/models/prompthero/openjourney',
        {
            headers: { Authorization: 'Bearer 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' },
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
    return await response.blob();
}

function createImages(prompt, amount) {
    const generationShowResultsElement = document.querySelector(generationShowResultsSelector);
    // const generationResultsInfoElement = document.querySelector(generationResultsInfoSelector);
    for (let i = 0; i < amount; i++) {
        query({'inputs': prompt}).then((response) => {
            const url = URL.createObjectURL(response);
            const img = new Image();
            img.src = url;
            generationShowResultsElement.appendChild(img);
            // generationResultsInfoElement.innerHTML = `Still generating... ${amount - (i + 1)} left.`;
        });
    }
    // generationResultsInfoElement.innerHTML = null;
}

// function changeToggleButtonState(event) {
//     console.log(event);
//     console.log(event.target);
//     if (event.target.classList.contains('on-state')) {
//         event.target.classList.remove('on-state')
//         event.target.classList.add('off-state')
//         event.target.innerHTML = 'OFF'
//     } else {
//         event.target.classList.remove('off-state')
//         event.target.classList.add('on-state')
//         event.target.innerHTML = 'ON'
//     }
// }

function submitPrompt(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const userInput = event.target.value;
        event.target.value = '';
        const generationResultsInfoElement = document.querySelector(generationResultsInfoSelector);
        // generationResultsInfoElement.innerHTML = 'Generating images...';
        generationResultsInfoElement.innerHTML = null;
        hideSettings();
        openedSettings = false;
        userSettings['amount-of-images'] > 10 ? createImages(userInput, 10)
            : createImages(userInput, userSettings['amount-of-images']);
    }
}

const promptInputElement = document.querySelector(promptInputSelector)
promptInputElement.addEventListener('keydown', submitPrompt);


