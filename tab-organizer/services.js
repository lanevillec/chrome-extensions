// Make API call to organize tabs
export async function organizeTabs(prompt) {
    const response = await fetch('http://localhost:3000/organizeTabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({prompt})
    });
    return response.json();
  }