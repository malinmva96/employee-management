import { Dialog } from "@headlessui/react";
import { useEffect } from "react";
import { Fragment, useReducer, useState } from "react";
import {
  Form,
  Link,
  Navigate,
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

function App() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [dialog, updateDialog] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  const open = (data) => {
    updateDialog(data);
  };

  const close = () => {
    updateDialog(null);
  };

  return (
    <Fragment>
      <div className="flex h-full">
        <ul className="flex w-[256px] py-3 bg-blue-300 flex-col">
          <li>
            <NavLink
              to="/leave"
              className={({ isActive }) =>
                `block w-full ${
                  isActive ? "bg-blue-400/60" : "hover:bg-blue-400/30"
                }`
              }
            >
              {({ isActive }) => (
                <Fragment>
                  <span className="block w-full p-4">Leave Management</span>
                  {isActive && (
                    <ul className="flex flex-col">
                      <li>
                        <NavLink
                          to="/leave"
                          className={({ isActive }) =>
                            `block w-full p-4 pl-12 ${
                              isActive
                                ? "bg-blue-400/80 font-semibold"
                                : "hover:bg-blue-400/30"
                            }`
                          }
                          end
                        >
                          My requests
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/leave/manager"
                          className={({ isActive }) =>
                            `block w-full p-4 pl-12 ${
                              isActive
                                ? "bg-blue-400/80 font-semibold"
                                : "hover:bg-blue-400/30"
                            }`
                          }
                          end
                        >
                          Pending requests
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </Fragment>
              )}
            </NavLink>
            {/* {enable} */}
          </li>
          <li>
            <div className="block w-full">
              <span className="block w-full p-4">Attendence Tracking</span>
            </div>
          </li>
          <li>
            <div className="block w-full">
              <span className="block w-full p-4">Payroll Generation</span>
            </div>
          </li>
          <li className="mt-auto">
            <Form action="/login" method="delete">
              <button className="block w-full p-4 text-left hover:bg-blue-400/30">
                Sign out
              </button>
            </Form>
          </li>
        </ul>
        <div className="flex-1 h-full overflow-auto">
          <Outlet
            context={{
              dialog: { open, close },
              user,
            }}
          />
        </div>
      </div>
      <Dialog open={dialog !== null} onClose={close} className="relative z-50">
        <div
          className="fixed inset-0 flex bg-black/30 justify-center items-center"
          aria-hidden="true"
        >
          {dialog && (
            <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white">
              <Dialog.Title className="p-4 text-2xl font-bold border-b border-gray-300">
                {dialog.title}
              </Dialog.Title>
              <div className="p-4">
                <Dialog.Description className="mb-4">
                  {dialog.description}
                </Dialog.Description>
                {dialog.body}
              </div>
              <div className="flex px-4 py-3 justify-end gap-2 border-t border-gray-300">
                {dialog.primary && (
                  <button
                    className="px-6 py-3 bg-blue-300 font-semibold rounded-md outline-none hover:bg-blue-400 active:bg-blue-500 focus:ring-2 focus:ring-blue-500"
                    onClick={dialog.primary.onClick}
                  >
                    {dialog.primary.label}
                  </button>
                )}
                {dialog.secondary && (
                  <button
                    className="px-6 py-3 bg-red-300 font-semibold rounded-md outline-none hover:bg-red-400 active:bg-red-500 focus:ring-2 focus:ring-blue-500"
                    onClick={dialog.secondary.onClick}
                  >
                    {dialog.secondary.label}
                  </button>
                )}
              </div>
            </Dialog.Panel>
          )}
        </div>
      </Dialog>
    </Fragment>
  );
}

export default App;
