import { useEffect } from "react";
import { Form, useNavigate, useOutletContext } from "react-router-dom";

function Login() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/leave");
  }, [user]);

  return (
    <div className="flex h-full flex-col justify-center items-center">
      <h1 className="mb-6 text-4xl font-bold">Login</h1>
      <Form className="flex flex-col" action="/login" method="post">
        <input
          className="w-96 h-14 mb-2 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
          type="text"
          name="username"
          placeholder="Username"
        />
        <input
          className="w-96 h-14 mb-6 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="px-6 py-4 bg-blue-300 font-semibold rounded-md outline-none hover:bg-blue-400 active:bg-blue-500 focus:ring-2 focus:ring-blue-500"
          type="submit"
        >
          Submit
        </button>
      </Form>
    </div>
  );
}

export default Login;
