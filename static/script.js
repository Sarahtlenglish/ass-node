document.addEventListener("DOMContentLoaded", () => {
    loadDataFromLocalstorage();
    displayInitialSuggestions(); // This function will now target the static container
});

const displayInitialSuggestions = () => {
    const suggestions = [
        "Hjælp mig igang med Amazon...",
        "Hvad er nyt...",
        "Hvad er jeres kompetencer..",
        // Add more suggestions as desired
    ];

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions-container");
    suggestionsContainer.id = "suggestions-container"; // Adding an ID for easy reference

    suggestions.forEach(suggestion => {
        const suggestionBtn = document.createElement("button");
        suggestionBtn.textContent = suggestion;
        suggestionBtn.classList.add("suggestion-btn");
        suggestionBtn.onclick = () => {
            chatInput.value = suggestion; // Pre-fill chat input with the suggestion
            handleOutgoingChat(); // Simulate sending the message
            
            // Remove the suggestions container after a suggestion is chosen
            const containerToRemove = document.getElementById('suggestions-container');
            if (containerToRemove) {
                containerToRemove.remove();
            }
        };
        suggestionsContainer.appendChild(suggestionBtn);
    });

    // Append the suggestionsContainer to a specific location in your chat interface,
    // depending on your page structure. For example, at the end of the chatContainer:
    chatContainer.appendChild(suggestionsContainer); // Adjust based on your layout
};


const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Nørgård Mikkelsen</h1>
                            <p>Velkommen til Nørgård Mikkelsen-guide. <br>
                            Her finder du information og ressourcer om Nørgård Mikkelsen og vores produkter.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "http://localhost:3000/chat";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: userText
        })
    }


    // Send POST request to your Flask server, get response and set the response as paragraph element text
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.response.trim(); // Assuming the response JSON has a key 'response'
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}


const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                    <img src="chatbot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if(!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                    <img src="usericon.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}


deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Er du sikker på at du vil slette samtalen?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);


// Example: Call updateChatHistorySidebar when a new chat is added
// Integrate this into your existing chat handling functions
