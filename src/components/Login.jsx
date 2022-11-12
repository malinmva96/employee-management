import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import {
  Form,
  useNavigate,
  useOutletContext,
  useRouteError,
} from "react-router-dom";

function Login() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const error = useRouteError();

  useEffect(() => {
    if (user) navigate("/leave");
  }, [user]);

  return (
    <div className="flex w-96 h-full mx-auto text-center flex-col justify-center items-stretch">
      <h1 className="mb-6 text-4xl font-bold">Login</h1>
      <Form className="flex mb-4 flex-col" action="/login" method="post">
        <input
          className="w-full h-14 mb-2 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
          type="text"
          name="username"
          placeholder="Username"
        />
        <input
          className="w-full h-14 mb-6 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
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
      {error && (
        <label className="flex w-full px-5 py-4 bg-red-200 text-red-900 justify-center font-semibold rounded-md items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4" />
          <span>{error.message}</span>
        </label>
      )}
    </div>
  );
}

export default Login;
