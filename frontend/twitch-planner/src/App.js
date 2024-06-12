import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { title };
    console.log("Sending data:", data);  // Log the data to be sent
    try {
      const response = await axios.post('http://localhost:5000/api/submit', data);
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Twitch Stream Planner</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Stream Title:
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </header>
    </div>
  );
}

export default App;
