// Get info about all open tabs
export async function getTabs() {
    return chrome.tabs.query({}); 
  }
  
  // Group tabs under a title 
  export async function groupTabs(title, tabIds) {
    const groupId = await chrome.tabs.group({tabIds});
    await chrome.tabGroups.update(groupId, {title});
  }