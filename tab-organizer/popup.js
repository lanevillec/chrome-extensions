// Event listener for when the document is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Reference to the button element for organizing tabs
    let printTabsBtn = document.getElementById('organize-tabs');

    // Event listener for button click
    printTabsBtn.addEventListener('click', function () {
        // Query all open tabs
        chrome.tabs.query({}, function (tabs) {
            // Extract tab titles and URLs
            let tabTitles = tabs.map(tab => tab.title);
            let tabUrls = tabs.map(tab => tab.url);

            // Construct a prompt for organizing tabs
            let organizePrompt = buildOrganizePrompt(tabTitles, tabUrls);

            console.log('on click, the organize prompt is: ' + organizePrompt);
            // Call the organizeTabs function with the constructed prompt
            organizeTabs(organizePrompt);
        });
    });
});

// Function to build the prompt for organizing tabs
function buildOrganizePrompt(tabTitles, tabUrls) {
    let prompt = `Come up with logical groupings for these ${tabTitles.length} open browser tabs: : \n\n`;
    tabTitles.forEach((title, i) => {
        prompt += `Tab ${i + 1} - ${title} (${tabUrls[i]})\n`;
    });
    prompt += '. Provide the response in JSON format, where the key is the name of the logical grouping, and the value is an array of numbers indicating which tabs are in that group. Please try to limit the number of groups to at most half of the total number of tabs.';
    return prompt;
}

// Function to handle tab organization
async function organizeTabs(organizePrompt) {
    console.log('ORGANIZE TABS HAS BEEN CLICKED!');
    try {
        // Make a POST request to the server with the organize prompt
        const response = await fetch('http://34.150.217.200:8079/organizeTabs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizePrompt })
        });

        const data = await response.json();

        console.log('DATA RETURNED FROM OPENAI: ' + JSON.stringify(data));

        // Parse and clean up the content string
        let responseContent = parseContent(data.content);

        // Organize tabs into groups based on the response content
        await organizeTabsIntoGroups(responseContent);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Function to parse and clean up the content string
function parseContent(content) {
    content = content.replace(/\\n/g, '');
    content = content.replace(/\\"/g, '"');
    console.log('content after removing special characters: ' + content);
    return JSON.parse(content);
}

// Function to organize tabs into groups
async function organizeTabsIntoGroups(responseContent) {
    await chrome.tabs.query({}, function (tabs) {
        Object.keys(responseContent).forEach(groupName => {
            let tabIndices = responseContent[groupName];

            if (!Array.isArray(tabIndices)) {
                console.error('tabIndices is not an array for group:', groupName);
                return;
            }

            let tabIdsForGrouping = tabIndices.map(index => tabs[index - 1].id);

            setTabGroupings(groupName, tabIdsForGrouping);
        });
    });
}

// Function to set the tab groupings
async function setTabGroupings(groupName, tabIdsForGrouping) {
    const groupId = await chrome.tabs.group({tabIds: tabIdsForGrouping});
    await chrome.tabGroups.update(groupId, { title: groupName });
}
