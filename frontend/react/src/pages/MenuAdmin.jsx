import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialMenu = [
  { id: 1, name: "Spaghetti", description: "Pasta with sauce", price: 12 },
  { id: 2, name: "Pizza", description: "Cheese pizza", price: 10 },
];

export default function MenuAdmin() {
  const [menu, setMenu] = useState(initialMenu);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      setMenu(menu.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Menu Admin</h1>
      <Link
        to="/menu/add"
        className="mb-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Menu
      </Link>
      <div className="space-y-4">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-4 bg-gray-100 rounded shadow"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
              <p className="font-bold mt-1">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/menu/edit/${item.id}`}
                className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
