import "./App.css";
import Axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const App = () => {
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  //adding todos
  const addTodo = () => {
    setLoading(true);
    setLoadingText("Adding task...");
    if (todo === "") {
      Swal.fire({
        icon: "error",
        title: "Please enter a task!",
      });
    } else {
      Axios.post("https://todolistapp-backend.herokuapp.com/addTodo", {
        name: todo,
      }).then((response) => {
        setLoading(false);
        setLoadingText("");
        setTodoList([
          ...todoList,
          {
            _id: response.data._id,
            name: todo,
            completed: false,
            createdAt: Date.now(),
            completedAt: "",
          },
        ]);
      });
    }
  };

  //updating a task
  const updateTodo = async (id, oldTodoName) => {
    while (true) {
      const { value: newTodo } = await Swal.fire({
        title: "Update ToDo",
        input: "text",
        inputLabel: "New ToDo",
        inputValue: oldTodoName,
        inputValidator: (value) => {
          if (!value) {
            return "You need to write something!";
          }
        },
      });

      if (newTodo === "") {
        continue;
      } else if (newTodo === false) {
        break;
      } else {
        Axios.put("https://todolistapp-backend.herokuapp.com/update", {
          newTodo,
          id,
        }).then((response) => {
          setTodoList(
            todoList.map((todo) => {
              return todo._id === id
                ? {
                    _id: id,
                    name: newTodo,
                    completed: false,
                    createdAt: Date.now(),
                    completedAt: "",
                  }
                : todo;
            })
          );
          Swal.fire({
            icon: "success",
            title: `${response.data}`,
          });
        });
        break;
      }
    }
  };

  //mark todo as completed
  const completedTodo = (id, todoName, createdAt) => {
    Axios.put(`https://todolistapp-backend.herokuapp.com/completed/${id}`).then(
      (response) => {
        setTodoList(
          todoList.map((todo) => {
            return todo._id === id
              ? {
                  _id: id,
                  name: todoName,
                  completed: true,
                  createdAt: createdAt,
                  completedAt: Date.now(),
                }
              : todo;
          })
        );
        Swal.fire({
          icon: "success",
          title: `${response.data}`,
        });
      }
    );
  };

  //delete a todo
  const deleteTodo = (id) => {
    Axios.delete(`https://todolistapp-backend.herokuapp.com/delete/${id}`).then(
      (response) => {
        setTodoList(
          todoList.filter((todo) => {
            return todo._id !== id;
          })
        );
        Swal.fire({
          icon: "warning",
          title: `${response.data}`,
        });
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    setLoadingText("Loading tasks...");
    Axios.get("https://todolistapp-backend.herokuapp.com/todolist")
      .then((response) => {
        setLoading(false);
        setLoadingText("");
        setTodoList(response.data);
      })
      .catch(() => {
        console.log("error");
      });
  }, []);

  //todo list
  const List = ({ name, completed, createdAt, completedAt, _id }) => {
    return (
      <div className="flex flex-col justify-between items-center">
        <div className={`flex flex-row mt-10 mb-10`}>
          <div
            className={`flex justify-between items-center ${
              completed ? "opacity-50 w-72 md:w-96" : "w-48"
            } p-3 md:w-96 border-2  bg-teal-100 border-teal-300 m-0 rounded-tl-md rounded-bl-md`}
          >
            <div
              className={`text-lg md:text-xl ${
                completed ? "line-through" : ""
              }`}
            >
              {name}
            </div>
            <div className="flex flex-col text-slate-400">
              <h2 className="text-xs py-0.5">
                {completed
                  ? new Date(completedAt).toLocaleDateString()
                  : new Date(createdAt).toLocaleDateString()}
              </h2>
              <h2 className="text-xs py-0.5">
                {completed
                  ? new Date(completedAt).toLocaleTimeString()
                  : new Date(createdAt).toLocaleTimeString()}
              </h2>
            </div>
          </div>
          <button
            onClick={() => updateTodo(_id, name)}
            className={`text-sm w-16 p-1 outline-none bg-teal-400 m-0 text-white ${
              completed ? "hidden" : ""
            }`}
            disabled={completed}
          >
            Update
          </button>
          <button
            onClick={() => completedTodo(_id, name, createdAt)}
            className={`text-sm w-12 p-1 outline-none bg-green-400 m-0 text-white ${
              completed ? "hidden" : ""
            }`}
            disabled={completed}
          >
            ✓
          </button>
          <button
            onClick={() => deleteTodo(_id)}
            className={`${
              completed ? "w-16 text-2xl" : "w-12 "
            } p-1 bg-rose-600 outline-none text-white m-0 rounded-tr-md rounded-br-md`}
          >
            X
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden font-mono">
      <div className="flex flex-col items-center justify-center border-solid border-2 border-teal-100 bg-teal-100 w-screen p-20">
        <h2 className="text-4xl md:w-96 md:text-5xl mb-30 md:mb-32 text-center font-bold border-solid border-8 border-teal-500 p-4 rounded-lg">
          My ToDo List
        </h2>
        <div className="flex justify-between items-center mt-20 py-2 border-b border-teal-500">
          <input
            className=" text-xl md:text-3xl bg-teal-100 text-gray-700 p-1 outline-none focus:outline-none w-52 md:w-96"
            type="text"
            placeholder="Task..."
            required
            value={todo}
            onChange={(event) => {
              setTodo(event.target.value);
            }}
          />
          <input
            type="submit"
            onClick={() => {
              addTodo();
              setTodo("");
            }}
            value="Add"
            className="w-20 md:w-24 p-2 bg-teal-500 text-white text-md md:text-2xl cursor-pointer rounded"
          />
        </div>
      </div>

      <div>
        <div className="mt-20">
          <h2 className="text-3xl mb-10 text-center underline underline-offset-8">
            Planned
          </h2>
          {loading ? (
            <div className="text-center text-2xl mt-2 text-slate-500">
              {loadingText}
            </div>
          ) : (
            <div></div>
          )}
          {todoList.map((todo) => {
            return (
              <>
                {!todo.completed && (
                  <List
                    name={todo.name}
                    completed={todo.completed}
                    createdAt={todo.createdAt}
                    completedAt={todo.completedAt}
                    _id={todo._id}
                  />
                )}
              </>
            );
          })}
        </div>
        <div className="mt-40 mb-30">
          <h2 className="text-3xl mb-10 text-center underline underline-offset-8">
            Completed
          </h2>
          {todoList.map((todo) => {
            return (
              <>
                {todo.completed && (
                  <List
                    name={todo.name}
                    completed={todo.completed}
                    createdAt={todo.createdAt}
                    completedAt={todo.completedAt}
                    _id={todo._id}
                  />
                )}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
