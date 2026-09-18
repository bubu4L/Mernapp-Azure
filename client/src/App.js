import React, { useEffect, useState } from "react";

// In production (deployed to Azure), the React build is served BY
// the same Express server, from the same origin - so a relative path
// like "/api/items" is all that's needed. Locally, the "proxy" field
// in client/package.json forwards this same relative path to
// http://localhost:5000 during `npm start`, so this code doesn't
// need to change between environments.
const API_URL = "/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const fetchItems = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setItems)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
      .then((res) => res.json())
      .then(() => {
        setName("");
        setDescription("");
        fetchItems();
      })
      .catch((err) => setError(err.message));
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => fetchItems())
      .catch((err) => setError(err.message));
  };

  return (
    <div className="app">
      <h1>MERN on Azure - Items</h1>

      {error && <p className="error">Error: {error}</p>}

      <form onSubmit={handleSubmit} className="item-form">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Item</button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item._id}>
            <span>
              <strong>{item.name}</strong>
              {item.description ? ` - ${item.description}` : ""}
            </span>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
