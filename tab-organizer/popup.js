document.addEventListener('DOMContentLoaded', function () {
    let printTabsBtn = document.getElementById('organize-tabs');

    printTabsBtn.addEventListener('click', function () {
        chrome.tabs.query({}, function (tabs) {
            let tabTitles = tabs.map(tab => tab.title);
            let tabUrls = tabs.map(tab => tab.url);

            let organizePrompt = `Come up with logical groupings for these ${tabTitles.length} open browser tabs: : \n\n`;
            tabTitles.forEach((title, i) => {
                organizePrompt += `Tab ${i + 1} - ${title} (${tabUrls[i]})\n`;
            });
            organizePrompt += '. Provide the response in JSON format, where the key is the name of the logical grouping (make sure this does not just say group 1...), and the value is an array of numbers indicating which tabs are in that group. Please try to limit the number of groups to at most half of the total number of tabs.';

            console.log('on click, the organize prompt is: ' + organizePrompt);
            organizeTabs(organizePrompt);
        })
    });
});

async function organizeTabs(organizePrompt) {
    console.log('ORGANIZE TABS HAS BEEN CLICKED!')
    try {
        const response = await fetch('http://localhost:3000/organizeTabs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ organizePrompt })
        });

        const data = await response.json();

        console.log('DATA RETURNED FROM OPENAI: ' + JSON.stringify(data));

        let responseContent = data.content; // Parse the content string
        responseContent = responseContent.replace(/\\n/g, '');
        responseContent = responseContent.replace(/\\"/g, '"');
        console.log('content after removing special characters: ' + responseContent);
        responseContent = JSON.parse(responseContent);

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

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function setTabGroupings(groupName, tabIdsForGrouping) {
    const groupId =  await chrome.tabs.group({tabIds: tabIdsForGrouping});
    await chrome.tabGroups.update(groupId, { title: groupName });
}
