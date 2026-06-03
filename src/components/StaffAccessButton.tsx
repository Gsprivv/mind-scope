import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function StaffAccessButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user?.isStaff) {
      navigate("/staff/users");
      return;
    }
    navigate("/staff");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="h-2 w-2 shrink-0 rounded-full bg-sage-300/70 hover:bg-sage-400 dark:bg-slate-600/80 dark:hover:bg-slate-500"
      aria-label={user?.isStaff ? "Staff admin" : "Staff portal"}
      title={user?.isStaff ? "Staff admin" : "Staff portal"}
    />
  );
}
