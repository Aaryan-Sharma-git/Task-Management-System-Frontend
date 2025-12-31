import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTaskById,
  updateTask,
  deleteTask,
  getAllUsers,
} from "../api/taskApi";
import type { Task, TaskPriority, User } from "../interfaces/taskInterface";
import { ArrowLeft } from "lucide-react";
import useAuth from "../hooks/useAuth";

const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const taskData = await getTaskById(id!);
        setTask(taskData);

        // 🔒 Only admin can fetch all users
        if (user?.role === "admin") {
          const usersData = await getAllUsers();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!task) {
    return <p className="text-center text-red-500">Task not found</p>;
  }

  const handleSave = async () => {
    await updateTask(task._id, task);
    setEditMode(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;

    await deleteTask(task._id);
    navigate(-1);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* Title + Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Details</h2>

          {isAdmin && (
            <div className="flex gap-2">
              {!editMode && (
                <button
                  onClick={handleDelete}
                  className="bg-red-100 text-red-700 px-4 py-1 rounded"
                >
                  Delete
                </button>
              )}

              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            disabled={!editMode}
            value={task.title}
            onChange={(e) =>
              setTask({ ...task, title: e.target.value })
            }
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            disabled={!editMode}
            value={task.description}
            onChange={(e) =>
              setTask({ ...task, description: e.target.value })
            }
            className="w-full border rounded-md p-2"
            rows={4}
          />
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="datetime-local"
            disabled={!editMode}
            value={task.dueDate.slice(0, 16)}
            onChange={(e) =>
              setTask({ ...task, dueDate: e.target.value })
            }
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            disabled={!editMode}
            value={task.priority}
            onChange={(e) =>
              setTask({
                ...task,
                priority: e.target.value as TaskPriority,
              })
            }
            className="w-full border rounded-md p-2"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Assigned User (ADMIN ONLY) */}
        {isAdmin && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Assigned To
            </label>
            <select
              disabled={!editMode}
              value={task.assignedTo?._id || ""}
              onChange={(e) =>
                setTask({
                  ...task,
                  assignedTo: users.find(
                    (u) => u._id === e.target.value
                  ),
                })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Save */}
        {editMode && isAdmin && (
          <button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsPage;
