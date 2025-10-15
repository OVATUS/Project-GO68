import { useParams, useNavigate } from "react-router-dom";

export default function CancelOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCancel = () => {
    alert(`Order ${id} cancelled`);
    navigate("/orders/my");
  };

  return (
    <div className="text-center p-10">
      <h1 className="text-2xl mb-4">Cancel Order #{id}</h1>
      <button
        onClick={handleCancel}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Confirm Cancel
      </button>
    </div>
  );
}
